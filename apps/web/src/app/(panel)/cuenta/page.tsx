"use client";

import { ETIQUETAS_ROL, type LoginRespuesta } from "@taller/shared";
import { useState } from "react";
import { Aviso } from "@/components/Aviso";
import { api, guardarSesion } from "@/lib/api";
import { useSesion } from "../layout";

export default function CuentaPage() {
  const usuario = useSesion();
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cambiar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const datos = new FormData(form);
    setError("");
    setExito("");
    if (datos.get("nueva") !== datos.get("confirmacion")) {
      setError("La confirmacion no coincide con la nueva contrasena");
      return;
    }
    setGuardando(true);
    try {
      const respuesta = await api<LoginRespuesta>("/auth/cambiar-password", {
        method: "POST",
        body: { actual: datos.get("actual"), nueva: datos.get("nueva") },
      });
      // El servidor cierra las demas sesiones y devuelve una nueva para este dispositivo.
      guardarSesion(respuesta.accessToken, respuesta.usuario);
      form.reset();
      setExito("Contrasena actualizada. Se cerraron las sesiones abiertas en otros dispositivos.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Mi cuenta</h1>
      <div className="tarjeta text-sm">
        <p>
          <span className="text-slate-500">Nombre:</span> {usuario.nombre}
        </p>
        <p>
          <span className="text-slate-500">Correo:</span> {usuario.email}
        </p>
        <p>
          <span className="text-slate-500">Rol:</span> {ETIQUETAS_ROL[usuario.rol]}
        </p>
      </div>

      <form onSubmit={cambiar} className="tarjeta space-y-3">
        <h2 className="font-semibold">Cambiar contrasena</h2>
        <label className="block">
          <span className="etiqueta">Contrasena actual</span>
          <input className="campo" name="actual" type="password" autoComplete="current-password" required />
        </label>
        <label className="block">
          <span className="etiqueta">Nueva contrasena (minimo 10 caracteres, con letras y numeros)</span>
          <input className="campo" name="nueva" type="password" autoComplete="new-password" required minLength={10} />
        </label>
        <label className="block">
          <span className="etiqueta">Confirmar nueva contrasena</span>
          <input className="campo" name="confirmacion" type="password" autoComplete="new-password" required minLength={10} />
        </label>
        <Aviso mensaje={error} />
        {exito && <p className="rounded-md bg-green-50 p-2 text-sm text-green-700">{exito}</p>}
        <button className="boton" disabled={guardando}>
          {guardando ? "Guardando..." : "Cambiar contrasena"}
        </button>
      </form>
    </div>
  );
}
