"use client";

import type { Cliente } from "@taller/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Aviso } from "@/components/Aviso";
import { FormularioCliente } from "@/components/FormularioCliente";
import { api } from "@/lib/api";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    const q = busqueda.trim() ? `?q=${encodeURIComponent(busqueda.trim())}` : "";
    api<Cliente[]>(`/clientes${q}`)
      .then(setClientes)
      .catch((e) => setError(e.message));
  }, [busqueda]);

  useEffect(() => {
    const espera = setTimeout(cargar, 250);
    return () => clearTimeout(espera);
  }, [cargar]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <button className="boton" onClick={() => setMostrarFormulario((v) => !v)}>
          {mostrarFormulario ? "Cerrar" : "Nuevo cliente"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="tarjeta">
          <FormularioCliente
            alGuardar={() => {
              setMostrarFormulario(false);
              cargar();
            }}
          />
        </div>
      )}

      <input
        className="campo max-w-sm"
        placeholder="Buscar por nombre, telefono o correo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <Aviso mensaje={error} />

      <div className="tarjeta overflow-x-auto p-0">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Telefono</th>
              <th>Correo</th>
              <th>Vehiculos</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td>
                  <Link href={`/clientes/detalle?id=${c.id}`} className="font-medium text-marca hover:underline">
                    {c.nombre}
                  </Link>
                </td>
                <td>{c.telefono ?? "-"}</td>
                <td>{c.email ?? "-"}</td>
                <td>{c._count?.vehiculos ?? 0}</td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">
                  No hay clientes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
