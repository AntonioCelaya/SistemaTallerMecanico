import type { UsuarioSesion } from "@taller/shared";

const CLAVE_TOKEN = "taller.token";
const CLAVE_USUARIO = "taller.usuario";

/**
 * URL de la API. Por defecto usa el mismo equipo que sirve la web en el puerto 4000,
 * asi funciona igual desde la PC servidor (localhost) que desde otro dispositivo de la red.
 */
export function urlApi(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window === "undefined") return "http://localhost:4000";
  return `${window.location.protocol}//${window.location.hostname}:4000`;
}

export function guardarSesion(token: string, usuario: UsuarioSesion) {
  localStorage.setItem(CLAVE_TOKEN, token);
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}

export function usuarioGuardado(): UsuarioSesion | null {
  const crudo = localStorage.getItem(CLAVE_USUARIO);
  return crudo && localStorage.getItem(CLAVE_TOKEN) ? (JSON.parse(crudo) as UsuarioSesion) : null;
}

export class ErrorApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(ruta: string, opciones: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = localStorage.getItem(CLAVE_TOKEN);
  let respuesta: Response;
  try {
    respuesta = await fetch(`${urlApi()}${ruta}`, {
      method: opciones.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opciones.body === undefined ? undefined : JSON.stringify(opciones.body),
    });
  } catch {
    throw new ErrorApi("No se pudo conectar con el servidor. Verifica que la API este encendida.", 0);
  }

  if (respuesta.status === 401 && ruta !== "/auth/login") {
    cerrarSesion();
    window.location.href = "/login";
  }

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    const mensaje = Array.isArray(datos?.message) ? datos.message.join(". ") : datos?.message;
    throw new ErrorApi(mensaje ?? "Ocurrio un error inesperado", respuesta.status);
  }
  return datos as T;
}

/** Convierte los campos vacios de un formulario en undefined para no guardar cadenas vacias. */
export function limpiarFormulario(form: HTMLFormElement): Record<string, string> {
  const datos: Record<string, string> = {};
  new FormData(form).forEach((valor, clave) => {
    const texto = String(valor).trim();
    if (texto) datos[clave] = texto;
  });
  return datos;
}
