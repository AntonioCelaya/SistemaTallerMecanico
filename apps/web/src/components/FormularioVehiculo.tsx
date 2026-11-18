"use client";

import type { Cliente, Vehiculo } from "@taller/shared";
import { useState } from "react";
import { api, limpiarFormulario } from "@/lib/api";
import { Aviso } from "./Aviso";

interface Props {
  /** Si se indica, el vehiculo se asigna a este cliente y no se muestra el selector. */
  clienteId?: string;
  clientes?: Cliente[];
  alGuardar: (vehiculo: Vehiculo) => void;
}

export function FormularioVehiculo({ clienteId, clientes = [], alGuardar }: Props) {
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    const datos: Record<string, string | number> = limpiarFormulario(form);
    for (const campo of ["anio", "kilometraje"]) {
      if (datos[campo] !== undefined) datos[campo] = Number(datos[campo]);
    }
    if (clienteId) datos.clienteId = clienteId;

    setError("");
    setGuardando(true);
    try {
      const vehiculo = await api<Vehiculo>("/vehiculos", { method: "POST", body: datos });
      form.reset();
      alGuardar(vehiculo);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="grid gap-3 sm:grid-cols-3">
      {!clienteId && (
        <div className="sm:col-span-3">
          <label className="etiqueta">Cliente *</label>
          <select className="campo" name="clienteId" required defaultValue="">
            <option value="" disabled>
              Selecciona un cliente
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="etiqueta">Marca *</label>
        <input className="campo" name="marca" required />
      </div>
      <div>
        <label className="etiqueta">Modelo *</label>
        <input className="campo" name="modelo" required />
      </div>
      <div>
        <label className="etiqueta">Ano</label>
        <input className="campo" name="anio" type="number" min={1900} max={2100} />
      </div>
      <div>
        <label className="etiqueta">Placas *</label>
        <input className="campo uppercase" name="placas" required minLength={3} />
      </div>
      <div>
        <label className="etiqueta">Color</label>
        <input className="campo" name="color" />
      </div>
      <div>
        <label className="etiqueta">Kilometraje</label>
        <input className="campo" name="kilometraje" type="number" min={0} />
      </div>
      <div className="sm:col-span-3">
        <label className="etiqueta">VIN / Numero de serie</label>
        <input className="campo uppercase" name="vin" />
      </div>
      <div className="sm:col-span-3 space-y-2">
        <Aviso mensaje={error} />
        <button className="boton" disabled={guardando}>
          {guardando ? "Guardando..." : "Agregar vehiculo"}
        </button>
      </div>
    </form>
  );
}
