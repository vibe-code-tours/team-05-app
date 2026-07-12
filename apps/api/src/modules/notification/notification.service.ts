import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

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

  /**
   * Internal: Create notification for a user
   */
  async create(userId: string, title: string, message: string, type: string, data?: any) {
    return this.prisma.notification.create({
      data: { userId, title, message, type, data },
    });
  }
}
