import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesController } from './files/files.controller';
import { FormUploadController } from './form-upload/form-upload.controller';

@Module({
  controllers: [AppController, FilesController, FormUploadController],
  providers: [AppService],
})
export class AppModule {}
