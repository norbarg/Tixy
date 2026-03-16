//src/modules/orders/orders.controller.ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.sub, dto);
  }

  @Get('my')
  getMyOrders(@CurrentUser() user: { sub: string }) {
    return this.ordersService.getMyOrders(user.sub);
  }

  @Get(':id')
  getMyOrderById(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordersService.getMyOrderById(id, user.sub);
  }

  @Delete(':id')
  cancelMyPendingOrder(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.ordersService.cancelMyPendingOrder(id, user.sub);
  }
}
