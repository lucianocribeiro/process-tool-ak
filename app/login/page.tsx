import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import { passwordPorDefecto } from "@/lib/auth";
import { EMPRESA, PROCESOS } from "@/lib/processes";

export const metadata = { title: "Acceso · Repositorio de Procesos" };

export default function LoginPage() {
  const totalPasos = PROCESOS.reduce((n, p) => n + p.pasos.length, 0);
  const mostrarPista = passwordPorDefecto();

  return (
    <main className="login">
      <section className="login__aside">
        <div className="login__grid" aria-hidden />
        <div className="login__asideInner">
          <div className="login__kicker">Repositorio de Procesos</div>
          <h1 className="login__title">
            Toda la operación
            <br />
            de {EMPRESA.nombre},
            <br />
            mapeada y navegable.
          </h1>
          <p className="login__lede">
            Diagramas de flujo interactivos, detalle paso a paso con responsables y sistemas, excepciones
            documentadas y un asistente que responde sobre cualquier proceso.
          </p>
        </div>
        <div className="login__facts">
          <div className="login__fact">
            <strong>{PROCESOS.length}</strong>
            <span>Procesos</span>
          </div>
          <div className="login__fact">
            <strong>{totalPasos}</strong>
            <span>Pasos documentados</span>
          </div>
          <div className="login__fact">
            <strong>IA</strong>
            <span>Asistente integrado</span>
          </div>
        </div>
      </section>

      <section className="login__main">
        <div className="login__card">
          <h2>Acceso restringido</h2>
          <p className="login__sub">Ingresá la contraseña que te compartimos para ver el repositorio.</p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          {mostrarPista ? (
            <div className="login__hint">
              Modo demostración: no hay una contraseña configurada en el entorno, se usa la de ejemplo{" "}
              <code>procesos2026</code>. Definí <code>APP_PASSWORD</code> en las variables de entorno antes de
              compartir el enlace.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
