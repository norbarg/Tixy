import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompanyNewsService } from './company-news.service';
import { CreateCompanyNewsDto } from './dto/create-company-news.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Company News')
@ApiBearerAuth()
@Controller('company-news')
export class CompanyNewsController {
  constructor(private readonly companyNewsService: CompanyNewsService) {}

  @Post()
  createNews(
    @Body() dto: CreateCompanyNewsDto,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.companyNewsService.create(dto, user);
  }

  @Public()
  @Get('company/:companyId')
  getCompanyNews(@Param('companyId') companyId: string) {
    return this.companyNewsService.getByCompanyId(companyId);
  }

  @Delete(':id')
  deleteNews(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.companyNewsService.delete(id, user);
  }
}
