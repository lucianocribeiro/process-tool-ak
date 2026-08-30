"use client";

import { useEffect } from "react";
import type { Proceso, StepDetail } from "@/lib/types";

interface Props {
  proceso: Proceso;
  paso: StepDetail | null;
  indice: number;
  total: number;
  onCerrar: () => void;
  onNavegar: (delta: number) => void;
  onPreguntar: (pregunta: string) => void;
}

export default function StepDrawer({ proceso, paso, indice, total, onCerrar, onNavegar, onPreguntar }: Props) {
  useEffect(() => {
    if (!paso) return;
    const manejar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
      if (e.key === "ArrowRight") onNavegar(1);
      if (e.key === "ArrowLeft") onNavegar(-1);
    };
    window.addEventListener("keydown", manejar);
    return () => window.removeEventListener("keydown", manejar);
  }, [paso, onCerrar, onNavegar]);

  if (!paso) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onCerrar} aria-hidden />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Detalle del paso ${paso.titulo}`}>
        <header className="drawer__head">
          <div>
            <span className="tag tag--accent">
              Paso {indice + 1} de {total}
            </span>
            <h2 className="drawer__title">{paso.titulo}</h2>
          </div>
          <button type="button" className="drawer__close" onClick={onCerrar} aria-label="Cerrar detalle">
            ✕
          </button>
        </header>

        <div className="drawer__body">
          <div className="kv">
            <div>
              <div className="kv__k">Responsable</div>
              <div className="kv__v">{paso.responsable}</div>
            </div>
            <div>
              <div className="kv__k">Sistema</div>
              <div className="kv__v">{paso.sistema}</div>
            </div>
            {paso.duracion ? (
              <div>
                <div className="kv__k">Duración</div>
                <div className="kv__v">{paso.duracion}</div>
              </div>
            ) : null}
          </div>

          <div className="block">
            <h3 className="block__title">Qué se hace</h3>
            <p>{paso.descripcion}</p>
          </div>

          {paso.hitos?.length ? (
            <div className="block">
              <h3 className="block__title">Hitos horarios</h3>
              <div className="timeline">
                {paso.hitos.map((h, i) => (
                  <div className="timeline__row" key={i}>
                    <span className="timeline__hour">{h.hora}</span>
                    <span className="timeline__text">{h.texto}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {paso.entradas?.length ? (
            <div className="block">
              <h3 className="block__title">Entradas</h3>
              <div className="chips">
                {paso.entradas.map((x) => (
                  <span className="tag" key={x}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {paso.salidas?.length ? (
            <div className="block">
              <h3 className="block__title">Salidas</h3>
              <div className="chips">
                {paso.salidas.map((x) => (
                  <span className="tag tag--violet" key={x}>
                    {x}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {paso.reglas?.length ? (
            <div className="block">
              <h3 className="block__title">Reglas de negocio</h3>
              <ul className="bullets">
                {paso.reglas.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {paso.dolor ? (
            <div className="block">
              <div className="callout callout--dolor">
                <span className="callout__icon" aria-hidden>
                  ▲
                </span>
                <span>
                  <strong>Punto de dolor. </strong>
                  {paso.dolor}
                </span>
              </div>
            </div>
          ) : null}

          {paso.oportunidad ? (
            <div className="block">
              <div className="callout callout--oport">
                <span className="callout__icon" aria-hidden>
                  ✦
                </span>
                <span>
                  <strong>Oportunidad. </strong>
                  {paso.oportunidad}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="drawer__foot">
          <button
            type="button"
            className="btn btn--ghost drawer__nav"
            onClick={() => onNavegar(-1)}
            disabled={indice === 0}
            aria-label="Paso anterior"
          >
            ←
          </button>
          <button
            type="button"
            className="btn btn--ghost drawer__nav"
            onClick={() => onNavegar(1)}
            disabled={indice === total - 1}
            aria-label="Paso siguiente"
          >
            →
          </button>
          <button
            type="button"
            className="btn"
            style={{ marginLeft: "auto" }}
            onClick={() =>
              onPreguntar(
                `Explicame en detalle el paso "${paso.titulo}" del proceso ${proceso.nombre}: qué se hace, quién lo hace, qué reglas aplican y qué riesgos tiene.`,
              )
            }
          >
            Preguntar al asistente
          </button>
        </footer>
      </aside>
    </>
  );
}
