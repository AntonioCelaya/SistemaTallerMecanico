import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { RolesGuard } from "./auth/roles.guard";
import { ClientesModule } from "./clientes/clientes.module";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { UsuariosModule } from "./usuarios/usuarios.module";
import { VehiculosModule } from "./vehiculos/vehiculos.module";

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET no esta definido en .env");
        return { secret, signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? "8h") as never } };
      },
    }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ClientesModule,
    VehiculosModule,
  ],
  controllers: [HealthController],
  providers: [
    // Todas las rutas requieren sesion salvo las marcadas con @Public().
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
