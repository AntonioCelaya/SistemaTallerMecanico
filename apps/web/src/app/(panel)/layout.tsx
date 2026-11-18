"use client";

import { ETIQUETAS_ROL, type UsuarioSesion } from "@taller/shared";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { cerrarSesion, usuarioGuardado } from "@/lib/api";

const SesionContext = createContext<UsuarioSesion | null>(null);

/** Usuario con sesion iniciada; solo disponible dentro del panel. */
export function useSesion(): UsuarioSesion {
  const usuario = useContext(SesionContext);
  if (!usuario) throw new Error("useSesion debe usarse dentro del panel");
  return usuario;
}

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/clientes", texto: "Clientes" },
  { href: "/vehiculos", texto: "Vehiculos" },
  { href: "/usuarios", texto: "Usuarios", soloAdmin: true },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const ruta = usePathname();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  useEffect(() => {
    const guardado = usuarioGuardado();
    if (guardado) setUsuario(guardado);
    else router.replace("/login");
  }, [router]);

  if (!usuario) return null;

  function salir() {
    cerrarSesion();
    router.replace("/login");
  }

  const activo = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href));

  return (
    <SesionContext.Provider value={usuario}>
      <div className="min-h-screen md:flex">
        <aside className="bg-slate-900 text-slate-200 md:min-h-screen md:w-56">
          <div className="px-4 py-4 text-lg font-semibold text-white">Taller Mecanico</div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
            {enlaces
              .filter((e) => !e.soloAdmin || usuario.rol === "ADMIN")
              .map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  className={`rounded-md px-3 py-2 text-sm whitespace-nowrap ${
                    activo(e.href) ? "bg-marca text-white" : "hover:bg-slate-800"
                  }`}
                >
                  {e.texto}
                </Link>
              ))}
          </nav>
        </aside>
        <div className="flex-1">
          <header className="flex items-center justify-end gap-3 border-b border-slate-200 bg-white px-4 py-2 text-sm">
            <span>
              {usuario.nombre} <span className="text-slate-400">({ETIQUETAS_ROL[usuario.rol]})</span>
            </span>
            <button className="boton-secundario" onClick={salir}>
              Salir
            </button>
          </header>
          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </div>
      </div>
    </SesionContext.Provider>
  );
}
