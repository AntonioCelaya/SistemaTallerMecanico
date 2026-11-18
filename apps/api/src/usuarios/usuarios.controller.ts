import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { Rol } from "@taller/database";
import bcrypt from "bcryptjs";
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Roles, SesionUsuario, UsuarioActual } from "../auth/decorators";
import { ContrasenaSegura } from "../auth/password";
import { PrismaService } from "../prisma/prisma.service";

class CrearUsuarioDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ContrasenaSegura()
  password: string;

  @IsEnum(Rol)
  rol: Rol;
}

class ActualizarUsuarioDto {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsEnum(Rol)
  rol?: Rol;
}

const camposPublicos = { id: true, email: true, nombre: true, rol: true, activo: true, creadoEn: true };

@Controller("usuarios")
@Roles(Rol.ADMIN)
export class UsuariosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  listar() {
    return this.prisma.usuario.findMany({ select: camposPublicos, orderBy: { nombre: "asc" } });
  }

  @Post()
  async crear(@Body() dto: CrearUsuarioDto) {
    const email = dto.email.toLowerCase();
    if (await this.prisma.usuario.findUnique({ where: { email } })) {
      throw new ConflictException("Ya existe un usuario con ese correo");
    }
    return this.prisma.usuario.create({
      data: { email, nombre: dto.nombre, rol: dto.rol, passwordHash: await bcrypt.hash(dto.password, 12) },
      select: camposPublicos,
    });
  }

  @Patch(":id")
  async actualizar(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ActualizarUsuarioDto,
    @UsuarioActual() sesion: SesionUsuario,
  ) {
    if (id === sesion.sub && (dto.activo === false || (dto.rol && dto.rol !== Rol.ADMIN))) {
      throw new BadRequestException("No puedes desactivarte ni quitarte el rol de administrador");
    }
    if (!(await this.prisma.usuario.findUnique({ where: { id } }))) {
      throw new NotFoundException("Usuario no encontrado");
    }
    return this.prisma.usuario.update({ where: { id }, data: dto, select: camposPublicos });
  }
}
