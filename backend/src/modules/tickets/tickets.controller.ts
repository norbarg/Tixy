//tickets.controller.ts
import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TicketsService } from './tickets.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('order/:orderId')
  async getOrderTicket(
    @Param('orderId') orderId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.ticketsService.generateOrderTicketPdf(
      orderId,
      user,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ticket-${orderId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
  @Get('preview/order/:orderId')
  async previewOrderTicket(
    @Param('orderId') orderId: string,
    @Res() res: Response,
  ) {
    const pdfBuffer =
      await this.ticketsService.generatePreviewTicketPdf(orderId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ticket-preview-${orderId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
