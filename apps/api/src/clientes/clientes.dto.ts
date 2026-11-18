import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CrearClienteDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  rfc?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActualizarClienteDto extends PartialType(CrearClienteDto) {}
