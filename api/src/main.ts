import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import { mkdirSync } from 'fs';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { env } from 'process';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  app.useBodyParser('raw', {
    type: (req) => true, // Apply to *all* requests, regardless of content type.
    limit: '100mb',
  });
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  app.enableVersioning({
    type: VersioningType.URI,
  });

  ConfigModule.forRoot()

  // Enable CORS
  app.enableCors({
    origin: env.CLIENT_HOST, // Your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    exposedHeaders: '*',
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
    mkdirSync(path.join(process.cwd(), 'uploads'));
  } catch {}
  try {
    mkdirSync(path.join(process.cwd(), 'uploads', 'files'));
  } catch {}

  await app.listen(process.env.PORT ?? 3000);
}

(async () => {
  await bootstrap();
})();
