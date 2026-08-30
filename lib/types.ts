export type NodeKind = "inicio" | "fin" | "tarea" | "decision" | "datos" | "documento";

export interface FlowNode {
  id: string;
  label: string;
  kind: NodeKind;
  lane: string;
  col: number;
  row?: number;
}

export type EdgeRoute = "auto" | "h" | "v" | "hv" | "vh" | "jog" | "around";

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  /** Estrategia de ruteo ortogonal. */
  route?: EdgeRoute;
  /** Desplazamiento en px para el tramo intermedio (rutas "around"). */
  offset?: number;
  /** Lado por el que sale la conexion en rutas "around". */
  side?: "top" | "bottom";
  /** Marca el camino como excepcion / reproceso. */
  variant?: "normal" | "retorno";
}

export interface Lane {
  id: string;
  label: string;
  sublabel?: string;
  /** Cantidad de filas internas del carril. */
  rows?: number;
  kind?: "sistema" | "persona" | "externo";
}

export interface StepDetail {
  /** Id del nodo del diagrama al que corresponde. */
  id: string;
  titulo: string;
  responsable: string;
  sistema: string;
  duracion?: string;
  descripcion: string;
  entradas?: string[];
  salidas?: string[];
  reglas?: string[];
  hitos?: { hora: string; texto: string }[];
  dolor?: string;
  oportunidad?: string;
}

export interface Excepcion {
  titulo: string;
  detalle: string;
}

export interface Oportunidad {
  titulo: string;
  detalle: string;
  impacto: "Alto" | "Medio" | "Bajo";
  esfuerzo: "Alto" | "Medio" | "Bajo";
}

export interface Proceso {
  slug: string;
  codigo: string;
  nombre: string;
  area: string;
  resumen: string;
  objetivo: string;
  dueno: string;
  frecuencia: string;
  disparador: string;
  resultado: string;
  sistemas: string[];
  participantes: { nombre: string; rol: string }[];
  indicadores: { etiqueta: string; valor: string }[];
  lanes: Lane[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  pasos: StepDetail[];
  excepciones: Excepcion[];
  requisitos?: string[];
  oportunidades: Oportunidad[];
}
