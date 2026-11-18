import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Rol } from "@taller/database";
import { ROLES_KEY, SesionUsuario } from "./decorators";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!roles?.length) return true;

    const usuario: SesionUsuario | undefined = context.switchToHttp().getRequest().usuario;
    if (!usuario || !roles.includes(usuario.rol)) {
      throw new ForbiddenException("No tienes permiso para esta accion");
    }
    return true;
  }
}
