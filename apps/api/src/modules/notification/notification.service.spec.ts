import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { PrismaService } from "../../config/prisma.service";

describe("NotificationService", () => {
  let service: NotificationService;
  let prisma: Record<string, any>;

  const mockUserId = "user-123";
  const mockNotificationId = "notif-123";

  const mockNotification = {
    id: mockNotificationId,
    userId: mockUserId,
    title: "Order Confirmed",
    message: "Your order #ORD-001 has been confirmed.",
    type: "ORDER",
    read: false,
    data: { orderId: "ORD-001" },
    createdAt: new Date("2026-07-12T10:00:00.000Z"),
  };

  const mockUser = {
    id: mockUserId,
    email: "test@example.com",
    name: "Test User",
    role: "CLIENT",
  };

  beforeEach(async () => {
    prisma = {
    dbConnected: true,
      notification: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ── getNotifications ────────────────────────────────────────────────────

  describe("getNotifications", () => {
    it("should return paginated notifications", async () => {
      prisma.notification.findMany.mockResolvedValue([mockNotification]);
      prisma.notification.count
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(0); // unreadCount

      const result = await service.getNotifications(mockUserId, 1, 20);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.unreadCount).toBe(0);
    });

    it("should return empty array when no notifications", async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      const result = await service.getNotifications(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it("should use default pagination values", async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      await service.getNotifications(mockUserId);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it("should calculate skip correctly for page 2", async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      await service.getNotifications(mockUserId, 2, 10);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  // ── markAsRead ──────────────────────────────────────────────────────────

  describe("markAsRead", () => {
    it("should mark notification as read", async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.update.mockResolvedValue({ ...mockNotification, read: true });

      const result = await service.markAsRead(mockUserId, mockNotificationId);

      expect(result.success).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: mockNotificationId },
        data: { read: true },
      });
    });

    it("should throw if notification not found", async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.markAsRead(mockUserId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if notification belongs to another user", async () => {
      prisma.notification.findUnique.mockResolvedValue({
        ...mockNotification,
        userId: "other-user",
      });

      await expect(
        service.markAsRead(mockUserId, mockNotificationId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── markAllAsRead ───────────────────────────────────────────────────────

  describe("markAllAsRead", () => {
    it("should mark all notifications as read", async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.markAllAsRead(mockUserId);

      expect(result.success).toBe(true);
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUserId, read: false },
        data: { read: true },
      });
    });
  });

  // ── getUnreadCount ──────────────────────────────────────────────────────

  describe("getUnreadCount", () => {
    it("should return unread count", async () => {
      prisma.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(3);
    });

    it("should return 0 when all read", async () => {
      prisma.notification.count.mockResolvedValue(0);

      const result = await service.getUnreadCount(mockUserId);

      expect(result.data.count).toBe(0);
    });
  });

  // ── deleteNotification ──────────────────────────────────────────────────

  describe("deleteNotification", () => {
    it("should delete notification", async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.delete.mockResolvedValue(mockNotification);

      const result = await service.deleteNotification(mockUserId, mockNotificationId);

      expect(result.success).toBe(true);
      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: mockNotificationId },
      });
    });

    it("should throw if notification not found", async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteNotification(mockUserId, "nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw if notification belongs to another user", async () => {
      prisma.notification.findUnique.mockResolvedValue({
        ...mockNotification,
        userId: "other-user",
      });

      await expect(
        service.deleteNotification(mockUserId, mockNotificationId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── create (internal) ──────────────────────────────────────────────────

  describe("create", () => {
    it("should create a notification", async () => {
      prisma.notification.create.mockResolvedValue(mockNotification);

      const result = await service.create(
        mockUserId,
        "Order Confirmed",
        "Your order has been confirmed.",
        "ORDER",
        { orderId: "ORD-001" },
      );

      expect(result).toEqual(mockNotification);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          title: "Order Confirmed",
          message: "Your order has been confirmed.",
          type: "ORDER",
          data: { orderId: "ORD-001" },
        },
      });
    });

    it("should create notification without data", async () => {
      prisma.notification.create.mockResolvedValue(mockNotification);

      await service.create(
        mockUserId,
        "Welcome",
        "Welcome to CrossMart!",
        "ACCOUNT",
      );

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          title: "Welcome",
          message: "Welcome to CrossMart!",
          type: "ACCOUNT",
          data: undefined,
        },
      });
    });
  });

  // ── adminCreateNotification ─────────────────────────────────────────────

  describe("adminCreateNotification", () => {
    it("should create notification for a user", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.notification.create.mockResolvedValue(mockNotification);

      const result = await service.adminCreateNotification({
        userId: mockUserId,
        title: "System Maintenance",
        message: "Scheduled maintenance tonight.",
        type: "SYSTEM",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNotification);
    });

    it("should throw if user not found", async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.adminCreateNotification({
          userId: "nonexistent",
          title: "Test",
          message: "Test message",
          type: "SYSTEM",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should create notification with data", async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.notification.create.mockResolvedValue(mockNotification);

      await service.adminCreateNotification({
        userId: mockUserId,
        title: "Promotion",
        message: "20% off on all items!",
        type: "PROMOTION",
        data: { discount: 20, code: "SAVE20" },
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          title: "Promotion",
          message: "20% off on all items!",
          type: "PROMOTION",
          data: { discount: 20, code: "SAVE20" },
        },
      });
    });
  });

  // ── adminGetAllNotifications ────────────────────────────────────────────

  describe("adminGetAllNotifications", () => {
    it("should return all notifications", async () => {
      prisma.notification.findMany.mockResolvedValue([
        { ...mockNotification, user: mockUser },
      ]);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.adminGetAllNotifications({});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it("should filter by userId", async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      await service.adminGetAllNotifications({ userId: mockUserId });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: mockUserId }),
        }),
      );
    });

    it("should filter by read status", async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      await service.adminGetAllNotifications({ read: true });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ read: true }),
        }),
      );
    });

    it("should filter by type", async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      await service.adminGetAllNotifications({ type: "ORDER" });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: "ORDER" }),
        }),
      );
    });

    it("should combine multiple filters", async () => {
      prisma.notification.findMany.mockResolvedValue([]);
      prisma.notification.count.mockResolvedValue(0);

      await service.adminGetAllNotifications({
        userId: mockUserId,
        read: false,
        type: "PAYMENT",
      });

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            read: false,
            type: "PAYMENT",
          }),
        }),
      );
    });
  });

  // ── adminDeleteNotification ─────────────────────────────────────────────

  describe("adminDeleteNotification", () => {
    it("should delete any notification", async () => {
      prisma.notification.findUnique.mockResolvedValue(mockNotification);
      prisma.notification.delete.mockResolvedValue(mockNotification);

      const result = await service.adminDeleteNotification(mockNotificationId);

      expect(result.success).toBe(true);
      expect(prisma.notification.delete).toHaveBeenCalledWith({
        where: { id: mockNotificationId },
      });
    });

    it("should throw if notification not found", async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(
        service.adminDeleteNotification("nonexistent"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
