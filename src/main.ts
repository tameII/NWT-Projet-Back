import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import * as Config from 'config';
import { AppConfig } from './interfaces/app-config.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PeopleModule } from './people/people.module';
import { SwaggerConfig } from './interfaces/swagger-config.interface';
import { CategoryModule } from './category/category.module';
import { VideoModule } from './video/video.module';
import { join } from 'path';
import { UsersModule } from './users/users.module';

async function bootstrap(config: AppConfig, swaggerConfig: SwaggerConfig) {
  // create NestJS application
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // enable CORS for our front-end app
  app.enableCors({ origin: config.cors });

  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  Logger.log(__dirname, 'bootstrap');
  Logger.log(join(__dirname, '..', 'public'), 'bootstrap');

  // use global pipe validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // create swagger options
  const options = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addTag(swaggerConfig.tag)
    .build();

  // create swagger document
  const peopleDocument = SwaggerModule.createDocument(app, options, {
    include: [ PeopleModule , CategoryModule, VideoModule, UsersModule],
  });

  // setup swagger module
  SwaggerModule.setup(swaggerConfig.path, app, peopleDocument);

  // launch server
  await app.listen(config.port, config.host);
  Logger.log(`Application served at http://${config.host}:${config.port}`, 'bootstrap');
}

bootstrap(Config.get<AppConfig>('server'), Config.get<SwaggerConfig>('swagger'));
