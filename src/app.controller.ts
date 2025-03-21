import * as fs from 'fs';
import { cwd } from 'process';
import * as path from 'path';
import { randomUUID } from 'crypto';

import { Controller, Get, Post, Req, RawBodyRequest } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('api/v1/binary/slow')
  uploadBinary(@Req() req: RawBodyRequest<Request>): string {

    fs.open(path.join(cwd(), 'tmp', randomUUID()) , 'ax', function (err, f) {
      console.log(err);
      console.log('Saved!');
    });
    return 'test binary';
  }
}
