"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EMPRESA, PROCESOS } from "@/lib/processes";

export default function Sidebar() {
  const pathname = usePathname();
  const areas = Array.from(new Set(PROCESOS.map((p) => p.area)));

  return (
    <aside className="sidebar">
      <Link href="/inicio" className="brand">
        <span className="brand__mark" aria-hidden>
          NL
        </span>
        <span>
          <span className="brand__name">{EMPRESA.nombre}</span>
          <br />
          <span className="brand__sub">Repositorio de Procesos</span>
        </span>
      </Link>

      <nav>
        <div className="navgroup__title">General</div>
        <div className="navlist">
          <Link href="/inicio" className={`navitem${pathname === "/inicio" ? " navitem--active" : ""}`}>
            <span className="navitem__code">◈</span>
            <span className="navitem__label">Inicio</span>
          </Link>
        </div>
      </nav>

      {areas.map((area) => (
        <nav key={area}>
          <div className="navgroup__title">{area}</div>
          <div className="navlist">
            {PROCESOS.filter((p) => p.area === area).map((p) => {
              const activo = pathname === `/procesos/${p.slug}`;
              return (
                <Link
                  key={p.slug}
                  href={`/procesos/${p.slug}`}
                  className={`navitem${activo ? " navitem--active" : ""}`}
                >
                  <span className="navitem__code">{p.codigo}</span>
                  <span>
                    <span className="navitem__label">{p.nombre}</span>
                    <span className="navitem__meta">
                      {p.pasos.length} pasos · {p.frecuencia.split("·")[0].trim()}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      ))}

      <div className="sidebar__foot">
        <div className="sidebar__user">Acceso restringido · sesión activa</div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="btn btn--ghost btn--block">
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
