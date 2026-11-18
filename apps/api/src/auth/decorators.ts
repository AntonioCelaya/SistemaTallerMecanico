import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";
import { Rol } from "@taller/database";

export const IS_PUBLIC_KEY = "isPublic";
export const ROLES_KEY = "roles";

export interface SesionUsuario {
  sub: string;
  email: string;
  nombre: string;
  rol: Rol;
}

/** Permite acceder a la ruta sin token. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Restringe la ruta a los roles indicados. */
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);

/** Inyecta el usuario de la sesion actual. */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SesionUsuario => ctx.switchToHttp().getRequest().usuario,
);
