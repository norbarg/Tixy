//src/modules/comments/comments.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../database/entities/comments.entity';
import { Event } from '../../database/entities/events.entity';
import { User } from '../../database/entities/users.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<Comment | null> {
    return this.commentsRepository.findOne({
      where: { id },
    });
  }

  async getAllComments() {
    const comments = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoin(Event, 'event', 'event.id = comment.eventId')
      .leftJoin(User, 'user', 'user.id = comment.authorUserId')
      .select([
        'comment.id AS id',
        'comment.eventId AS "eventId"',
        'comment.authorUserId AS "authorUserId"',
        'comment.content AS content',
        'comment.createdAt AS "createdAt"',
        'event.title AS "eventTitle"',
        'user.login AS "authorLogin"',
      ])
      .orderBy('comment.createdAt', 'DESC')
      .getRawMany();

    return comments.map((comment) => ({
      id: comment.id,
      eventId: comment.eventId,
      authorUserId: comment.authorUserId,
      content: comment.content,
      createdAt: comment.createdAt,
      eventTitle: comment.eventTitle ?? null,
      authorLogin: comment.authorLogin ?? null,
    }));
  }

  async create(authorUserId: string, dto: CreateCommentDto) {
    const event = await this.eventsRepository.findOne({
      where: { id: dto.eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const comment = this.commentsRepository.create({
      eventId: dto.eventId,
      authorUserId,
      content: dto.content,
    });

    const savedComment = await this.commentsRepository.save(comment);

    return this.sanitizeComment(savedComment);
  }

  async getByEventId(eventId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const comments = await this.commentsRepository.find({
      where: { eventId },
      order: { createdAt: 'DESC' },
    });

    return comments.map((comment) => this.sanitizeComment(comment));
  }

  async delete(
    commentId: string,
    currentUser: { sub: string; role: UserRole },
  ) {
    const comment = await this.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isAuthor = comment.authorUserId === currentUser.sub;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw new ForbiddenException('You do not have access to this comment');
    }

    await this.commentsRepository.remove(comment);

    return {
      message: 'Comment deleted successfully',
    };
  }

  private sanitizeComment(comment: Comment) {
    return {
      id: comment.id,
      eventId: comment.eventId,
      authorUserId: comment.authorUserId,
      content: comment.content,
      createdAt: comment.createdAt,
    };
  }
}
