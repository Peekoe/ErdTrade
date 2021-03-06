import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { PrismaService } from './prisma/prisma.service';
import * as expressSession from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug'],
  });
  const prismaService = app.get(PrismaService);
  const configService = app.get(ConfigService);
  await prismaService.enableShutdownHooks(app);

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      tryItOutEnabled: true,
    },
    customSiteTitle: 'ErdTrade API',
  };

  const config = new DocumentBuilder()
    .setTitle('ErdTrade API')
    .setDescription('ErdTrade API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, customOptions);

  app.use(
    expressSession({
      cookie: {
        maxAge: 86400000,
        httpOnly: true,
        sameSite: true,
        secure: configService.get('NODE_ENV') !== 'development',
      },
      secret: configService.get('SESSION_SECRET'),
      resave: true,
      saveUninitialized: true,
      store: new PrismaSessionStore(prismaService, {
        checkPeriod: 2 * 60 * 1000,
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }),
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(3000);
}
bootstrap();
