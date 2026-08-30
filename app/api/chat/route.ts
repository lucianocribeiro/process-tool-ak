import { NextResponse } from "next/server";
import { baseDeConocimiento, SYSTEM_PROMPT } from "@/lib/knowledge";
import { responderLocal } from "@/lib/fallback";

export const runtime = "edge";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

const MODELO_POR_DEFECTO = "claude-sonnet-5";

export async function POST(request: Request) {
  let mensajes: Mensaje[] = [];
  let slug: string | undefined;

  try {
    const body = (await request.json()) as { messages?: Mensaje[]; slug?: string };
    mensajes = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    slug = typeof body.slug === "string" && body.slug ? body.slug : undefined;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const ultima = [...mensajes].reverse().find((m) => m.role === "user")?.content ?? "";
  if (!ultima.trim()) {
    return NextResponse.json({ error: "Escribí una consulta." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      content: responderLocal(ultima, slug),
      modo: "local" as const,
    });
  }

  try {
    const respuesta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || MODELO_POR_DEFECTO,
        max_tokens: 1200,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT + baseDeConocimiento(),
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: mensajes.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error("Error de la API de Anthropic:", respuesta.status, detalle);
      return NextResponse.json({
        content: responderLocal(ultima, slug),
        modo: "local" as const,
        aviso: "No se pudo contactar al modelo. Respuesta generada desde la documentación cargada.",
      });
    }

    const datos = (await respuesta.json()) as {
      content?: { type: string; text?: string }[];
    };
    const texto =
      datos.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("\n")
        .trim() ?? "";

    if (!texto) {
      return NextResponse.json({ content: responderLocal(ultima, slug), modo: "local" as const });
    }

    return NextResponse.json({ content: texto, modo: "ia" as const });
  } catch (error) {
    console.error("Fallo al consultar el modelo:", error);
    return NextResponse.json({
      content: responderLocal(ultima, slug),
      modo: "local" as const,
      aviso: "No se pudo contactar al modelo. Respuesta generada desde la documentación cargada.",
    });
  }
}
