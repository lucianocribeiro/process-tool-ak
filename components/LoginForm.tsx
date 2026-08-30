"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const destino = params.get("next") || "/inicio";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const datos = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !datos.ok) {
        setError(datos.error ?? "No se pudo iniciar sesión.");
        setCargando(false);
        return;
      }
      router.replace(destino.startsWith("/") ? destino : "/inicio");
      router.refresh();
    } catch {
      setError("No se pudo conectar con el servidor. Intentá de nuevo.");
      setCargando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate>
      {error ? (
        <div className="alert" role="alert">
          {error}
        </div>
      ) : null}

      <label className="field">
        <span className="field__label">Contraseña de acceso</span>
        <input
          className="input"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
      </label>

      <button type="submit" className="btn btn--block" disabled={cargando || !password}>
        {cargando ? "Verificando…" : "Ingresar al repositorio"}
      </button>
    </form>
  );
}
