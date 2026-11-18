import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { Public, SesionUsuario, UsuarioActual } from "./decorators";
import { ContrasenaSegura } from "./password";

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password: string;
}

class CambiarPasswordDto {
  @IsString()
  @MaxLength(200)
  actual: string;

  @ContrasenaSegura()
  nueva: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  // Maximo 10 intentos por minuto por IP para frenar ataques de adivinar contrasenas.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("login")
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get("me")
  me(@UsuarioActual() usuario: SesionUsuario) {
    return { id: usuario.sub, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol };
  }

  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post("cambiar-password")
  @HttpCode(200)
  cambiarPassword(@UsuarioActual() usuario: SesionUsuario, @Body() dto: CambiarPasswordDto) {
    return this.auth.cambiarPassword(usuario.sub, dto.actual, dto.nueva);
  }
}
