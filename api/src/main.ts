import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import { mkdirSync } from 'fs';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  
  app.useBodyParser('raw', {
    type: (req) => true, // Apply to *all* requests, regardless of content type.
    limit: '10mb',
  });
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
  .setTitle('Resumable file upload')
  .setDescription(
    'A simple resumable file upload API that built with NestJS framework',
  )
  .setVersion('1.0')
  .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  
  try {
    mkdirSync(path.join(process.cwd(), 'uploads'))
  } catch {}

  await app.listen(process.env.PORT ?? 3000);
}

(async () => {
  await bootstrap();
})();
