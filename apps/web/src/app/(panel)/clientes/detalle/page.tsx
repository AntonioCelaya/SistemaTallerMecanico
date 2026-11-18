"use client";

import type { Cliente } from "@taller/shared";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Aviso } from "@/components/Aviso";
import { FormularioCliente } from "@/components/FormularioCliente";
import { FormularioVehiculo } from "@/components/FormularioVehiculo";
import { api } from "@/lib/api";
import { useSesion } from "../../layout";

// La ruta usa ?id= en lugar de /clientes/[id] para que funcione con la exportacion estatica.
function DetalleCliente() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const usuario = useSesion();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const cargar = useCallback(() => {
    api<Cliente>(`/clientes/${id}`)
      .then(setCliente)
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(cargar, [cargar]);

  async function eliminar() {
    if (!cliente || !confirm(`Eliminar al cliente ${cliente.nombre}?`)) return;
    try {
      await api(`/clientes/${cliente.id}`, { method: "DELETE" });
      router.replace("/clientes");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!cliente) return <Aviso mensaje={error} />;

  return (
    <div className="space-y-4">
      <Link href="/clientes" className="text-sm text-slate-500 hover:underline">
        &larr; Clientes
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{cliente.nombre}</h1>
        {usuario.rol === "ADMIN" && (
          <button className="boton-peligro" onClick={eliminar}>
            Eliminar cliente
          </button>
        )}
      </div>
      <Aviso mensaje={error} />

      <section className="tarjeta space-y-3">
        <h2 className="font-semibold">Datos del cliente</h2>
        {aviso && <p className="rounded-md bg-green-50 p-2 text-sm text-green-700">{aviso}</p>}
        <FormularioCliente
          key={cliente.actualizadoEn}
          cliente={cliente}
          alGuardar={() => {
            setAviso("Cambios guardados");
            cargar();
          }}
        />
      </section>

      <section className="tarjeta space-y-3">
        <h2 className="font-semibold">Vehiculos</h2>
        <table className="tabla">
          <thead>
            <tr>
              <th>Placas</th>
              <th>Vehiculo</th>
              <th>Color</th>
              <th>Kilometraje</th>
            </tr>
          </thead>
          <tbody>
            {cliente.vehiculos?.map((v) => (
              <tr key={v.id}>
                <td className="font-mono">{v.placas}</td>
                <td>
                  {v.marca} {v.modelo} {v.anio ?? ""}
                </td>
                <td>{v.color ?? "-"}</td>
                <td>{v.kilometraje?.toLocaleString("es-MX") ?? "-"}</td>
              </tr>
            ))}
            {!cliente.vehiculos?.length && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-slate-500">
                  Sin vehiculos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <h3 className="pt-2 text-sm font-semibold text-slate-600">Agregar vehiculo</h3>
        <FormularioVehiculo clienteId={cliente.id} alGuardar={cargar} />
      </section>
    </div>
  );
}

export default function DetalleClientePage() {
  return (
    <Suspense>
      <DetalleCliente />
    </Suspense>
  );
}
