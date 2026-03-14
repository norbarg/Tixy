//src/modules/notifications/notifications.controller.ts
import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('my')
  getMyNotifications(@CurrentUser() user: { sub: string }) {
    return this.notificationsService.getMyNotifications(user.sub);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: { sub: string }) {
    return this.notificationsService.markAllAsRead(user.sub);
  }
}
