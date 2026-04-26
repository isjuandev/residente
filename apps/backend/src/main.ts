import "./instrument";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SentryExceptionFilter } from "./sentry/sentry-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiPrefix = process.env.API_PREFIX ?? "api";
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

  app.setGlobalPrefix(apiPrefix, {
    exclude: [{ path: "health", method: RequestMethod.GET }]
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new SentryExceptionFilter());
  app.enableCors({
    origin: corsOrigin,
    credentials: true
  });

  await app.listen(Number(process.env.PORT ?? 3001));
}

void bootstrap();
