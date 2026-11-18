import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { SesionUsuario } from "./decorators";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
    if (!usuario || !usuario.activo || !(await bcrypt.compare(password, usuario.passwordHash))) {
      throw new UnauthorizedException("Correo o contrasena incorrectos");
    }

    const sesion: SesionUsuario = {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };
    return {
      accessToken: await this.jwt.signAsync(sesion),
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol },
    };
  }
}
