import {
  Controller,
  Post,
  Head,
  Patch,
  Delete,
  Options,
  Param,
} from '@nestjs/common';

@Controller({
  path: 'files',
  version: '1',
})
export class FilesController {
  @Post()
  initiateUpload() {
    // TODO: Initiates a new file upload. The client will send the metadata of the file to be uploaded, and the server will respond with the location where to upload the file
  }

  @Head(':id')
  getMetadata(@Param('id') id: string) {
    // TODO: Retrieves the metadata of the file by ID. This API will be used to check the status and progress of the upload. Client can use this API to see how much of the file has been uploaded and where to resume the upload
  }

  @Patch(':id')
  uploadChunk(@Param('id') id: string) {
    // TODO: Uploads a chunk of the file. The client will send a chunk of the file to the server, and the server will append the chunk to the file.
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
