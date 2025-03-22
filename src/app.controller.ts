import { cwd } from 'process';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { diskStorage } from 'multer';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('api/v1/form-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(cwd(), 'uploads'),
        filename: (req, file, cb) => {
          cb(null, randomUUID() + path.extname(file.originalname));
        },
      }),
    }),
  )
  uploadBinary(): string {
    return 'upload file successfully';
  }
}
