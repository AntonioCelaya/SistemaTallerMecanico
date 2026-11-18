import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IS_PUBLIC_KEY, SesionUsuario } from "./decorators";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
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

    try {
      request.usuario = await this.jwt.verifyAsync<SesionUsuario>(token);
    } catch {
      throw new UnauthorizedException("Sesion invalida o expirada");
    }
    return true;
  }
}
