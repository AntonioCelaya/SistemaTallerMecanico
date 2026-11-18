import { applyDecorators } from "@nestjs/common";
import { IsString, Matches, MaxLength, MinLength } from "class-validator";

/** Reglas para contrasenas nuevas: minimo 10 caracteres, con letras y numeros. */
export function ContrasenaSegura() {
  return applyDecorators(
    IsString(),
    MinLength(10, { message: "La contrasena debe tener al menos 10 caracteres" }),
    // bcrypt solo considera los primeros 72 bytes.
    MaxLength(72, { message: "La contrasena no puede tener mas de 72 caracteres" }),
    Matches(/[A-Za-z]/, { message: "La contrasena debe incluir al menos una letra" }),
    Matches(/\d/, { message: "La contrasena debe incluir al menos un numero" }),
  );
}
