import {
  BadRequestException,
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
import { Prisma, Rol } from "@taller/database";
import { Roles } from "../auth/decorators";
import { PrismaService } from "../prisma/prisma.service";
import { ActualizarVehiculoDto, CrearVehiculoDto } from "./vehiculos.dto";

@Controller("vehiculos")
export class VehiculosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  listar(@Query("q") q?: string, @Query("clienteId") clienteId?: string) {
    return this.prisma.vehiculo.findMany({
      where: {
        clienteId: clienteId || undefined,
        OR: q
          ? [
              { placas: { contains: q, mode: "insensitive" } },
              { marca: { contains: q, mode: "insensitive" } },
              { modelo: { contains: q, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: { cliente: { select: { id: true, nombre: true } } },
      orderBy: { creadoEn: "desc" },
    });
  }

  @Get(":id")
  async obtener(@Param("id", ParseUUIDPipe) id: string) {
    const vehiculo = await this.prisma.vehiculo.findUnique({ where: { id }, include: { cliente: true } });
    if (!vehiculo) throw new NotFoundException("Vehiculo no encontrado");
    return vehiculo;
  }

  @Post()
  crear(@Body() dto: CrearVehiculoDto) {
    return this.guardar(() => this.prisma.vehiculo.create({ data: dto }));
  }

  @Patch(":id")
  async actualizar(@Param("id", ParseUUIDPipe) id: string, @Body() dto: ActualizarVehiculoDto) {
    await this.obtener(id);
    return this.guardar(() => this.prisma.vehiculo.update({ where: { id }, data: dto }));
  }

  @Delete(":id")
  @Roles(Rol.ADMIN)
  async eliminar(@Param("id", ParseUUIDPipe) id: string) {
    await this.obtener(id);
    await this.prisma.vehiculo.delete({ where: { id } });
    return { ok: true };
  }

  /** Traduce errores de Prisma a respuestas claras para el usuario. */
  private async guardar<T>(operacion: () => Promise<T>): Promise<T> {
    try {
      return await operacion();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") throw new ConflictException("Ya existe un vehiculo con esas placas o VIN");
        if (error.code === "P2003") throw new BadRequestException("El cliente indicado no existe");
      }
      throw error;
    }
  }
}
