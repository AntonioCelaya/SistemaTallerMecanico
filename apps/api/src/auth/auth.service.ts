import { BadRequestException, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Usuario } from "@taller/database";
import bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { SesionUsuario } from "./decorators";

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

// Hash de una contrasena cualquiera: se compara contra el cuando el correo no existe,
// para que la respuesta tarde lo mismo y no revele que correos estan registrados.
// Usa el mismo costo (12) que las contrasenas reales.
const HASH_FICTICIO = bcrypt.hashSync("contrasena-que-no-existe", 12);

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: email.toLowerCase() } });
    const coincide = await bcrypt.compare(password, usuario?.passwordHash ?? HASH_FICTICIO);

    if (usuario?.bloqueadoHasta && usuario.bloqueadoHasta > new Date()) {
      const minutos = Math.ceil((usuario.bloqueadoHasta.getTime() - Date.now()) / 60_000);
      throw new HttpException(
        `Cuenta bloqueada por demasiados intentos fallidos. Intenta de nuevo en ${minutos} minuto(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!usuario || !usuario.activo || !coincide) {
      if (usuario) await this.registrarFallo(usuario);
      throw new UnauthorizedException("Correo o contrasena incorrectos");
    }

    if (usuario.intentosFallidos > 0 || usuario.bloqueadoHasta) {
      await this.prisma.usuario.update({
        where: { id: usuario.id },
        data: { intentosFallidos: 0, bloqueadoHasta: null },
      });
    }
    return this.emitirSesion(usuario);
  }

  async cambiarPassword(usuarioId: string, actual: string, nueva: string) {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
    if (!(await bcrypt.compare(actual, usuario.passwordHash))) {
      throw new BadRequestException("La contrasena actual no es correcta");
    }
    if (actual === nueva) {
      throw new BadRequestException("La nueva contrasena debe ser distinta de la actual");
    }
    // Cerrar todas las demas sesiones abiertas con la contrasena anterior.
    const actualizado = await this.prisma.usuario.update({
      where: { id: usuarioId },
      data: { passwordHash: await bcrypt.hash(nueva, 12), sesionesValidasDesde: new Date() },
    });
    return this.emitirSesion(actualizado);
  }

  private async registrarFallo(usuario: Usuario) {
    const intentos = usuario.intentosFallidos + 1;
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data:
        intentos >= MAX_INTENTOS
          ? { intentosFallidos: 0, bloqueadoHasta: new Date(Date.now() + MINUTOS_BLOQUEO * 60_000) }
          : { intentosFallidos: intentos },
    });
  }

  private async emitirSesion(usuario: Usuario) {
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
