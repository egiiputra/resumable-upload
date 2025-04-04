import * as process from 'process';
import * as path from 'path';
import { FilesService } from './files.service';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

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

const MAX_SIZE_UPLOAD = parseInt(process.env.MAX_SIZE_UPLOAD ?? '100') * 1024 * 1024

@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  createUpload(
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ) {
    // TODO: Initiates a new file upload. The client will send the metadata of the file to be uploaded, and the server will respond with the location where to upload the file
    const uploadDeferLength: string = headers['upload-defer-length'] ?? ''
    if (uploadDeferLength != '' && uploadDeferLength != '1') {
      res.status(400).json({
        message: 'invalid Upload-Defer-Length header'
      })
      return
    }

    const fileMetadata = this.filesService.parseMetadata(headers['upload-metadata'])
    fileMetadata.uploadedSize = 0

    fileMetadata.isDeferLength = (uploadDeferLength == '1') ? '1':''
    if (fileMetadata.isDeferLength == '') {
      const totalSize = parseInt(headers['upload-length'])
      if (Number.isNaN(totalSize)) {
        res.status(400).json({
          message: 'invalid Upload-Length header'
        })
        return
      }

      if (totalSize > MAX_SIZE_UPLOAD) {
        res.status(413).json({
          message: 'upload length exceeds the maximum size'
        })
        return
      }
      fileMetadata.totalSize = totalSize;
    }

    const filename = randomUUID();
    const filepath = path.join(
      process.cwd(),
      'uploads',
      `${filename}.metadata.json`,
    );

    fs.open(filepath, 'ax', (err, fd) => {
      if (err) {
        res.status(500).json({
          message: 'Creating file metadata failed',
        });
        return;
      }

      fs.write(fd, JSON.stringify(fileMetadata), (err) => {
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
          res.status(201).set({
            'Location': `/v1/files/${filename}`
          }).send()
        });
      });
    });
  }

  @Head(':id')
  getMetadata(@Param('id') id: string, @Res() res: Response) {
    // TODO: Retrieves the metadata of the file by ID. This API will be used to check the status and progress of the upload. Client can use this API to see how much of the file has been uploaded and where to resume the upload
    const metadataPath = path.join(
      process.cwd(),
      'uploads',
      `${id}.metadata.json`,
    )
    fs.readFile(metadataPath, 'utf8', (err, data) => {
      if (err) {
        res.status(404).send();
        return;
      }

      const metadata = JSON.parse(data)

      let headers: Record<string, string> = {"Cache-Control": "no-store", "Upload-Offset": metadata.uploadedSize.toString() }
      if (metadata.isDeferLength == '') {
        headers['Upload-Length'] = metadata.totalSize
      }
      res.status(204).set(headers).send()
    });
  }

  @Patch(':id')
  uploadChunk(@Param('id') id: string, @Req() req: RawBodyRequest<Request>,  @Headers() headers: Record<string, string>, @Res() res: Response) {
    // TODO: Uploads a chunk of the file. The client will send a chunk of the file to the server, and the server will append the chunk to the file.
    console.log(headers)
    const buffer = req.rawBody
    console.log(buffer)
    if (headers['Content-Type'] != 'application/offset+octet-stream') {
      res.status(415).send({message: 'content must an octet stream'})
      return
    }
    const metadataPath = path.join(
      process.cwd(),
      'uploads',
      `${id}.metadata.json`,
    )

    if (buffer === undefined) {
      res.status(400).send({ message: 'request body is empty'})
      return
    }

     const readStream = fs.createReadStream(req.rawBody)

    // readStream.on('data', chunk => {
    //   console.log(chunk)
    // })

    // fs.readFile(metadataPath, 'utf8', (err, data) => {
    //   if (err) {
    //     res.status(404).send({ message: 'file not found/not initiated'});
    //     return;
    //   }
    // });



  }

  @Delete(':id')
  cancelUpload(@Param('id') id: string) {
    // TODO:Cancels the upload of the file. The server will delete the file and its metadata.
  }

  @Options()
  getMethodOptions() {
    // TODO:Retrieves the server’s capabilities. The client can query the server to determine which extensions are supported by the server
  }
}
