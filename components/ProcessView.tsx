"use client";

import { useCallback, useMemo, useState } from "react";
import FlowDiagram from "./FlowDiagram";
import StepDrawer from "./StepDrawer";
import { useAgente } from "./Agent";
import type { Proceso } from "@/lib/types";

type Pestana = "diagrama" | "pasos" | "excepciones" | "oportunidades";

const IMPACTO_TAG: Record<string, string> = {
  Alto: "tag tag--rose",
  Medio: "tag tag--amber",
  Bajo: "tag",
};

export default function ProcessView({ proceso }: { proceso: Proceso }) {
  const [pestana, setPestana] = useState<Pestana>("diagrama");
  const [pasoId, setPasoId] = useState<string | null>(null);
  const { abrir } = useAgente();

  const indice = useMemo(() => proceso.pasos.findIndex((p) => p.id === pasoId), [proceso.pasos, pasoId]);
  const paso = indice >= 0 ? proceso.pasos[indice] : null;

  const navegar = useCallback(
    (delta: number) => {
      const siguiente = indice + delta;
      if (siguiente >= 0 && siguiente < proceso.pasos.length) setPasoId(proceso.pasos[siguiente].id);
    },
    [indice, proceso.pasos],
  );

  const dolores = proceso.pasos.filter((p) => p.dolor).length;

  const pestanas: { id: Pestana; label: string; count?: number }[] = [
    { id: "diagrama", label: "Diagrama" },
    { id: "pasos", label: "Pasos", count: proceso.pasos.length },
    { id: "excepciones", label: "Excepciones y reglas", count: proceso.excepciones.length },
    { id: "oportunidades", label: "Oportunidades", count: proceso.oportunidades.length },
  ];

  return (
    <>
      <header className="phead">
        <div className="phead__main">
          <div className="phead__code">
            {proceso.codigo} · {proceso.area}
          </div>
          <h1 className="page-title">{proceso.nombre}</h1>
          <p className="page-lede" style={{ marginBottom: 16 }}>
            {proceso.resumen}
          </p>
          <div className="chips">
            <span className="tag tag--accent">{proceso.frecuencia}</span>
            <span className="tag">{proceso.pasos.length} pasos</span>
            <span className="tag">{proceso.lanes.length} carriles</span>
            {dolores > 0 ? <span className="tag tag--rose">{dolores} puntos de dolor</span> : null}
            <span className="tag tag--green">{proceso.oportunidades.length} oportunidades</span>
          </div>
        </div>
      </header>

      <div className="metastrip">
        <div className="metastrip__item">
          <div className="kv__k">Dueño del proceso</div>
          <div className="kv__v">{proceso.dueno}</div>
        </div>
        <div className="metastrip__item">
          <div className="kv__k">Disparador</div>
          <div className="kv__v">{proceso.disparador}</div>
        </div>
        <div className="metastrip__item">
          <div className="kv__k">Resultado esperado</div>
          <div className="kv__v">{proceso.resultado}</div>
        </div>
        <div className="metastrip__item">
          <div className="kv__k">Sistemas involucrados</div>
          <div className="kv__v">{proceso.sistemas.join(" · ")}</div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {pestanas.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={pestana === t.id}
            className={`tab${pestana === t.id ? " tab--active" : ""}`}
            onClick={() => setPestana(t.id)}
          >
            {t.label}
            {t.count !== undefined ? <span className="tab__count">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {pestana === "diagrama" ? (
        <FlowDiagram proceso={proceso} seleccionado={pasoId} onSeleccionar={setPasoId} />
      ) : null}

      {pestana === "pasos" ? (
        <div className="steplist">
          {proceso.pasos.map((s, i) => (
            <button key={s.id} type="button" className="steprow" onClick={() => setPasoId(s.id)}>
              <span className="steprow__num">{i + 1}</span>
              <span>
                <span className="steprow__title">{s.titulo}</span>
                <span className="steprow__meta">
                  {s.responsable} · {s.sistema}
                  {s.duracion ? ` · ${s.duracion}` : ""}
                </span>
              </span>
              <span className="steprow__flags">
                {s.dolor ? <span className="flagdot flagdot--dolor" title="Punto de dolor" /> : null}
                {s.oportunidad ? <span className="flagdot flagdot--oport" title="Oportunidad" /> : null}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {pestana === "excepciones" ? (
        <div>
          <div className="grid grid--two">
            {proceso.excepciones.map((e) => (
              <div className="itemcard" key={e.titulo}>
                <h3 className="itemcard__title">
                  <span className="tag tag--amber">Excepción</span>
                  {e.titulo}
                </h3>
                <p className="itemcard__text">{e.detalle}</p>
              </div>
            ))}
          </div>

          {proceso.requisitos?.length ? (
            <>
              <div className="section-title">Requisitos de sistema</div>
              <div className="card">
                <ul className="bullets">
                  {proceso.requisitos.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}

          <div className="section-title">Participantes</div>
          <div className="grid grid--stats">
            {proceso.participantes.map((p) => (
              <div className="card" key={p.nombre}>
                <div className="kv__v">{p.nombre}</div>
                <div className="stat__label" style={{ marginTop: 4 }}>
                  {p.rol}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {pestana === "oportunidades" ? (
        <div>
          <div className="grid grid--two">
            {proceso.oportunidades.map((o) => (
              <div className="itemcard" key={o.titulo}>
                <h3 className="itemcard__title">
                  {o.titulo}
                  <span className={IMPACTO_TAG[o.impacto]}>Impacto {o.impacto}</span>
                  <span className="tag">Esfuerzo {o.esfuerzo}</span>
                </h3>
                <p className="itemcard__text">{o.detalle}</p>
              </div>
            ))}
          </div>

          <div className="section-title">Puntos de dolor detectados</div>
          <div className="grid grid--two">
            {proceso.pasos
              .filter((s) => s.dolor)
              .map((s) => (
                <button key={s.id} type="button" className="itemcard" style={{ textAlign: "left" }} onClick={() => setPasoId(s.id)}>
                  <h3 className="itemcard__title">
                    <span className="flagdot flagdot--dolor" />
                    {s.titulo}
                  </h3>
                  <p className="itemcard__text">{s.dolor}</p>
                </button>
              ))}
          </div>

          <div className="section-title">¿Querés profundizar?</div>
          <div className="card" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <p style={{ margin: 0, color: "var(--text-2)", flex: 1, minWidth: 240 }}>
              El asistente puede explicarte el impacto de cada oportunidad sobre el flujo actual y qué pasos
              quedarían afectados.
            </p>
            <button
              type="button"
              className="btn"
              onClick={() =>
                abrir(
                  `Analizá las oportunidades de mejora del proceso ${proceso.nombre} y decime cuáles priorizarías primero y por qué.`,
                )
              }
            >
              Consultar al asistente
            </button>
          </div>
        </div>
      ) : null}

      <StepDrawer
        proceso={proceso}
        paso={paso}
        indice={indice}
        total={proceso.pasos.length}
        onCerrar={() => setPasoId(null)}
        onNavegar={navegar}
        onPreguntar={(pregunta) => {
          setPasoId(null);
          abrir(pregunta);
        }}
      />
    </>
  );
}
