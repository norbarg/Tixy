import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CompanyNews } from '../../database/entities/company_news.entity';
import { Company } from '../../database/entities/companies.entity';
import { OrganizerSubscription } from '../../database/entities/organizer_subscriptions.entity';
import { Notification } from '../../database/entities/notifications.entity';
import { User } from '../../database/entities/users.entity';
import { CreateCompanyNewsDto } from './dto/create-company-news.dto';
import { UserRole } from '../../common/enums/user-role.enum';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CompanyNewsService {
  constructor(
    @InjectRepository(CompanyNews)
    private readonly companyNewsRepository: Repository<CompanyNews>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(OrganizerSubscription)
    private readonly organizerSubscriptionsRepository: Repository<OrganizerSubscription>,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  findById(id: string): Promise<CompanyNews | null> {
    return this.companyNewsRepository.findOne({
      where: { id },
    });
  }

  async create(
    dto: CreateCompanyNewsDto,
    currentUser: { sub: string; role: UserRole },
  ) {
    const company = await this.companiesRepository.findOne({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isOwner = company.ownerUserId === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have access to this company');
    }

    const news = this.companyNewsRepository.create({
      companyId: dto.companyId,
      title: dto.title,
      content: dto.content,
    });

    const savedNews = await this.companyNewsRepository.save(news);

    await this.notifyCompanySubscribers(company, savedNews);

    return this.sanitizeNews(savedNews);
  }

  async getByCompanyId(companyId: string) {
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const newsList = await this.companyNewsRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });

    return newsList.map((news) => this.sanitizeNews(news));
  }

  async delete(id: string, currentUser: { sub: string; role: UserRole }) {
    const news = await this.findById(id);

    if (!news) {
      throw new NotFoundException('News not found');
    }

    const company = await this.companiesRepository.findOne({
      where: { id: news.companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isOwner = company.ownerUserId === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You do not have access to this news');
    }

    await this.companyNewsRepository.remove(news);

    return {
      message: 'Company news deleted successfully',
    };
  }

  private async notifyCompanySubscribers(company: Company, news: CompanyNews) {
    const subscriptions = await this.organizerSubscriptionsRepository.find({
      where: { companyId: company.id },
    });

    if (subscriptions.length === 0) {
      return;
    }

    const userIds = [...new Set(subscriptions.map((item) => item.userId))];

    const users = await this.usersRepository.findBy({
      id: In(userIds),
    });

    if (users.length === 0) {
      return;
    }

    const notifications = users.map((user) =>
      this.notificationsRepository.create({
        userId: user.id,
        type: NotificationType.COMPANY_NEWS,
        title: `${company.name}: ${news.title}`,
        body: news.content,
        sentViaEmail: false,
        sentViaSite: true,
        isRead: false,
      }),
    );

    await this.notificationsRepository.save(notifications);

    await Promise.all(
      users.map(async (user) => {
        try {
          await this.mailService.sendCompanyNewsEmail({
            to: user.email,
            userLogin: user.login,
            companyName: company.name,
            newsTitle: news.title,
            newsContent: news.content,
          });

          await this.notificationsRepository.update(
            {
              userId: user.id,
              type: NotificationType.COMPANY_NEWS,
              title: `${company.name}: ${news.title}`,
              body: news.content,
            },
            {
              sentViaEmail: true,
            },
          );
        } catch (error) {
          console.error(
            `Failed to send company news email to ${user.email}:`,
            error,
          );
        }
      }),
    );
  }

  private sanitizeNews(news: CompanyNews) {
    return {
      id: news.id,
      companyId: news.companyId,
      title: news.title,
      content: news.content,
      createdAt: news.createdAt,
    };
  }
}
