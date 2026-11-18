import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { IS_PUBLIC_KEY, SesionUsuario } from "./decorators";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const [tipo, token] = (request.headers.authorization ?? "").split(" ");
    if (tipo !== "Bearer" || !token) throw new UnauthorizedException("Falta el token de sesion");

    let sesion: SesionUsuario & { iat: number };
    try {
      sesion = await this.jwt.verifyAsync(token, { algorithms: ["HS256"] });
    } catch {
      throw new UnauthorizedException("Sesion invalida o expirada");
    }

    // Se consulta el usuario en cada peticion para que desactivarlo, cambiarle el rol
    // o cambiar su contrasena tenga efecto inmediato aunque el token siga vigente.
    const usuario = await this.prisma.usuario.findUnique({ where: { id: sesion.sub } });
    const validasDesde = usuario ? Math.floor(usuario.sesionesValidasDesde.getTime() / 1000) : Infinity;
    if (!usuario || !usuario.activo || sesion.iat < validasDesde) {
      throw new UnauthorizedException("Sesion invalida o expirada");
    }

    request.usuario = { sub: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol };
    return true;
  }
}
