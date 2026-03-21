// src/modules/companies/companies.service.ts
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Company } from '../../database/entities/companies.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { GetCompaniesQueryDto } from './dto/get-companies-query.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
  ) {}

  findById(id: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { id },
    });
  }

  findByOwnerUserId(ownerUserId: string): Promise<Company | null> {
    return this.companiesRepository.findOne({
      where: { ownerUserId },
    });
  }

  async create(ownerUserId: string, dto: CreateCompanyDto) {
    const existingCompany = await this.findByOwnerUserId(ownerUserId);

    if (existingCompany) {
      throw new ConflictException('User already has a company');
    }

    const company = this.companiesRepository.create({
      ownerUserId,
      name: dto.name,
      description: dto.description ?? null,
      email: dto.email,
      avatarUrl: dto.avatarUrl ?? null,
      placeAddress: dto.placeAddress ?? null,
      googleMapsUrl: dto.googleMapsUrl ?? null,
      googlePlaceId: dto.googlePlaceId ?? null,
      placeLat: dto.placeLat ?? null,
      placeLng: dto.placeLng ?? null,
    });
    const hasAnyCoordinates =
      dto.placeLat !== undefined || dto.placeLng !== undefined;

    const hasFullCoordinates =
      dto.placeLat !== undefined && dto.placeLng !== undefined;

    if (hasAnyCoordinates && !hasFullCoordinates) {
      throw new BadRequestException(
        'placeLat and placeLng must be provided together',
      );
    }
    const savedCompany = await this.companiesRepository.save(company);

    return this.sanitizeCompany(savedCompany);
  }

  async getMyCompany(ownerUserId: string) {
    const company = await this.findByOwnerUserId(ownerUserId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.sanitizeCompany(company);
  }

  async getAllPublic(query: GetCompaniesQueryDto) {
    const qb = this.companiesRepository.createQueryBuilder('company');

    if (query.search) {
      qb.where(
        new Brackets((subQb) => {
          subQb
            .where('company.name ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('company.description ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('company.placeAddress ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    qb.orderBy('company.createdAt', 'DESC');

    const companies = await qb.getMany();

    return companies.map((company) => this.sanitizeCompany(company));
  }

  async getById(id: string) {
    const company = await this.findById(id);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.sanitizeCompany(company);
  }

  async update(
    companyId: string,
    currentUser: { sub: string; role: UserRole },
    dto: UpdateCompanyDto,
  ) {
    const company = await this.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isOwner = company.ownerUserId === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have access to this company');
    }

    if (dto.name !== undefined) {
      company.name = dto.name;
    }

    if (dto.description !== undefined) {
      company.description = dto.description ?? null;
    }

    if (dto.email !== undefined) {
      company.email = dto.email;
    }

    if (dto.avatarUrl !== undefined) {
      company.avatarUrl = dto.avatarUrl ?? null;
    }

    if (dto.placeAddress !== undefined) {
      company.placeAddress = dto.placeAddress ?? null;
    }

    if (dto.googleMapsUrl !== undefined) {
      company.googleMapsUrl = dto.googleMapsUrl ?? null;
    }

    if (dto.googlePlaceId !== undefined) {
      company.googlePlaceId = dto.googlePlaceId ?? null;
    }

    if (dto.placeLat !== undefined) {
      company.placeLat = dto.placeLat ?? null;
    }

    if (dto.placeLng !== undefined) {
      company.placeLng = dto.placeLng ?? null;
    }

    const hasAnyCoordinates =
      dto.placeLat !== undefined || dto.placeLng !== undefined;

    const hasFullCoordinates =
      dto.placeLat !== undefined && dto.placeLng !== undefined;

    if (hasAnyCoordinates && !hasFullCoordinates) {
      throw new BadRequestException(
        'placeLat and placeLng must be provided together',
      );
    }
    const updatedCompany = await this.companiesRepository.save(company);

    return this.sanitizeCompany(updatedCompany);
  }

  async delete(
    companyId: string,
    currentUser: { sub: string; role: UserRole },
  ) {
    const company = await this.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isOwner = company.ownerUserId === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have access to this company');
    }

    await this.companiesRepository.remove(company);

    return {
      message: 'Company deleted successfully',
    };
  }

  private sanitizeCompany(company: Company) {
    return {
      id: company.id,
      ownerUserId: company.ownerUserId,
      name: company.name,
      description: company.description,
      email: company.email,
      avatarUrl: company.avatarUrl,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      placeAddress: company.placeAddress,
      googleMapsUrl: company.googleMapsUrl,
      googlePlaceId: company.googlePlaceId,
      placeLat: company.placeLat,
      placeLng: company.placeLng,
    };
  }
}
