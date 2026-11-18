"use client";

import type { Cliente, Vehiculo } from "@taller/shared";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useSesion } from "./layout";

export default function InicioPage() {
  const usuario = useSesion();
  const [totales, setTotales] = useState<{ clientes: number; vehiculos: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<Cliente[]>("/clientes"), api<Vehiculo[]>("/vehiculos")])
      .then(([clientes, vehiculos]) => setTotales({ clientes: clientes.length, vehiculos: vehiculos.length }))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Hola, {usuario.nombre}</h1>
      {error && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/clientes" className="tarjeta hover:border-marca">
          <p className="text-sm text-slate-500">Clientes registrados</p>
          <p className="text-3xl font-semibold">{totales?.clientes ?? "-"}</p>
        </Link>
        <Link href="/vehiculos" className="tarjeta hover:border-marca">
          <p className="text-sm text-slate-500">Vehiculos registrados</p>
          <p className="text-3xl font-semibold">{totales?.vehiculos ?? "-"}</p>
        </Link>
      </div>
      <p className="text-sm text-slate-500">
        Proximamente: ordenes de trabajo, cotizaciones, facturas y reportes.
      </p>
    </div>
  );
}
