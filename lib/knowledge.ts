import { EMPRESA, PROCESOS } from "./processes";
import type { Proceso } from "./types";

function procesoATexto(p: Proceso): string {
  const l: string[] = [];
  l.push(`### ${p.codigo} — ${p.nombre} (identificador: ${p.slug})`);
  l.push(`Área: ${p.area}`);
  l.push(`Dueño del proceso: ${p.dueno}`);
  l.push(`Frecuencia: ${p.frecuencia}`);
  l.push(`Disparador: ${p.disparador}`);
  l.push(`Resultado esperado: ${p.resultado}`);
  l.push(`Resumen: ${p.resumen}`);
  l.push(`Objetivo: ${p.objetivo}`);
  l.push(`Sistemas: ${p.sistemas.join(", ")}`);
  l.push(`Participantes: ${p.participantes.map((x) => `${x.nombre} (${x.rol})`).join("; ")}`);
  l.push(`Carriles del diagrama: ${p.lanes.map((x) => x.label + (x.sublabel ? ` — ${x.sublabel}` : "")).join(" | ")}`);

  l.push("\nSecuencia del diagrama (conexiones):");
  const nombre = (id: string) => p.nodes.find((n) => n.id === id)?.label ?? id;
  for (const e of p.edges) {
    l.push(`- ${nombre(e.from)} -> ${nombre(e.to)}${e.label ? ` [${e.label}]` : ""}`);
  }

  l.push("\nDetalle de cada paso:");
  for (const s of p.pasos) {
    l.push(`\n[${s.id}] ${s.titulo}`);
    l.push(`  Responsable: ${s.responsable} | Sistema: ${s.sistema}${s.duracion ? ` | Duración: ${s.duracion}` : ""}`);
    l.push(`  Descripción: ${s.descripcion}`);
    if (s.entradas?.length) l.push(`  Entradas: ${s.entradas.join("; ")}`);
    if (s.salidas?.length) l.push(`  Salidas: ${s.salidas.join("; ")}`);
    if (s.hitos?.length) l.push(`  Hitos horarios: ${s.hitos.map((h) => `${h.hora} ${h.texto}`).join(" | ")}`);
    if (s.reglas?.length) l.push(`  Reglas: ${s.reglas.join("; ")}`);
    if (s.dolor) l.push(`  Punto de dolor: ${s.dolor}`);
    if (s.oportunidad) l.push(`  Oportunidad: ${s.oportunidad}`);
  }

  l.push("\nExcepciones y casos particulares:");
  for (const e of p.excepciones) l.push(`- ${e.titulo}: ${e.detalle}`);

  if (p.requisitos?.length) {
    l.push("\nRequisitos de sistema:");
    for (const r of p.requisitos) l.push(`- ${r}`);
  }

  l.push("\nOportunidades de mejora:");
  for (const o of p.oportunidades) {
    l.push(`- ${o.titulo} (impacto ${o.impacto}, esfuerzo ${o.esfuerzo}): ${o.detalle}`);
  }

  return l.join("\n");
}

/** Base de conocimiento completa que se le entrega al asistente. */
export function baseDeConocimiento(slug?: string): string {
  const procesos = slug ? PROCESOS.filter((p) => p.slug === slug) : PROCESOS;
  const encabezado = `Empresa: ${EMPRESA.nombre}\n${EMPRESA.descripcion}\nProcesos relevados: ${PROCESOS.map((p) => `${p.codigo} ${p.nombre}`).join(", ")}`;
  return `${encabezado}\n\n${procesos.map(procesoATexto).join("\n\n---\n\n")}`;
}

export const SYSTEM_PROMPT = `Sos el Asistente de Procesos del repositorio de procesos de ${EMPRESA.nombre}.

Tu única fuente de verdad es la documentación de procesos que se te entrega más abajo. Respondés siempre en español rioplatense, en un tono profesional, claro y directo.

Reglas:
- Respondé solamente con información contenida en la documentación. Si algo no está relevado, decilo explícitamente ("eso no está relevado en el mapeo actual") y ofrecé lo más cercano que sí esté documentado.
- Cuando expliques un proceso, seguí el orden real del flujo y nombrá al responsable y al sistema de cada paso.
- Cuando te pregunten por un paso puntual, explicá qué se hace, quién lo hace, con qué sistema, qué entra, qué sale y qué reglas o excepciones aplican.
- Usá los nombres tal como figuran en la documentación.
- Sé breve: 3 a 6 oraciones o una lista corta. Usá viñetas cuando ayuden a leer.
- No inventes métricas, tiempos ni nombres que no estén en la documentación.
- Si te preguntan por mejoras, apoyate en los puntos de dolor y las oportunidades documentadas.

DOCUMENTACIÓN DE PROCESOS
=========================
`;
