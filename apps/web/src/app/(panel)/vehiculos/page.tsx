"use client";

import type { Cliente, Vehiculo } from "@taller/shared";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Aviso } from "@/components/Aviso";
import { FormularioVehiculo } from "@/components/FormularioVehiculo";
import { api } from "@/lib/api";
import { useSesion } from "../layout";

export default function VehiculosPage() {
  const usuario = useSesion();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    const q = busqueda.trim() ? `?q=${encodeURIComponent(busqueda.trim())}` : "";
    api<Vehiculo[]>(`/vehiculos${q}`)
      .then(setVehiculos)
      .catch((e) => setError(e.message));
  }, [busqueda]);

  useEffect(() => {
    const espera = setTimeout(cargar, 250);
    return () => clearTimeout(espera);
  }, [cargar]);

  async function abrirFormulario() {
    if (!mostrarFormulario) {
      api<Cliente[]>("/clientes")
        .then(setClientes)
        .catch((e) => setError(e.message));
    }
    setMostrarFormulario((v) => !v);
  }

  async function eliminar(v: Vehiculo) {
    if (!confirm(`Eliminar el vehiculo con placas ${v.placas}?`)) return;
    try {
      await api(`/vehiculos/${v.id}`, { method: "DELETE" });
      cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Vehiculos</h1>
        <button className="boton" onClick={abrirFormulario}>
          {mostrarFormulario ? "Cerrar" : "Nuevo vehiculo"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="tarjeta">
          {clientes.length === 0 ? (
            <p className="text-sm text-slate-500">
              Primero registra un cliente en <Link href="/clientes" className="text-marca underline">Clientes</Link>.
            </p>
          ) : (
            <FormularioVehiculo
              clientes={clientes}
              alGuardar={() => {
                setMostrarFormulario(false);
                cargar();
              }}
            />
          )}
        </div>
      )}

      <input
        className="campo max-w-sm"
        placeholder="Buscar por placas, marca o modelo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <Aviso mensaje={error} />

      <div className="tarjeta overflow-x-auto p-0">
        <table className="tabla">
          <thead>
            <tr>
              <th>Placas</th>
              <th>Vehiculo</th>
              <th>Cliente</th>
              <th>Kilometraje</th>
              {usuario.rol === "ADMIN" && <th />}
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50">
                <td className="font-mono">{v.placas}</td>
                <td>
                  {v.marca} {v.modelo} {v.anio ?? ""}
                </td>
                <td>
                  {v.cliente && (
                    <Link href={`/clientes/detalle?id=${v.cliente.id}`} className="text-marca hover:underline">
                      {v.cliente.nombre}
                    </Link>
                  )}
                </td>
                <td>{v.kilometraje?.toLocaleString("es-MX") ?? "-"}</td>
                {usuario.rol === "ADMIN" && (
                  <td className="text-right">
                    <button className="boton-peligro" onClick={() => eliminar(v)}>
                      Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {vehiculos.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  No hay vehiculos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
