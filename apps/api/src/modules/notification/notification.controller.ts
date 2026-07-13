import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { NotificationService } from "./notification.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  CreateNotificationDto,
  NotificationQueryDto,
  AdminNotificationQueryDto,
} from "./dto/notification.dto";

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("notifications")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  // ── User Endpoints ──────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: "Get user notifications" })
  getNotifications(
    @CurrentUser() user: { id: string },
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationService.getNotifications(
      user.id,
      query.page ?? 1,
      query.limit ?? 20,
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

  // ── Admin Endpoints ─────────────────────────────────────────────────────

  @Post("admin")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Admin: Create notification for a user" })
  adminCreateNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationService.adminCreateNotification(dto);
  }

  @Get("admin")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @ApiOperation({ summary: "Admin: Get all notifications" })
  adminGetAllNotifications(@Query() query: AdminNotificationQueryDto) {
    return this.notificationService.adminGetAllNotifications(query);
  }

  @Delete("admin/:id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Delete any notification" })
  adminDeleteNotification(@Param("id") notificationId: string) {
    return this.notificationService.adminDeleteNotification(notificationId);
  }
}
