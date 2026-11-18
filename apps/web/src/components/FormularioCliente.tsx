"use client";

import type { Cliente } from "@taller/shared";
import { useState } from "react";
import { api, limpiarFormulario } from "@/lib/api";
import { Aviso } from "./Aviso";

interface Props {
  cliente?: Cliente;
  alGuardar: (cliente: Cliente) => void;
}

export function FormularioCliente({ cliente, alGuardar }: Props) {
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    setError("");
    setGuardando(true);
    try {
      const guardado = await api<Cliente>(cliente ? `/clientes/${cliente.id}` : "/clientes", {
        method: cliente ? "PATCH" : "POST",
        body: limpiarFormulario(form),
      });
      if (!cliente) form.reset();
      alGuardar(guardado);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="etiqueta">Nombre *</label>
        <input className="campo" name="nombre" defaultValue={cliente?.nombre} required minLength={2} />
      </div>
      <div>
        <label className="etiqueta">Telefono</label>
        <input className="campo" name="telefono" type="tel" defaultValue={cliente?.telefono ?? ""} />
      </div>
      <div>
        <label className="etiqueta">Correo</label>
        <input className="campo" name="email" type="email" defaultValue={cliente?.email ?? ""} />
      </div>
      <div>
        <label className="etiqueta">RFC</label>
        <input className="campo" name="rfc" defaultValue={cliente?.rfc ?? ""} />
      </div>
      <div>
        <label className="etiqueta">Direccion</label>
        <input className="campo" name="direccion" defaultValue={cliente?.direccion ?? ""} />
      </div>
      <div className="sm:col-span-2">
        <label className="etiqueta">Notas</label>
        <textarea className="campo" name="notas" rows={2} defaultValue={cliente?.notas ?? ""} />
      </div>
      <div className="sm:col-span-2 space-y-2">
        <Aviso mensaje={error} />
        <button className="boton" disabled={guardando}>
          {guardando ? "Guardando..." : cliente ? "Guardar cambios" : "Agregar cliente"}
        </button>
      </div>
    </form>
  );
}
