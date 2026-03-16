import { Controller, Headers, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout/:orderId')
  createCheckout(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.paymentsService.createCheckoutSession(orderId, user.sub);
  }

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    const event = this.paymentsService.constructWebhookEvent(
      req.rawBody as Buffer,
      signature,
    );

    if (event.type === 'checkout.session.completed') {
      await this.paymentsService.handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
    }

    return { received: true };
  }
}
