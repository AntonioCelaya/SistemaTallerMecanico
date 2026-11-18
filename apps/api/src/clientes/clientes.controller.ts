import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { Rol } from "@taller/database";
import { Roles } from "../auth/decorators";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarClienteDto, CrearClienteDto } from "./clientes.dto";

@Controller("clientes")
export class ClientesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  listar(@Query("q") q?: string) {
    return this.prisma.cliente.findMany({
      where: q
        ? {
            OR: [
              { nombre: { contains: q, mode: "insensitive" } },
              { telefono: { contains: q } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: { _count: { select: { vehiculos: true } } },
      orderBy: { nombre: "asc" },
    });
  }

  @Get(":id")
  async obtener(@Param("id", ParseUUIDPipe) id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: { vehiculos: { orderBy: { creadoEn: "desc" } } },
    });
    if (!cliente) throw new NotFoundException("Cliente no encontrado");
    return cliente;
  }

  @Post()
  crear(@Body() dto: CrearClienteDto) {
    return this.prisma.cliente.create({ data: dto });
  }

  @Patch(":id")
  async actualizar(@Param("id", ParseUUIDPipe) id: string, @Body() dto: ActualizarClienteDto) {
    await this.obtener(id);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  @Delete(":id")
  @Roles(Rol.ADMIN)
  async eliminar(@Param("id", ParseUUIDPipe) id: string) {
    const cliente = await this.obtener(id);
    if (cliente.vehiculos.length > 0) {
      throw new ConflictException("El cliente tiene vehiculos registrados; eliminalos primero");
    }
    await this.prisma.cliente.delete({ where: { id } });
    return { ok: true };
  }
}
