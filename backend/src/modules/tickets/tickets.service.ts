import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Order } from '../../database/entities/orders.entity';
import { Event } from '../../database/entities/events.entity';
import { Company } from '../../database/entities/companies.entity';
import { User } from '../../database/entities/users.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async generateOrderTicketPdf(
    orderId: string,
    currentUser: { sub: string; role: UserRole },
  ): Promise<Buffer> {
    const ticketData = await this.getPaidOrderData(orderId);

    const isOwner = ticketData.order.userId === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    return this.buildSingleTicketPdf({
      ...ticketData,
      ticketIndex: 1,
      totalTickets: ticketData.order.quantity,
    });
  }

  async generatePaidOrderTicketPdfForEmail(orderId: string): Promise<{
    attachments: { filename: string; content: Buffer; contentType: string }[];
    order: Order;
    event: Event;
    user: User;
    company: Company;
  }> {
    const ticketData = await this.getPaidOrderData(orderId);

    const attachments: {
      filename: string;
      content: Buffer;
      contentType: string;
    }[] = [];

    for (let i = 1; i <= ticketData.order.quantity; i += 1) {
      const pdfBuffer = await this.buildSingleTicketPdf({
        ...ticketData,
        ticketIndex: i,
        totalTickets: ticketData.order.quantity,
      });

      attachments.push({
        filename: `ticket-${ticketData.order.id}-${i}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    }

    return {
      attachments,
      order: ticketData.order,
      event: ticketData.event,
      user: ticketData.user,
      company: ticketData.company,
    };
  }

  async generatePreviewTicketPdf(orderId: string): Promise<Buffer> {
    const ticketData = await this.getPaidOrderData(orderId);

    return this.buildSingleTicketPdf({
      ...ticketData,
      ticketIndex: 1,
      totalTickets: ticketData.order.quantity,
    });
  }

  private async getPaidOrderData(orderId: string): Promise<{
    order: Order;
    event: Event;
    user: User;
    company: Company;
  }> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new ForbiddenException('Ticket is available only for paid orders');
    }

    const event = await this.eventsRepository.findOne({
      where: { id: order.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const user = await this.usersRepository.findOne({
      where: { id: order.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const company = await this.companiesRepository.findOne({
      where: { id: event.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return { order, event, user, company };
  }

  private async buildSingleTicketPdf(data: {
    order: Order;
    event: Event;
    user: User;
    company: Company;
    ticketIndex: number;
    totalTickets: number;
  }): Promise<Buffer> {
    const { order, event, ticketIndex, totalTickets } = data;
    const posterBuffer = await this.resolvePosterBuffer(event.posterUrl);
    const barcodeBuffer = await this.readTicketAsset('barcode-red.png');
    const logoBuffer = await this.readTicketAsset('tixy-logo.png');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: [980, 380],
        margin: 0,
      });

      const fontRegular = path.resolve(
        process.cwd(),
        'assets',
        'tickets',
        'fonts',
        'LeagueSpartan-Regular.ttf',
      );

      const fontMedium = path.resolve(
        process.cwd(),
        'assets',
        'tickets',
        'fonts',
        'LeagueSpartan-Medium.ttf',
      );

      doc.registerFont('LeagueSpartan-Regular', fontRegular);
      doc.registerFont('LeagueSpartan-Medium', fontMedium);

      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = 980;
      const pageHeight = 380;

      const red = '#D2222F';
      const lightGray = '#FFFFFF';
      const borderGray = '#E0E3E3';
      const textGray = '#727E8A';
      const blueGray = '#7C94D4';

      doc.rect(0, 0, pageWidth, pageHeight).fill(lightGray).clip();

      doc.rect(0, 0, pageWidth, 70).fill(red);

      doc
        .fillColor('#FFFFFF')
        .fontSize(28)
        .font('LeagueSpartan-Medium')
        .text(event.title, 40, 26, {
          width: 760,
          ellipsis: true,
        });
      doc
        .moveTo(0, 70)
        .lineTo(pageWidth, 70)
        .lineWidth(5)
        .stroke('#000')
        .undash();
      doc
        .moveTo(0, 75)
        .lineTo(pageWidth, 75)
        .dash(8, { space: 2 })
        .lineWidth(2)
        .stroke(borderGray)
        .undash();

      doc.save();
      doc.translate(35, 300);
      doc.rotate(-90);
      doc
        .fillColor(red)
        .font('LeagueSpartan-Regular')
        .fontSize(26)
        .text('EVENT TICKET', 0, 0);
      doc.restore();

      const posterX = 72;
      const posterY = 104;
      const posterW = 220;
      const posterH = 258;

      doc.save();
      doc.roundedRect(posterX, posterY, posterW, posterH, 12).clip();
      doc.image(posterBuffer, posterX, posterY, {
        width: posterW,
        height: posterH,
      });
      doc.restore();

      const infoX = 350;

      doc.fillColor(blueGray).font('LeagueSpartan-Regular').fontSize(18);
      doc.text('DATE', infoX, 110);

      doc.fillColor(textGray).font('LeagueSpartan-Medium').fontSize(16);
      doc.text(this.formatDayMonth(event.startsAt), infoX, 150);
      doc.text(this.formatDayMonth(event.endsAt), infoX + 145, 150);

      doc
        .moveTo(infoX, 175)
        .lineTo(infoX + 138, 175)
        .lineWidth(1)
        .stroke(textGray);

      doc
        .moveTo(infoX + 145, 175)
        .lineTo(infoX + 283, 175)
        .lineWidth(1)
        .stroke(textGray);

      doc.fillColor(blueGray).font('LeagueSpartan-Regular').fontSize(18);
      doc.text('LOCATION', infoX, 200);

      doc.fillColor(textGray).font('LeagueSpartan-Medium').fontSize(16);
      doc.text(event.placeAddress ?? event.placeName ?? '-', infoX, 240, {
        width: 280,
        ellipsis: true,
      });

      doc
        .moveTo(infoX, 262)
        .lineTo(infoX + 262, 262)
        .lineWidth(1)
        .stroke(textGray);

      doc.fillColor(blueGray).font('LeagueSpartan-Regular').fontSize(18);
      doc.text('PRICE', infoX, 285);

      doc.fillColor(blueGray).font('LeagueSpartan-Regular').fontSize(18);
      doc.text('QUANTITY', infoX + 185, 285);

      doc.fillColor(textGray).font('LeagueSpartan-Medium').fontSize(16);
      doc.text(`$${Number(order.unitPrice).toFixed(0)}`, infoX, 325);
      doc.text('1', infoX + 185, 325);

      doc
        .moveTo(infoX, 348)
        .lineTo(infoX + 72, 348)
        .lineWidth(1)
        .stroke(textGray);

      doc
        .moveTo(infoX + 185, 348)
        .lineTo(infoX + 257, 348)
        .lineWidth(1)
        .stroke(textGray);

      const dividerX = 810;

      doc
        .moveTo(dividerX, 118)
        .lineTo(dividerX, 350)
        .dash(8, { space: 4 })
        .lineWidth(2)
        .stroke(borderGray)
        .undash();

      doc.save();
      doc.translate(845, 255);
      doc.rotate(-90);
      doc
        .fillColor(blueGray)
        .font('LeagueSpartan-Regular')
        .fontSize(18)
        .text('SCAN', 0, 0);
      doc.restore();

      doc.image(barcodeBuffer, 865, 145, {
        width: 85,
      });

      doc.image(logoBuffer, 720, 322, {
        width: 90,
      });

      doc.end();
    });
  }

  private formatDayMonth(date: Date): string {
    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }

  private async resolvePosterBuffer(posterUrl: string | null): Promise<Buffer> {
    if (posterUrl) {
      try {
        const response = await fetch(posterUrl);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }
      } catch {
        // fallback below
      }
    }

    const fallbackPath = path.resolve(
      process.cwd(),
      'assets',
      'tickets',
      'default-poster.png',
    );

    return fs.readFile(fallbackPath);
  }
  private async readTicketAsset(filename: string): Promise<Buffer> {
    const assetPath = path.resolve(
      process.cwd(),
      'assets',
      'tickets',
      filename,
    );

    return fs.readFile(assetPath);
  }
}
