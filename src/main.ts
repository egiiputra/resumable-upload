import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
  await app.listen(process.env.PORT ?? 3000);
}

(async () => {
  await bootstrap();
})();
