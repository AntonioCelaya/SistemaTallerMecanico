"use client";

import { ETIQUETAS_ROL, ROLES, type Usuario } from "@taller/shared";
import { useCallback, useEffect, useState } from "react";
import { Aviso } from "@/components/Aviso";
import { api, limpiarFormulario } from "@/lib/api";
import { useSesion } from "../layout";

export default function UsuariosPage() {
  const sesion = useSesion();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState("");
  const [errorFormulario, setErrorFormulario] = useState("");

  const cargar = useCallback(() => {
    api<Usuario[]>("/usuarios")
      .then(setUsuarios)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (sesion.rol === "ADMIN") cargar();
  }, [cargar, sesion.rol]);

  async function crear(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const form = evento.currentTarget;
    setErrorFormulario("");
    try {
      await api("/usuarios", { method: "POST", body: limpiarFormulario(form) });
      form.reset();
      cargar();
    } catch (e) {
      setErrorFormulario((e as Error).message);
    }
  }

  async function cambiarEstado(u: Usuario) {
    const accion = u.activo ? "Desactivar" : "Activar";
    if (!confirm(`${accion} a ${u.nombre}?${u.activo ? " Su sesion se cerrara de inmediato." : ""}`)) return;
    try {
      await api(`/usuarios/${u.id}`, { method: "PATCH", body: { activo: !u.activo } });
      cargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (sesion.rol !== "ADMIN") return <Aviso mensaje="Solo los administradores pueden ver esta seccion." />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <Aviso mensaje={error} />

      <div className="tarjeta overflow-x-auto p-0">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td>{ETIQUETAS_ROL[u.rol]}</td>
                <td>{u.activo ? "Activo" : "Inactivo"}</td>
                <td className="text-right">
                  {u.id !== sesion.id && (
                    <button className="boton-secundario" onClick={() => cambiarEstado(u)}>
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="tarjeta space-y-3">
        <h2 className="font-semibold">Nuevo usuario</h2>
        <form method="post" onSubmit={crear} className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="etiqueta">Nombre *</label>
            <input className="campo" name="nombre" required minLength={2} />
          </div>
          <div>
            <label className="etiqueta">Correo *</label>
            <input className="campo" name="email" type="email" required />
          </div>
          <div>
            <label className="etiqueta">Contrasena * (minimo 10 caracteres, con letras y numeros)</label>
            <input className="campo" name="password" type="password" required minLength={10} autoComplete="new-password" />
          </div>
          <div>
            <label className="etiqueta">Rol *</label>
            <select className="campo" name="rol" defaultValue="TECNICO">
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ETIQUETAS_ROL[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Aviso mensaje={errorFormulario} />
            <button className="boton">Crear usuario</button>
          </div>
        </form>
      </section>
    </div>
  );
}
