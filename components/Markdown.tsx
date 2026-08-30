import { Fragment, type ReactNode } from "react";

/** Render minimo de markdown: negritas, listas y parrafos. */
function inline(texto: string, clave: string): ReactNode[] {
  const partes = texto.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return partes.filter(Boolean).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={`${clave}-${i}`}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith("`") && p.endsWith("`")) {
      return <code key={`${clave}-${i}`}>{p.slice(1, -1)}</code>;
    }
    return <Fragment key={`${clave}-${i}`}>{p}</Fragment>;
  });
}

export default function Markdown({ texto }: { texto: string }) {
  const lineas = texto.split("\n");
  const bloques: ReactNode[] = [];
  let lista: { tipo: "ul" | "ol"; items: string[] } | null = null;
  let parrafo: string[] = [];

  const cerrarLista = () => {
    if (!lista) return;
    const Tag = lista.tipo;
    const items = lista.items;
    bloques.push(
      <Tag key={`l${bloques.length}`}>
        {items.map((it, i) => (
          <li key={i}>{inline(it, `l${bloques.length}-${i}`)}</li>
        ))}
      </Tag>,
    );
    lista = null;
  };

  const cerrarParrafo = () => {
    if (!parrafo.length) return;
    const texto = parrafo.join(" ");
    bloques.push(<p key={`p${bloques.length}`}>{inline(texto, `p${bloques.length}`)}</p>);
    parrafo = [];
  };

  for (const cruda of lineas) {
    const linea = cruda.trimEnd();
    const vinieta = linea.match(/^\s*[-*]\s+(.*)$/);
    const numerada = linea.match(/^\s*\d+\.\s+(.*)$/);

    if (vinieta) {
      cerrarParrafo();
      if (lista?.tipo !== "ul") cerrarLista();
      lista = lista ?? { tipo: "ul", items: [] };
      lista.items.push(vinieta[1]);
      continue;
    }
    if (numerada) {
      cerrarParrafo();
      if (lista?.tipo !== "ol") cerrarLista();
      lista = lista ?? { tipo: "ol", items: [] };
      lista.items.push(numerada[1]);
      continue;
    }
    if (!linea.trim()) {
      cerrarLista();
      cerrarParrafo();
      continue;
    }
    cerrarLista();
    parrafo.push(linea.replace(/^#+\s*/, ""));
  }
  cerrarLista();
  cerrarParrafo();

  return <>{bloques}</>;
}
