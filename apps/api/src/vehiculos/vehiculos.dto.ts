import { PartialType } from "@nestjs/mapped-types";
import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Max, Min, MinLength } from "class-validator";

const mayusculas = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CrearVehiculoDto {
  @IsUUID()
  clienteId: string;

  @IsString()
  @MinLength(1)
  marca: string;

  @IsString()
  @MinLength(1)
  modelo: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  anio?: number;

  @Transform(mayusculas)
  @IsString()
  @MinLength(3)
  placas: string;

  @IsOptional()
  @Transform(mayusculas)
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  kilometraje?: number;

  @IsOptional()
  @IsString()
  notas?: string;
}

export class ActualizarVehiculoDto extends PartialType(CrearVehiculoDto) {}
