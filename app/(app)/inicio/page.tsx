import Link from "next/link";
import { EMPRESA, PROCESOS } from "@/lib/processes";

export const metadata = { title: "Inicio · Repositorio de Procesos" };

export default function InicioPage() {
  const totalPasos = PROCESOS.reduce((n, p) => n + p.pasos.length, 0);
  const roles = new Set(PROCESOS.flatMap((p) => p.participantes.map((x) => x.nombre)));
  const sistemas = new Set(PROCESOS.flatMap((p) => p.sistemas));
  const oportunidades = PROCESOS.reduce((n, p) => n + p.oportunidades.length, 0);

  return (
    <>
      <header className="topbar">
        <div className="crumbs">
          <span>Repositorio</span>
          <span aria-hidden>/</span>
          <strong>Inicio</strong>
        </div>
        <div className="topbar__spacer" />
        <span className="tag tag--accent">{PROCESOS.length} procesos relevados</span>
      </header>

      <div className="content">
        <h1 className="page-title">Procesos de {EMPRESA.nombre}</h1>
        <p className="page-lede">
          {EMPRESA.descripcion} Este repositorio concentra el relevamiento de los procesos operativos: cada uno
          incluye su diagrama de flujo navegable, el detalle de cada paso con responsables, sistemas y reglas de
          negocio, las excepciones documentadas y las oportunidades de mejora identificadas.
        </p>

        <div className="grid grid--stats">
          <div className="card">
            <div className="stat__value">{PROCESOS.length}</div>
            <div className="stat__label">Procesos mapeados</div>
          </div>
          <div className="card">
            <div className="stat__value">{totalPasos}</div>
            <div className="stat__label">Pasos documentados</div>
          </div>
          <div className="card">
            <div className="stat__value">{roles.size}</div>
            <div className="stat__label">Roles involucrados</div>
          </div>
          <div className="card">
            <div className="stat__value">{sistemas.size}</div>
            <div className="stat__label">Sistemas relevados</div>
          </div>
          <div className="card">
            <div className="stat__value">{oportunidades}</div>
            <div className="stat__label">Oportunidades</div>
          </div>
        </div>

        <div className="section-title">Procesos</div>
        <div className="grid grid--cards">
          {PROCESOS.map((p) => (
            <Link href={`/procesos/${p.slug}`} className="pcard" key={p.slug}>
              <div className="pcard__top">
                <span className="tag tag--accent">{p.codigo}</span>
                <span className="tag">{p.area}</span>
              </div>
              <h2 className="pcard__name">{p.nombre}</h2>
              <p className="pcard__desc">{p.resumen}</p>
              <div className="pcard__foot">
                <span>
                  <b>{p.pasos.length}</b> pasos
                </span>
                <span>
                  <b>{p.lanes.length}</b> carriles
                </span>
                <span>
                  <b>{p.oportunidades.length}</b> mejoras
                </span>
                <span>{p.frecuencia.split("·")[0].trim()}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="section-title">Cómo usar el repositorio</div>
        <div className="grid grid--cards">
          <div className="card">
            <h3 className="itemcard__title">1 · Recorré el diagrama</h3>
            <p className="itemcard__text">
              Cada proceso se muestra como un diagrama de carriles. Hacé clic en cualquier paso para ver quién lo
              ejecuta, con qué sistema, qué entra, qué sale y qué reglas aplican.
            </p>
          </div>
          <div className="card">
            <h3 className="itemcard__title">2 · Revisá excepciones y mejoras</h3>
            <p className="itemcard__text">
              Las pestañas de cada proceso separan el flujo normal de las excepciones documentadas y de las
              oportunidades de mejora priorizadas por impacto y esfuerzo.
            </p>
          </div>
          <div className="card">
            <h3 className="itemcard__title">3 · Preguntale al asistente</h3>
            <p className="itemcard__text">
              El Asistente de Procesos leyó toda la documentación. Preguntale por un proceso completo, por un paso
              puntual o por quién es responsable de qué, en lenguaje natural.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
