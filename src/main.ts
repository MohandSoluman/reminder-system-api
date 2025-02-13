import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env['PORT'] || 3000;

  const config = new DocumentBuilder()
    .setTitle('Reminder System API')
    .setDescription(
      'API documentation for authentication, task management, and reminders',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}
  swagger docs: ${await app.getUrl()}/api/docs `);
}
void bootstrap();
