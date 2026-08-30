"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlowEdge, FlowNode, Lane, Proceso } from "@/lib/types";

/* ------------------------------- Geometría ------------------------------ */

const LANE_LABEL_W = 140;
const PAD_X = 30;
const PAD_RIGHT = 96;
const COL_W = 214;
const ROW_H = 122;

interface Caja {
  cx: number;
  cy: number;
  w: number;
  h: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function medidas(kind: FlowNode["kind"]): { w: number; h: number; chars: number } {
  switch (kind) {
    case "inicio":
    case "fin":
      return { w: 104, h: 44, chars: 14 };
    case "decision":
      return { w: 142, h: 78, chars: 14 };
    case "datos":
      return { w: 160, h: 66, chars: 21 };
    default:
      return { w: 160, h: 64, chars: 23 };
  }
}

function envolver(texto: string, max: number, maxLineas = 3): string[] {
  const palabras = texto.split(" ");
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    const tentativa = actual ? `${actual} ${p}` : p;
    if (tentativa.length > max && actual) {
      lineas.push(actual);
      actual = p;
    } else {
      actual = tentativa;
    }
  }
  if (actual) lineas.push(actual);
  if (lineas.length > maxLineas) {
    const cortadas = lineas.slice(0, maxLineas);
    cortadas[maxLineas - 1] = `${cortadas[maxLineas - 1].slice(0, max - 1)}…`;
    return cortadas;
  }
  return lineas;
}

/** Convierte una polilínea ortogonal en un path con esquinas redondeadas. */
function pathRedondeado(pts: [number, number][], r = 9): string {
  const limpios: [number, number][] = [];
  for (const p of pts) {
    const ult = limpios[limpios.length - 1];
    if (!ult || ult[0] !== p[0] || ult[1] !== p[1]) limpios.push(p);
  }
  if (limpios.length < 2) return "";
  let d = `M ${limpios[0][0]} ${limpios[0][1]}`;
  for (let i = 1; i < limpios.length - 1; i++) {
    const [px, py] = limpios[i - 1];
    const [cx, cy] = limpios[i];
    const [nx, ny] = limpios[i + 1];
    const d1 = Math.hypot(cx - px, cy - py);
    const d2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.max(0, Math.min(r, d1 / 2, d2 / 2));
    const a: [number, number] = [cx - ((cx - px) / (d1 || 1)) * rr, cy - ((cy - py) / (d1 || 1)) * rr];
    const b: [number, number] = [cx + ((nx - cx) / (d2 || 1)) * rr, cy + ((ny - cy) / (d2 || 1)) * rr];
    d += ` L ${a[0]} ${a[1]} Q ${cx} ${cy} ${b[0]} ${b[1]}`;
  }
  const fin = limpios[limpios.length - 1];
  d += ` L ${fin[0]} ${fin[1]}`;
  return d;
}

function rutear(e: FlowEdge, a: Caja, b: Caja): [number, number][] {
  const off = e.offset ?? 0;

  switch (e.route) {
    case "h": {
      const derecha = b.cx > a.cx;
      const x1 = derecha ? a.right : a.left;
      const x2 = derecha ? b.left : b.right;
      if (Math.abs(a.cy - b.cy) < 2) return [[x1, a.cy], [x2, b.cy]];
      const m = (x1 + x2) / 2;
      return [[x1, a.cy], [m, a.cy], [m, b.cy], [x2, b.cy]];
    }
    case "v": {
      const abajo = b.cy > a.cy;
      const y1 = abajo ? a.bottom : a.top;
      const y2 = abajo ? b.top : b.bottom;
      if (Math.abs(a.cx - b.cx) < 2) return [[a.cx, y1], [b.cx, y2]];
      const m = (y1 + y2) / 2;
      return [[a.cx, y1], [a.cx, m], [b.cx, m], [b.cx, y2]];
    }
    case "hv": {
      const derecha = b.cx > a.cx;
      const x1 = derecha ? a.right : a.left;
      const y2 = b.cy > a.cy ? b.top : b.bottom;
      return [[x1, a.cy], [b.cx, a.cy], [b.cx, y2]];
    }
    case "vh": {
      const abajo = b.cy > a.cy;
      const y1 = abajo ? a.bottom : a.top;
      const x2 = b.cx > a.cx ? b.left : b.right;
      return [[a.cx, y1], [a.cx, b.cy], [x2, b.cy]];
    }
    case "jog": {
      const x1 = off > 0 ? a.right : a.left;
      const x2 = x1 + off;
      const entrada = x2 < b.cx ? b.left : b.right;
      return [[x1, a.cy], [x2, a.cy], [x2, b.cy], [entrada, b.cy]];
    }
    case "around": {
      const abajo = e.side !== "top";
      const y1 = abajo ? a.bottom : a.top;
      const yMid = abajo ? a.bottom + Math.abs(off) : a.top - Math.abs(off);
      const y2 = b.cy < yMid ? b.bottom : b.top;
      return [[a.cx, y1], [a.cx, yMid], [b.cx, yMid], [b.cx, y2]];
    }
    default: {
      if (Math.abs(a.cy - b.cy) < 2) {
        const derecha = b.cx > a.cx;
        return [[derecha ? a.right : a.left, a.cy], [derecha ? b.left : b.right, b.cy]];
      }
      const derecha = b.cx > a.cx;
      return [
        [derecha ? a.right : a.left, a.cy],
        [b.cx, a.cy],
        [b.cx, b.cy > a.cy ? b.top : b.bottom],
      ];
    }
  }
}

/* -------------------------------- Formas -------------------------------- */

function formaPath(kind: FlowNode["kind"], c: Caja): { principal: string; extra?: string } {
  const { left: l, right: r, top: t, bottom: bo } = c;
  if (kind === "decision") {
    return { principal: `M ${c.cx} ${t} L ${r} ${c.cy} L ${c.cx} ${bo} L ${l} ${c.cy} Z` };
  }
  if (kind === "datos") {
    const ry = 8;
    const rx = c.w / 2;
    return {
      principal: `M ${l} ${t + ry} A ${rx} ${ry} 0 0 1 ${r} ${t + ry} L ${r} ${bo - ry} A ${rx} ${ry} 0 0 1 ${l} ${bo - ry} Z`,
      extra: `M ${l} ${t + ry} A ${rx} ${ry} 0 0 0 ${r} ${t + ry}`,
    };
  }
  if (kind === "documento") {
    const rr = 8;
    return {
      principal:
        `M ${l} ${t + rr} Q ${l} ${t} ${l + rr} ${t} L ${r - rr} ${t} Q ${r} ${t} ${r} ${t + rr} ` +
        `L ${r} ${bo - 9} C ${r - c.w * 0.28} ${bo - 20} ${l + c.w * 0.28} ${bo + 6} ${l} ${bo - 7} Z`,
    };
  }
  const rr = kind === "inicio" || kind === "fin" ? c.h / 2 : 10;
  return {
    principal:
      `M ${l + rr} ${t} L ${r - rr} ${t} Q ${r} ${t} ${r} ${t + rr} L ${r} ${bo - rr} ` +
      `Q ${r} ${bo} ${r - rr} ${bo} L ${l + rr} ${bo} Q ${l} ${bo} ${l} ${bo - rr} L ${l} ${t + rr} Q ${l} ${t} ${l + rr} ${t} Z`,
  };
}

/* ------------------------------ Componente ------------------------------ */

interface Props {
  proceso: Proceso;
  seleccionado: string | null;
  onSeleccionar: (id: string) => void;
}

export default function FlowDiagram({ proceso, seleccionado, onSeleccionar }: Props) {
  const [zoom, setZoom] = useState(1);
  const [hover, setHover] = useState<string | null>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const anchoRef = useRef(0);

  const modelo = useMemo(() => {
    const alturaCarril = (lane: Lane) => (lane.rows ?? 1) * ROW_H;
    const tops = new Map<string, number>();
    let y = 0;
    for (const lane of proceso.lanes) {
      tops.set(lane.id, y);
      y += alturaCarril(lane);
    }
    const alto = y;

    const cajas = new Map<string, Caja>();
    let maxCol = 0;
    for (const n of proceso.nodes) {
      const { w, h } = medidas(n.kind);
      const cx = LANE_LABEL_W + PAD_X + n.col * COL_W + 80;
      const cy = (tops.get(n.lane) ?? 0) + (n.row ?? 0) * ROW_H + ROW_H / 2;
      cajas.set(n.id, {
        cx,
        cy,
        w,
        h,
        left: cx - w / 2,
        right: cx + w / 2,
        top: cy - h / 2,
        bottom: cy + h / 2,
      });
      maxCol = Math.max(maxCol, n.col);
    }

    const ancho = LANE_LABEL_W + PAD_X + maxCol * COL_W + 160 + PAD_RIGHT;

    const conexiones = proceso.edges.map((e) => {
      const a = cajas.get(e.from);
      const b = cajas.get(e.to);
      if (!a || !b) return null;
      const pts = rutear(e, a, b);
      const d = pathRedondeado(pts);
      // La etiqueta se coloca sobre el segmento mas largo del recorrido.
      let mejor = 0;
      let etiquetaPos: [number, number] = pts[0];
      for (let i = 0; i < pts.length - 1; i++) {
        const largo = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        if (largo > mejor) {
          mejor = largo;
          etiquetaPos = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
        }
      }
      return { e, d, etiquetaPos };
    });

    return { tops, alto, ancho, cajas, conexiones: conexiones.filter(Boolean) as NonNullable<(typeof conexiones)[number]>[] };
  }, [proceso]);

  anchoRef.current = modelo.ancho;

  const ajustar = useCallback(() => {
    const caja = contenedorRef.current;
    if (!caja) return;
    const disponible = caja.clientWidth - 16;
    if (disponible <= 0) return;
    setZoom(Math.max(0.45, Math.min(1, +(disponible / anchoRef.current).toFixed(2))));
  }, []);

  // Al montar y al cambiar el ancho disponible se encuadra el diagrama completo.
  useEffect(() => {
    ajustar();
    const caja = contenedorRef.current;
    if (!caja || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver(() => ajustar());
    obs.observe(caja);
    return () => obs.disconnect();
  }, [ajustar, proceso.slug]);

  const activo = hover ?? seleccionado;

  return (
    <div className="diagram">
      <div className="diagram__bar">
        <span className="diagram__hint">
          <span aria-hidden>◆</span> Hacé clic en cualquier paso del diagrama para ver el detalle
        </span>
        <div className="diagram__zoom">
          <button
            type="button"
            className="zoombtn"
            onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
            aria-label="Alejar"
          >
            −
          </button>
          <span className="zoomlevel">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="zoombtn"
            onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}
            aria-label="Acercar"
          >
            +
          </button>
          <button type="button" className="zoombtn zoombtn--wide" onClick={ajustar} aria-label="Ajustar a la pantalla">
            Ajustar
          </button>
        </div>
      </div>

      <div className="diagram__scroll" ref={contenedorRef}>
        <svg
          width={modelo.ancho * zoom}
          height={modelo.alto * zoom}
          viewBox={`0 0 ${modelo.ancho} ${modelo.alto}`}
          role="img"
          aria-label={`Diagrama de flujo del proceso ${proceso.nombre}`}
        >
          <defs>
            <marker id="fl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#46586d" />
            </marker>
            <marker id="fl-arrow-ret" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6b5a3a" />
            </marker>
            <marker id="fl-arrow-hl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#19e0cf" />
            </marker>
          </defs>

          {/* Carriles */}
          {proceso.lanes.map((lane, i) => {
            const top = modelo.tops.get(lane.id) ?? 0;
            const alto = (lane.rows ?? 1) * ROW_H;
            return (
              <g key={lane.id}>
                <rect
                  className={i % 2 === 0 ? "lane-band" : "lane-band lane-band--alt"}
                  x={0}
                  y={top}
                  width={modelo.ancho}
                  height={alto}
                />
                <rect className="lane-strip" x={0} y={top} width={LANE_LABEL_W} height={alto} />
                <line className="lane-line" x1={0} y1={top} x2={modelo.ancho} y2={top} />
                <line className="lane-line" x1={LANE_LABEL_W} y1={top} x2={LANE_LABEL_W} y2={top + alto} />
                <text className="lane-label" x={16} y={top + 26}>
                  {lane.label}
                </text>
                {lane.sublabel ? (
                  <text className="lane-sub" x={16} y={top + 43}>
                    {lane.sublabel}
                  </text>
                ) : null}
              </g>
            );
          })}
          <line className="lane-line" x1={0} y1={modelo.alto} x2={modelo.ancho} y2={modelo.alto} />

          {/* Conexiones */}
          {modelo.conexiones.map(({ e, d, etiquetaPos }, i) => {
            const resaltado = activo === e.from || activo === e.to;
            const retorno = e.variant === "retorno";
            return (
              <g key={`${e.from}-${e.to}-${i}`}>
                <path
                  className={`edge${retorno ? " edge--retorno" : ""}${resaltado ? " edge--hl" : ""}`}
                  d={d}
                  markerEnd={`url(#${resaltado ? "fl-arrow-hl" : retorno ? "fl-arrow-ret" : "fl-arrow"})`}
                />
                {e.label ? (
                  <g>
                    <rect
                      className="edge-label-bg"
                      x={etiquetaPos[0] - (e.label.length * 3.2 + 6)}
                      y={etiquetaPos[1] - 8}
                      width={e.label.length * 6.4 + 12}
                      height={16}
                      rx={4}
                    />
                    <text className="edge-label" x={etiquetaPos[0]} y={etiquetaPos[1] + 3.5} textAnchor="middle">
                      {e.label}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* Nodos */}
          {proceso.nodes.map((n) => {
            const c = modelo.cajas.get(n.id)!;
            const { chars } = medidas(n.kind);
            const lineas = envolver(n.label, chars, n.kind === "decision" ? 2 : 3);
            const forma = formaPath(n.kind, c);
            const sel = seleccionado === n.id;
            const tieneDetalle = proceso.pasos.some((p) => p.id === n.id);
            const paso = proceso.pasos.find((p) => p.id === n.id);
            const inicioY = c.cy - ((lineas.length - 1) * 13) / 2 + 4;
            return (
              <g
                key={n.id}
                className={`node node--${n.kind}${sel ? " node--sel" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`${n.label}. Ver detalle del paso.`}
                onClick={() => tieneDetalle && onSeleccionar(n.id)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    if (tieneDetalle) onSeleccionar(n.id);
                  }
                }}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
              >
                <path className="node__shape" d={forma.principal} />
                {forma.extra ? <path className="node__shape" d={forma.extra} fill="none" /> : null}
                {lineas.map((linea, i) => (
                  <text key={i} className="node__text" x={c.cx} y={inicioY + i * 13} textAnchor="middle">
                    {linea}
                  </text>
                ))}
                {paso?.dolor ? <circle cx={c.right - 9} cy={c.top + 9} r={3.4} fill="#ff7a8a" /> : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="legend">
        <span className="legend__item">
          <span className="legend__swatch legend__swatch--terminal" /> Inicio / Fin
        </span>
        <span className="legend__item">
          <span className="legend__swatch" /> Actividad
        </span>
        <span className="legend__item">
          <span className="legend__swatch legend__swatch--decision" /> Decisión
        </span>
        <span className="legend__item">
          <span className="legend__swatch legend__swatch--datos" /> Datos / documento
        </span>
        <span className="legend__item">
          <span className="flagdot flagdot--dolor" /> Punto de dolor identificado
        </span>
      </div>
    </div>
  );
}
