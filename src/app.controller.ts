import { cwd } from 'process';
import * as path from 'path';
import { randomUUID, createHash } from 'crypto';

import {
  Controller,
  Get,
  Post,
  Headers,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('api/v1/form-upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadBinary(
    @UploadedFile() file: Express.Multer.File,
    @Headers('X-Checksum') checksum: string,
  ): string {
    const hash = createHash('md5');

    hash.update(file.buffer);
    if (checksum != hash.copy().digest('hex')) {
      // TODO: Give bad request response status
      return 'file corrupt';
    }
    // TODO: Store file to disk and give unique name

    return 'upload file successfully';
  }
}
