import { cwd } from 'process';
import * as path from 'path';
import { randomUUID, createHash } from 'crypto';
import * as fs from 'fs';

import {
  Controller,
  Post,
  Headers,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller({
  path: 'form-upload',
  version: '1',
})
export class FormUploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadBinary(
    @UploadedFile() file: Express.Multer.File,
    @Headers('X-Checksum') checksum: string,
    @Res() res: Response,
  ) {
    const hash = createHash('md5');

    const { buffer, originalname } = file;

    hash.update(buffer);
    if (checksum != hash.copy().digest('hex')) {
      res.status(400).json({
        message: 'Uploaded file might be corrupted',
      });
      return;
    }

    const filename = path.join(
      cwd(),
      'uploads',
      randomUUID() + path.extname(originalname),
    );

    fs.open(filename, 'ax', (err, fd) => {
      if (err) {
        res.status(500).json({
          message: 'Upload file failed',
        });
        return;
      }

      fs.write(fd, file.buffer, 0, file.buffer.length, null, (err) => {
        if (err) {
          res.status(500).json({
            message: 'Error writing to file',
          });
          return;
        }

        fs.close(fd, (err) => {
          if (err) {
            res.status(500).json({
              message: 'Error closing file',
            });
            return;
          }
          res.status(200).json({
            message: 'File uploaded successfully',
          });
        });
      });
    });
  }
}
