import { PROCESOS, getProceso } from "./processes";
import type { Proceso, StepDetail } from "./types";

const STOP = new Set([
  "que","cual","cuales","como","donde","quien","quienes","cuando","cuanto","por","para","con","sin","del","las","los","una","uno","unos","unas","este","esta","esto","esos","esas","hay","son","ser","hace","hacer","sobre","desde","hasta","mas","muy","pero","the","and","dame","decime","explicame","explica","contame","favor","proceso","procesos","paso","pasos",
]);

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(texto: string): string[] {
  return normalizar(texto)
    .split(" ")
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function puntaje(consulta: string[], texto: string): number {
  const base = normalizar(texto);
  let p = 0;
  for (const t of consulta) if (base.includes(t)) p += t.length > 5 ? 2 : 1;
  return p;
}

function detectarProceso(consulta: string[], slug?: string): Proceso | undefined {
  if (slug) {
    const p = getProceso(slug);
    if (p) return p;
  }
  let mejor: Proceso | undefined;
  let mejorPuntaje = 0;
  for (const p of PROCESOS) {
    const s = puntaje(consulta, `${p.nombre} ${p.slug} ${p.area} ${p.codigo} ${p.resumen}`);
    if (s > mejorPuntaje) {
      mejor = p;
      mejorPuntaje = s;
    }
  }
  return mejorPuntaje >= 2 ? mejor : undefined;
}

function detallePaso(p: Proceso, s: StepDetail): string {
  const l: string[] = [];
  l.push(`**${s.titulo}** · ${p.codigo} ${p.nombre}`);
  l.push("");
  l.push(s.descripcion);
  l.push("");
  l.push(`- **Responsable:** ${s.responsable}`);
  l.push(`- **Sistema:** ${s.sistema}`);
  if (s.duracion) l.push(`- **Duración:** ${s.duracion}`);
  if (s.entradas?.length) l.push(`- **Entradas:** ${s.entradas.join(", ")}`);
  if (s.salidas?.length) l.push(`- **Salidas:** ${s.salidas.join(", ")}`);
  if (s.reglas?.length) {
    l.push("");
    l.push("**Reglas**");
    for (const r of s.reglas) l.push(`- ${r}`);
  }
  if (s.hitos?.length) {
    l.push("");
    l.push("**Hitos horarios**");
    for (const h of s.hitos) l.push(`- ${h.hora} — ${h.texto}`);
  }
  if (s.dolor) {
    l.push("");
    l.push(`**Punto de dolor:** ${s.dolor}`);
  }
  if (s.oportunidad) l.push(`**Oportunidad:** ${s.oportunidad}`);
  return l.join("\n");
}

function resumenProceso(p: Proceso): string {
  const l: string[] = [];
  l.push(`**${p.codigo} · ${p.nombre}** — ${p.area}`);
  l.push("");
  l.push(p.resumen);
  l.push("");
  l.push(`- **Dueño:** ${p.dueno}`);
  l.push(`- **Frecuencia:** ${p.frecuencia}`);
  l.push(`- **Disparador:** ${p.disparador}`);
  l.push(`- **Resultado:** ${p.resultado}`);
  l.push(`- **Sistemas:** ${p.sistemas.join(", ")}`);
  l.push("");
  l.push("**Secuencia principal**");
  p.pasos.slice(0, 40).forEach((s, i) => {
    l.push(`${i + 1}. ${s.titulo} — ${s.responsable}`);
  });
  return l.join("\n");
}

/**
 * Respuesta local, sin llamada a la API. Se arma exclusivamente con la
 * documentacion cargada en la herramienta.
 */
export function responderLocal(pregunta: string, slug?: string): string {
  const q = tokens(pregunta);
  const norm = normalizar(pregunta);

  if (!q.length) {
    return "Contame qué querés saber: puedo explicarte cualquiera de los tres procesos relevados, un paso puntual, quién es responsable de qué, las excepciones o las oportunidades de mejora.";
  }

  const proceso = detectarProceso(q, slug);

  if (!proceso) {
    const l = ["Puedo ayudarte con los tres procesos relevados:", ""];
    for (const p of PROCESOS) l.push(`- **${p.codigo} · ${p.nombre}** (${p.area}) — ${p.resumen.split(".")[0]}.`);
    l.push("");
    l.push("Preguntame por uno de ellos, por un paso puntual o por las oportunidades de mejora.");
    return l.join("\n");
  }

  // Paso puntual: se busca el paso con mayor coincidencia.
  let mejorPaso: StepDetail | undefined;
  let mejorPasoPuntaje = 0;
  for (const s of proceso.pasos) {
    const val = puntaje(q, `${s.titulo} ${s.descripcion} ${s.responsable} ${s.sistema}`);
    if (val > mejorPasoPuntaje) {
      mejorPaso = s;
      mejorPasoPuntaje = val;
    }
  }

  if (/dolor|problema|cuello|falla|riesgo|duele/.test(norm)) {
    const dolores = proceso.pasos.filter((s) => s.dolor);
    const l = [`**Puntos de dolor · ${proceso.nombre}**`, ""];
    for (const s of dolores) l.push(`- **${s.titulo}:** ${s.dolor}`);
    return l.join("\n");
  }

  if (/mejora|oportunidad|automatiz|optimiz|recomend|propuesta/.test(norm)) {
    const l = [`**Oportunidades de mejora · ${proceso.nombre}**`, ""];
    for (const o of proceso.oportunidades) {
      l.push(`- **${o.titulo}** (impacto ${o.impacto} · esfuerzo ${o.esfuerzo}): ${o.detalle}`);
    }
    return l.join("\n");
  }

  if (/excepcion|caso particular|feriado|viernes|urgencia|contingencia|guardia/.test(norm)) {
    const l = [`**Excepciones · ${proceso.nombre}**`, ""];
    for (const e of proceso.excepciones) l.push(`- **${e.titulo}:** ${e.detalle}`);
    return l.join("\n");
  }

  if (/requisit|sistema necesit|tabla|base de datos/.test(norm) && proceso.requisitos?.length) {
    const l = [`**Requisitos de sistema · ${proceso.nombre}**`, ""];
    for (const r of proceso.requisitos) l.push(`- ${r}`);
    return l.join("\n");
  }

  if (/quien|responsable|rol|participante|equipo|dueno/.test(norm)) {
    const l = [`**Participantes · ${proceso.nombre}**`, ""];
    for (const x of proceso.participantes) l.push(`- **${x.nombre}** — ${x.rol}`);
    l.push("");
    l.push(`Dueño del proceso: **${proceso.dueno}**.`);
    return l.join("\n");
  }

  if (/sistema|herramienta|software|app/.test(norm) && mejorPasoPuntaje < 4) {
    return `**Sistemas · ${proceso.nombre}**\n\n${proceso.sistemas.map((s) => `- ${s}`).join("\n")}`;
  }

  if (/frecuencia|cada cuanto|cuando|periodicidad|dispara/.test(norm)) {
    return `**${proceso.nombre}**\n\n- **Frecuencia:** ${proceso.frecuencia}\n- **Disparador:** ${proceso.disparador}\n- **Resultado:** ${proceso.resultado}`;
  }

  if (mejorPaso && mejorPasoPuntaje >= 4) {
    return detallePaso(proceso, mejorPaso);
  }

  return resumenProceso(proceso);
}
