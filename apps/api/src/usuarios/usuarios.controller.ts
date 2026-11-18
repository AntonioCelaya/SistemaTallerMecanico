import { Body, ConflictException, Controller, Get, Post } from "@nestjs/common";
import { Rol } from "@taller/database";
import bcrypt from "bcryptjs";
import { IsEmail, IsEnum, IsString, MinLength } from "class-validator";
import { Roles } from "../auth/decorators";
import { PrismaService } from "../prisma/prisma.service";

class CrearUsuarioDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  nombre: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Rol)
  rol: Rol;
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
      data: { email, nombre: dto.nombre, rol: dto.rol, passwordHash: await bcrypt.hash(dto.password, 10) },
      select: camposPublicos,
    });
  }
}
