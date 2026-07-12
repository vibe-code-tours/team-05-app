import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("notifications")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "Get user notifications" })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  getNotifications(
    @CurrentUser() user: { id: string },
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.notificationService.getNotifications(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get("unread-count")
  @ApiOperation({ summary: "Get unread notification count" })
  getUnreadCount(@CurrentUser() user: { id: string }) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Put(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notification as read" })
  markAsRead(
    @CurrentUser() user: { id: string },
    @Param("id") notificationId: string,
  ) {
    return this.notificationService.markAsRead(user.id, notificationId);
  }

  @Put("read-all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark all notifications as read" })
  markAllAsRead(@CurrentUser() user: { id: string }) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete a notification" })
  deleteNotification(
    @CurrentUser() user: { id: string },
    @Param("id") notificationId: string,
  ) {
    return this.notificationService.deleteNotification(user.id, notificationId);
  }
}
