import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('events/:eventId')
  subscribeToEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.subscriptionsService.subscribeToEvent(user.sub, eventId);
  }

  @Delete('events/:eventId')
  unsubscribeFromEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.subscriptionsService.unsubscribeFromEvent(user.sub, eventId);
  }

  @Post('companies/:companyId')
  subscribeToCompany(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.subscriptionsService.subscribeToCompany(user.sub, companyId);
  }

  @Delete('companies/:companyId')
  unsubscribeFromCompany(
    @Param('companyId') companyId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.subscriptionsService.unsubscribeFromCompany(
      user.sub,
      companyId,
    );
  }

  @Get('my')
  getMySubscriptions(@CurrentUser() user: { sub: string }) {
    return this.subscriptionsService.getMySubscriptions(user.sub);
  }
}
