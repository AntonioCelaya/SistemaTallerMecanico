import { resolve } from "node:path";
import { config } from "dotenv";

// El .env vive en la raiz del monorepo; pnpm ejecuta los scripts desde apps/api.
config({ path: resolve(process.cwd(), "../../.env") });

import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

// Direcciones privadas de red local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
// y de la red privada Tailscale (100.64-127.x.x y nombres *.ts.net) para el acceso remoto.
const ORIGEN_RED_LOCAL =
  /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d+\.\d+|[a-z0-9-]+(\.[a-z0-9-]+)*\.ts\.net)(:\d+)?$/i;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Detras del enlace publico las peticiones llegan desde el proxy local;
  // asi la IP real del visitante (X-Forwarded-For) se usa para el limite de intentos.
  app.set("trust proxy", "loopback");

  const origenesPermitidos = (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((o) => o.trim());
  app.enableCors({
    // Ademas de CORS_ORIGINS se acepta cualquier dispositivo de la red del taller,
    // para no tener que editar .env cada vez que cambie la IP del servidor.
    origin: (origen: string | undefined, callback: (error: Error | null, permitir?: boolean) => void) =>
      callback(null, !origen || origenesPermitidos.includes(origen) || ORIGEN_RED_LOCAL.test(origen)),
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const port = Number(process.env.API_PORT ?? 4000);
  // 0.0.0.0 para que otros dispositivos de la red del taller puedan conectarse.
  await app.listen(port, "0.0.0.0");
  console.log(`API escuchando en http://localhost:${port}`);
}

bootstrap();
