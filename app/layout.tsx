import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repositorio de Procesos · Nordia Logística",
  description:
    "Repositorio interactivo de procesos relevados: diagramas de flujo navegables, detalle por paso y asistente de consulta.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
