import * as process from 'process';
import * as path from 'path';
import { FilesService } from './files.service';
import { randomUUID, createHash } from 'crypto';
import * as fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

import {
  Controller,
  Post,
  Head,
  Patch,
  Delete,
  Options,
  Param,
  Req,
  RawBodyRequest,
  Headers,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

const database = new DatabaseSync(path.join(process.cwd(), 'files.db'));

// Execute SQL statements from strings.
database.exec(`
  CREATE TABLE IF NOT EXISTS files (
    uuid CHAR(36) NOT NULL,
    filename VARCHAR(50) NOT NULL,
    type VARCHAR(25),
    checksum CHAR(32) NOT NULL,
    total_size BIGINT NOT NULL,
    uploaded_size BIGINT NOT NULL)
`);

@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private configService: ConfigService,
  ) {}

  @Post()
  createUpload(
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ) {
    // TODO: Initiates a new file upload. The client will send the metadata of the file to be uploaded, and the server will respond with the location where to upload the file
    const uploadDeferLength: string = headers['upload-defer-length'] ?? '';
    if (uploadDeferLength != '' && uploadDeferLength != '1') {
      res.status(400).json({
        message: 'invalid Upload-Defer-Length header',
      });
      return;
    }

    const fileMetadata = this.filesService.parseMetadata(
      headers['upload-metadata'],
    );
    fileMetadata.uploadedSize = 0;

    fileMetadata.isDeferLength = uploadDeferLength == '1' ? '1' : '';
    if (fileMetadata.isDeferLength == '') {
      const totalSize = parseInt(headers['upload-length']);
      if (Number.isNaN(totalSize)) {
        res.status(400).json({
          message: 'invalid Upload-Length header',
        });
        return;
      }

      const maxUpload =
        (this.configService.get<number>('MAX_SIZE_UPLOAD') ?? 1000) *
        1024 *
        1024;
      if (totalSize > maxUpload) {
        res.status(413).json({
          message: 'upload length exceeds the maximum size',
        });
        return;
      }
      fileMetadata.totalSize = totalSize;
    }

    const id = randomUUID();

    const insert = database.prepare('INSERT INTO files VALUES (?, ?, ?, ?, ?, ?)')

    insert.run(
      id, 
      fileMetadata['filename'],
      fileMetadata['content-type'],
      fileMetadata['checksum'],
      fileMetadata['totalSize'],
      fileMetadata['uploadedSize']
    )
    res.status(201).set({ Location: `/v1/files/${id}`}).send();
  }

  @Head(':id')
  getMetadata(@Param('id') id: string, @Res() res: Response) {
    // TODO: Retrieves the metadata of the file by ID. This API will be used to check the status and progress of the upload. Client can use this API to see how much of the file has been uploaded and where to resume the upload
    const metadataPath = path.join(
      process.cwd(),
      'uploads',
      `${id}.metadata.json`,
    );
    fs.readFile(metadataPath, 'utf8', (err, data) => {
      if (err) {
        res.status(404).send();
        return;
      }

      const metadata = JSON.parse(data);

      const headers: Record<string, string | number> = {
        'Cache-Control': 'no-store',
        'Upload-Offset': metadata.uploadedSize.toString(),
      };
      if (metadata.isDeferLength == '') {
        headers['Upload-Length'] = metadata.totalSize;
      }

      if (metadata.uploadedSize < metadata.totalSize) {
        res.status(204).set(headers).send();
        return;
      }

      const hash = createHash('md5');

      const buffer = fs.readFileSync(
        path.join(process.cwd(), 'uploads', metadata.filename),
      );
      hash.update(buffer);
      if (metadata.checksum != hash.copy().digest('hex')) {
        res.status(204).set(headers).send();
        return;
      }
      headers['Is-Completed'] = 1;
      res.status(204).set(headers).send();
    });
  }

  @Patch(':id')
  uploadChunk(
    @Param('id') id: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ) {
    // TODO: Uploads a chunk of the file. The client will send a chunk of the file to the server, and the server will append the chunk to the file.
    if (headers['content-type'] != 'application/offset+octet-stream') {
      res.status(415).send({ message: 'content must an octet stream' });
      return;
    }

    const buffer = req.rawBody;

    if (buffer === undefined) {
      res.status(400).send({ message: 'request body is empty' });
      return;
    }

    const metadataPath = path.join(
      process.cwd(),
      'uploads',
      `${id}.metadata.json`,
    );
    fs.readFile(metadataPath, 'utf-8', (err, data) => {
      if (err) {
        res.status(404).send({ message: 'Upload ID not found' });
        return;
      }
      const metadata = JSON.parse(data);

      fs.open(
        path.join(process.cwd(), 'uploads', metadata.filename),
        'a',
        (err, fd) => {
          if (err) {
            res.status(500).send({ message: 'Open file error' });
            return;
          }
          fs.write(fd, buffer, 0, buffer.length, (err, bytesWritten, buff) => {
            if (err) {
              res.status(500).send({ message: 'Write file error' });
              return;
            }
            metadata.uploadedSize += bytesWritten;
            fs.writeFileSync(metadataPath, JSON.stringify(metadata));
            fs.close(fd, (err) => {
              if (err) {
                res.status(500).send({ message: 'Close file error' });
                return;
              }
              res
                .status(204)
                .set({ 'Upload-Offset': metadata.uploadedSize })
                .send();
              return;
            });
          });
        },
      );
    });
  }

  @Delete(':id')
  cancelUpload(@Param('id') id: string, @Res() res: Response) {
    try {
      const metadataPath = path.join(
        process.cwd(),
        'uploads',
        `${id}.metadata.json`,
      );
      const metadata = JSON.parse(
        fs.readFileSync(metadataPath, { encoding: 'utf-8' }),
      );
      fs.rmSync(path.join(process.cwd(), 'uploads', metadata.filename));
      fs.rmSync(metadataPath);

      res.status(204).send();
    } catch {
      res.status(400).send({ message: 'Upload ID not found' });
    }
  }

  @Options()
  getMethodOptions(@Res() res: Response) {
    // TODO:Retrieves the server’s capabilities. The client can query the server to determine which extensions are supported by the server
    res.status(204).set({ Allow: 'OPTIONS, HEAD, POST, PATCH' }).send();
  }
}
