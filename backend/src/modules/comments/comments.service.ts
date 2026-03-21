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
import { CreateCommentDto } from './dto/create-comment.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  findById(id: string): Promise<Comment | null> {
    return this.commentsRepository.findOne({
      where: { id },
    });
  }

  async getAllComments() {
    const comments = await this.commentsRepository.find({
      order: { createdAt: 'DESC' },
    });

    return comments.map((comment) => this.sanitizeComment(comment));
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
