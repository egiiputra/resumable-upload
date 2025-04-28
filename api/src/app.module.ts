import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FilesService } from './files/files.service';
import { FilesController } from './files/files.controller';
import { FormUploadController } from './form-upload/form-upload.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AppController, FilesController, FormUploadController],
  providers: [AppService, FilesService],
  imports: [ConfigModule.forRoot()],
})
export class AppModule {}
