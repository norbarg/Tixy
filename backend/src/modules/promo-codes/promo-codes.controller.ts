//src/modules/promo-codes/promo-codes.controller.ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PromoCodesService } from './promo-codes.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { ValidatePromoCodeDto } from './dto/validate-promo-code.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Promo Codes')
@ApiBearerAuth()
@Controller('promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Post()
  createPromoCode(
    @Body() dto: CreatePromoCodeDto,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.promoCodesService.create(dto, user);
  }

  @Get('event/:eventId')
  getPromoCodesByEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.promoCodesService.getByEventId(eventId, user);
  }

  @Public()
  @Post('validate')
  validatePromoCode(@Body() dto: ValidatePromoCodeDto) {
    return this.promoCodesService.validate(dto);
  }

  @Delete(':id')
  deletePromoCode(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.promoCodesService.delete(id, user);
  }
}
