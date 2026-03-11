//src/modules/companies/companies.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GetCompaniesQueryDto } from './dto/get-companies-query.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  createCompany(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.create(user.sub, dto);
  }

  @Get('my')
  getMyCompany(@CurrentUser() user: { sub: string }) {
    return this.companiesService.getMyCompany(user.sub);
  }

  @Public()
  @Get()
  getAllCompanies(@Query() query: GetCompaniesQueryDto) {
    return this.companiesService.getAllPublic(query);
  }

  @Public()
  @Get(':id')
  getCompanyById(@Param('id') id: string) {
    return this.companiesService.getById(id);
  }

  @Patch(':id')
  updateCompany(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, user, dto);
  }

  @Delete(':id')
  deleteCompany(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string; role: UserRole },
  ) {
    return this.companiesService.delete(id, user);
  }
}
