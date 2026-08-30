import Link from "next/link";
import { notFound } from "next/navigation";
import ProcessView from "@/components/ProcessView";
import { PROCESOS, getProceso } from "@/lib/processes";

export function generateStaticParams() {
  return PROCESOS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const proceso = getProceso(slug);
  return { title: proceso ? `${proceso.nombre} · Repositorio de Procesos` : "Proceso no encontrado" };
}

export default async function ProcesoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const proceso = getProceso(slug);
  if (!proceso) notFound();

  return (
    <>
      <header className="topbar">
        <div className="crumbs">
          <Link href="/inicio">Repositorio</Link>
          <span aria-hidden>/</span>
          <span>{proceso.area}</span>
          <span aria-hidden>/</span>
          <strong>{proceso.nombre}</strong>
        </div>
        <div className="topbar__spacer" />
        <span className="tag">{proceso.codigo}</span>
      </header>

      <div className="content">
        <ProcessView proceso={proceso} />
      </div>
    </>
  );
}
