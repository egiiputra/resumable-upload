import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesService } from './files/files.service';
import { FilesController } from './files/files.controller';
import { FormUploadController } from './form-upload/form-upload.controller';

@Module({
  controllers: [AppController, FilesController, FormUploadController],
  providers: [AppService, FilesService],
})
export class AppModule {}
