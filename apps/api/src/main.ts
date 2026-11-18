import { resolve } from "node:path";
import { config } from "dotenv";

// El .env vive en la raiz del monorepo; pnpm ejecuta los scripts desde apps/api.
config({ path: resolve(process.cwd(), "../../.env") });

import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((o) => o.trim()),
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const port = Number(process.env.API_PORT ?? 4000);
  // 0.0.0.0 para que otros dispositivos de la red del taller puedan conectarse.
  await app.listen(port, "0.0.0.0");
  console.log(`API escuchando en http://localhost:${port}`);
}

bootstrap();
