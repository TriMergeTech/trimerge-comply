import './otel';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import xss from 'xss-clean';
import hpp from 'hpp';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SuccessResponseInterceptor } from './common/filters/success-response.interceptor';
import cookieParser from 'cookie-parser';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = WinstonModule.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, ms, context }) => {
            return `${timestamp} ${level} [${context || 'Nest'}] ${message} ${ms}`;
          }),
        ),
      }),
    ],
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
    bufferLogs: true,
    rawBody: true,
  });

  // Trust proxy (required when behind a reverse proxy like Render, Nginx, etc.)
  app.set('trust proxy', 1);

  // HEAD request handler for health/load-balancer checks
  app.use((req, res, next) => {
    if (req.method === 'HEAD' && req.url === '/') {
      return res.status(200).end();
    }
    next();
  });

  const config = app.get(ConfigService);

  // Parse cookies for OAuth / session handling
  app.use(cookieParser());

  // Request ID tracking for distributed tracing
  app.use(requestIdMiddleware);

  // ================= Security =================
  app.use(helmet());

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:4000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // ================= Performance =================
  app.use(compression({ threshold: 1024 }));

  // ================= Sanitization =================
  app.use(hpp());
  app.use(xss());

  // ================= Rate Limiting =================
  app.use(
    rateLimit({
      windowMs: config.get<number>('RATE_LIMIT_WINDOW_MS', 60000),
      max: config.get<number>('RATE_LIMIT_MAX', 100),
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.method === 'HEAD' || req.url === '/health',
    }),
  );

  // ================= Observability =================
  app.use(morgan('combined', { stream: { write: (msg) => logger.log(msg.trim()) } }));

  // ================= API Versioning =================
  app.setGlobalPrefix('api', {
    exclude: ['/', '/health'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ================= Validation =================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidNonWhitelisted: false,
      skipMissingProperties: false,
      disableErrorMessages: false,
    }),
  );

  // ================= Interceptors & Filters =================
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new SuccessResponseInterceptor(),
  );

  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));

  // ================= Prisma Graceful Shutdown =================
  const prisma = app.get(PrismaService);
  app.enableShutdownHooks();

  // ================= Swagger (non-production only) =================
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Auth API')
      .setDescription('NestJS + Prisma + MongoDB Authentication API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Users', 'User management endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);

  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(`Swagger Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
