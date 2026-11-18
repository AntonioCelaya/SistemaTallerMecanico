"use client";

import type { LoginRespuesta } from "@taller/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, guardarSesion } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    setError("");
    setCargando(true);
    try {
      const respuesta = await api<LoginRespuesta>("/auth/login", {
        method: "POST",
        body: { email: datos.get("email"), password: datos.get("password") },
      });
      guardarSesion(respuesta.accessToken, respuesta.usuario);
      router.replace("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <form method="post" onSubmit={entrar} className="tarjeta w-full max-w-sm space-y-4 p-6">
        <div>
          <h1 className="text-xl font-semibold">Taller Mecanico</h1>
          <p className="text-sm text-slate-500">Inicia sesion para continuar</p>
        </div>
        <div>
          <label className="etiqueta" htmlFor="email">Correo</label>
          <input className="campo" id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div>
          <label className="etiqueta" htmlFor="password">Contrasena</label>
          <input className="campo" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        <button className="boton w-full" disabled={cargando}>
          {cargando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
