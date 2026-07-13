import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // ── User Endpoints ──────────────────────────────────────────────────────

  async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      success: true,
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), unreadCount },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    if (notification.userId !== userId) {
      throw new NotFoundException("Notification not found");
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { success: true, message: "All notifications marked as read" };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return { success: true, data: { count } };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException("Notification not found");
    }

    await this.prisma.notification.delete({ where: { id: notificationId } });

    return { success: true };
  }

  // ── Internal: Create notification (used by other modules) ────────────────

  async create(userId: string, title: string, message: string, type: string, data?: any) {
    return this.prisma.notification.create({
      data: { userId, title, message, type, data },
    });
  }

  // ── Admin Endpoints ─────────────────────────────────────────────────────

  async adminCreateNotification(dto: {
    userId: string;
    title: string;
    message: string;
    type: string;
    data?: Prisma.InputJsonValue;
  }) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        data: dto.data,
      },
    });

    return { success: true, data: notification };
  }

  async adminGetAllNotifications(query: {
    page?: number;
    limit?: number;
    read?: boolean;
    type?: string;
    userId?: string;
  }) {
    const { page = 1, limit = 20, read, type, userId } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (read !== undefined) where.read = read;
    if (type) where.type = type;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      success: true,
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminDeleteNotification(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException("Notification not found");
    }

    await this.prisma.notification.delete({ where: { id: notificationId } });

    return { success: true };
  }
}
