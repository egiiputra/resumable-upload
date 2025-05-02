import * as process from 'process';
import * as path from 'path';
import { FilesService } from './files.service';
import { randomUUID, createHash } from 'crypto';
import * as fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

import {
  Controller,
  Get,
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
  StreamableFile,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiPayloadTooLargeResponse, ApiOkResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiUnsupportedMediaTypeResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';

const database = new DatabaseSync(path.join(process.cwd(), 'uploads', 'files.db'));

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

  @Get(':id')
  @ApiOperation({ summary: 'Get file\'s metadata' })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiOkResponse({ description: 'Get file\'s metadata success' })
  getFileMetadata(@Param('id') id: string, @Res() res: Response) {
    const tmp = database.prepare(`SELECT * FROM files WHERE uuid='${id}'`).all()
    const result = tmp.map(row => Object.assign({}, row))

    if (result.length == 0) {
      res.status(404).send();
      return;
    }

    res.status(200).json(result[0])
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file' })
  @ApiNotFoundResponse({ description: 'file not found'})
  @ApiOkResponse({ description: 'file found' })
  getFile(@Param('id') id: string, @Res() res: Response) {
    const tmp = database.prepare(`SELECT * FROM files WHERE uuid='${id}'`).all()
    const result = tmp.map(row => Object.assign({}, row))

    if (result.length == 0) {
      res.status(404).send();
      return;
    }

    res.download(path.join(process.cwd(), 'uploads', 'files', result[0]['filename']))
  }


  @Post()
  @ApiOperation({ summary: 'Initiates a new file upload. The client will send the metadata of the file to be uploaded, and the server will respond with the location where to upload the file' })
  @ApiCreatedResponse({ description: 'Initiates file upload success' })
  @ApiBadRequestResponse({ description: 'Invalid request headers' })
  @ApiPayloadTooLargeResponse({ description: 'Uploaded file too large' })
  createUpload(
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ) {
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
    console.log(fileMetadata)

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
  @ApiOperation({ summary: 'Get file upload progress' })
  @ApiNoContentResponse({ description: 'file\'s upload progress fetch successfully' })
  @ApiNotFoundResponse({ description: 'file not found' })
  getMetadata(@Param('id') id: string, @Res() res: Response) {
    // TODO: Retrieves the metadata of the file by ID. This API will be used to check the status and progress of the upload. Client can use this API to see how much of the file has been uploaded and where to resume the upload

    const tmp = database.prepare(`SELECT * FROM files WHERE uuid='${id}'`).all()
    const result = tmp.map(row => Object.assign({}, row))

    console.log(result)
    if (result.length == 0) {
      res.status(404).send();
      return;
    }
    console.log(result[0])

    const headers: Record<string, string | number> = {
      'Cache-Control': 'no-store',
      'Upload-Offset': result[0]['uploaded_size'].toString(),
      'Upload-Length': result[0]['total_size'].toString()
    };

    if (result[0]['uploaded_size'] >= result[0]['total_size']) {
      const hash = createHash('md5');

      hash.update(
        fs.readFileSync(
          path.join(process.cwd(), 'uploads', 'files', result[0]['filename'])
        )
      );

      if (result[0]['checksum'] == hash.copy().digest('hex')) {
        headers['Upload-Status'] = 'success';
      } else {
        headers['Upload-Status'] = 'failed';
      }
    }
    res.status(204).set(headers).send();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Upload file\'s chunk' })
  @ApiUnsupportedMediaTypeResponse({ description: 'Content-type header not supported' })
  @ApiBadRequestResponse({ description: 'Request body is empty' })
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiInternalServerErrorResponse({ description: 'server error' })
  @ApiNoContentResponse({ description: 'Upload chunk success' })
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

    const tmp = database.prepare(`SELECT * FROM files WHERE uuid='${id}'`).all()
    const result = tmp.map(row => Object.assign({}, row))

    console.log(result)
    if (result.length == 0) {
      res.status(404).send({ message: 'Upload ID not found' });
      return;
    }
    console.log(result[0])

    const filePath = path.join(process.cwd(), 'uploads', 'files', result[0]['filename'])
    fs.open(filePath, 'a', (err, fd) => {
      if (err) {
        res.status(500).send({ message: 'Open file error' });
        return;
      }
      fs.write(fd, buffer, 0, buffer.length, (err, bytesWritten, buff) => {
        if (err) {
          res.status(500).send({ message: 'Write file error' });
          return;
        }
        result[0]['uploaded_size'] += bytesWritten;
      
        fs.close(fd, (err) => {
          if (err) {
            res.status(500).send({ message: 'Close file error' });
            return;
          }
          database.exec(`UPDATE files SET uploaded_size=${result[0]['uploaded_size']} WHERE uuid='${id}'`)
          // console.log(result[0]['uploaded_size'])
          res
            .status(204)
            .set({ 'Upload-Offset': result[0]['uploaded_size'] })
            .send();
          
          return;
        });
      });
    })
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete/cancel file '})
  @ApiNotFoundResponse({ description: 'File not found' })
  @ApiNoContentResponse({ description: 'Delete file success' })
  cancelUpload(@Param('id') id: string, @Res() res: Response) {
    const result = database.prepare(`SELECT filename FROM files WHERE uuid='${id}'`)
      .all()
      .map(row => Object.assign({}, row))

    if (result.length == 0) {
      res.status(404).send({ message: 'Upload ID not found' });
      return;
    }
    fs.rm(path.join(process.cwd(), 'uploads', 'files', result[0]['filename']), { force: true }, (err) => {})

    database.exec(`DELETE FROM files WHERE uuid='${id}'`)

    res.status(204).send();
  }

  @Options()
  @ApiOperation({ summary: 'Get Allowed HTTP method' })
  getMethodOptions(@Res() res: Response) {
    // TODO:Retrieves the server’s capabilities. The client can query the server to determine which extensions are supported by the server
    res.status(204).set({ Allow: 'OPTIONS, HEAD, POST, PATCH' }).send();
  }
}
