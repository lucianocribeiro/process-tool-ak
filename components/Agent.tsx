"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import Markdown from "./Markdown";
import { PROCESOS } from "@/lib/processes";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

interface AgenteCtx {
  abrir: (pregunta?: string) => void;
}

const Ctx = createContext<AgenteCtx>({ abrir: () => {} });

export function useAgente() {
  return useContext(Ctx);
}

const SUGERENCIAS_GENERALES = [
  "¿Qué procesos están relevados?",
  "¿Cuáles son los principales puntos de dolor?",
  "¿Qué oportunidades de automatización hay?",
];

function sugerenciasDe(nombre: string) {
  return [
    `Explicame el proceso de ${nombre} paso a paso`,
    `¿Quién es responsable de cada paso en ${nombre}?`,
    `¿Qué excepciones tiene ${nombre}?`,
    `¿Qué mejoras propondrías para ${nombre}?`,
  ];
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const cuerpoRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendiente = useRef<string | null>(null);

  const pathname = usePathname();
  const proceso = useMemo(() => {
    const m = pathname?.match(/\/procesos\/([^/]+)/);
    return m ? PROCESOS.find((p) => p.slug === m[1]) : undefined;
  }, [pathname]);

  const enviar = useCallback(
    async (texto: string) => {
      const limpio = texto.trim();
      if (!limpio || cargando) return;
      const historial: Mensaje[] = [...mensajes, { role: "user", content: limpio }];
      setMensajes(historial);
      setEntrada("");
      setCargando(true);
      setAviso(null);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: historial, slug: proceso?.slug }),
        });
        const datos = (await res.json()) as { content?: string; error?: string; aviso?: string; modo?: string };
        if (datos.aviso) setAviso(datos.aviso);
        setMensajes([
          ...historial,
          {
            role: "assistant",
            content:
              datos.content ??
              datos.error ??
              "No pude procesar la consulta. Probá reformulando la pregunta.",
          },
        ]);
      } catch {
        setMensajes([
          ...historial,
          { role: "assistant", content: "Hubo un problema de conexión. Intentá de nuevo en unos segundos." },
        ]);
      } finally {
        setCargando(false);
      }
    },
    [cargando, mensajes, proceso?.slug],
  );

  const abrir = useCallback((pregunta?: string) => {
    setAbierto(true);
    if (pregunta) pendiente.current = pregunta;
  }, []);

  useEffect(() => {
    if (abierto && pendiente.current) {
      const p = pendiente.current;
      pendiente.current = null;
      void enviar(p);
    }
  }, [abierto, enviar]);

  useEffect(() => {
    if (cuerpoRef.current) cuerpoRef.current.scrollTop = cuerpoRef.current.scrollHeight;
  }, [mensajes, cargando]);

  useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  const sugerencias = proceso ? sugerenciasDe(proceso.nombre) : SUGERENCIAS_GENERALES;

  return (
    <Ctx.Provider value={{ abrir }}>
      {children}

      {!abierto ? (
        <button
          type="button"
          className="agent-fab"
          onClick={() => setAbierto(true)}
          aria-label="Abrir el Asistente de Procesos"
        >
          <span aria-hidden>✦</span>
          <span className="agent-fab__label">Asistente de Procesos</span>
        </button>
      ) : null}

      {abierto ? (
        <section className="agent" aria-label="Asistente de Procesos">
          <header className="agent__head">
            <span className="agent__avatar" aria-hidden>
              ✦
            </span>
            <div>
              <div className="agent__name">Asistente de Procesos</div>
              <div className="agent__scope">
                {proceso ? `Contexto: ${proceso.codigo} · ${proceso.nombre}` : "Contexto: los 3 procesos relevados"}
              </div>
            </div>
            <button
              type="button"
              className="drawer__close"
              style={{ marginLeft: "auto" }}
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
            >
              ✕
            </button>
          </header>

          <div className="agent__body" ref={cuerpoRef}>
            {mensajes.length === 0 ? (
              <div className="msg msg--bot">
                <p style={{ margin: 0 }}>
                  Hola. Leí la documentación completa de los procesos relevados y puedo explicarte cualquiera de
                  ellos, un paso puntual, quién hace qué, las excepciones o las oportunidades de mejora.
                </p>
              </div>
            ) : null}

            {mensajes.map((m, i) => (
              <div key={i} className={m.role === "user" ? "msg msg--user" : "msg msg--bot"}>
                {m.role === "user" ? m.content : <Markdown texto={m.content} />}
              </div>
            ))}

            {cargando ? (
              <div className="msg msg--bot">
                <span className="typing" aria-label="Escribiendo">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            ) : null}

            {!cargando ? (
              <div className="agent__suggests">
                {sugerencias.map((s) => (
                  <button key={s} type="button" className="suggest" onClick={() => void enviar(s)}>
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {aviso ? <div className="agent__note">{aviso}</div> : null}

          <form
            className="agent__form"
            onSubmit={(e) => {
              e.preventDefault();
              void enviar(entrada);
            }}
          >
            <textarea
              ref={inputRef}
              className="agent__input"
              rows={1}
              placeholder="Preguntá sobre cualquier proceso…"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void enviar(entrada);
                }
              }}
            />
            <button type="submit" className="agent__send" disabled={cargando || !entrada.trim()} aria-label="Enviar">
              ↑
            </button>
          </form>
        </section>
      ) : null}
    </Ctx.Provider>
  );
}
