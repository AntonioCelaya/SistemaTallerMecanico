// Tipos que comparten la web y las apps cliente. Reflejan lo que devuelve la API.

export const ROLES = ["ADMIN", "TECNICO"] as const;
export type Rol = (typeof ROLES)[number];

export const ETIQUETAS_ROL: Record<Rol, string> = {
  ADMIN: "Administrador",
  TECNICO: "Tecnico",
};

export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
}

export interface Usuario extends UsuarioSesion {
  activo: boolean;
  creadoEn: string;
}

export interface LoginRespuesta {
  accessToken: string;
  usuario: UsuarioSesion;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  rfc: string | null;
  notas: string | null;
  creadoEn: string;
  actualizadoEn: string;
  _count?: { vehiculos: number };
  vehiculos?: Vehiculo[];
}

export interface Vehiculo {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  anio: number | null;
  placas: string;
  vin: string | null;
  color: string | null;
  kilometraje: number | null;
  notas: string | null;
  creadoEn: string;
  actualizadoEn: string;
  cliente?: Pick<Cliente, "id" | "nombre">;
}
