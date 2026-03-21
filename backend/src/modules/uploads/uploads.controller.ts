//uploads.controller.ts
import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import * as path from 'path';

const ensureDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const imageFileFilter: MulterOptions['fileFilter'] = (_req, file, callback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        'Only jpg, jpeg, png and webp images are allowed',
      ),
      false,
    );
  }

  callback(null, true);
};

const buildStorage = (relativeDir: string) =>
  diskStorage({
    destination: (_req, _file, callback) => {
      const uploadPath = path.resolve(process.cwd(), 'uploads', relativeDir);
      ensureDir(uploadPath);
      callback(null, uploadPath);
    },
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname);
      const safeBaseName = path
        .basename(file.originalname, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const uniqueName = `${safeBaseName || 'image'}-${Date.now()}${ext.toLowerCase()}`;
      callback(null, uniqueName);
    },
  });

@ApiTags('Uploads')
@ApiBearerAuth()
@Controller('uploads')
export class UploadsController {
  @Post('company-avatar')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: buildStorage(path.join('companies', 'avatars')),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadCompanyAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return {
      url: `http://localhost:${process.env.PORT || 5001}/uploads/companies/avatars/${file.filename}`,
    };
  }

  @Post('event-banner')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: buildStorage(path.join('events', 'banners')),
      fileFilter: imageFileFilter,
      limits: { fileSize: 7 * 1024 * 1024 },
    }),
  )
  uploadEventBanner(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return {
      url: `http://localhost:${process.env.PORT || 5001}/uploads/events/banners/${file.filename}`,
    };
  }

  @Post('event-poster')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: buildStorage(path.join('events', 'posters')),
      fileFilter: imageFileFilter,
      limits: { fileSize: 7 * 1024 * 1024 },
    }),
  )
  uploadEventPoster(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return {
      url: `http://localhost:${process.env.PORT || 5001}/uploads/events/posters/${file.filename}`,
    };
  }
}
