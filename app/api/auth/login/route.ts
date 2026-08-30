import { NextResponse } from "next/server";
import { COOKIE_NAME, crearToken, verificarPassword } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  if (!password) {
    return NextResponse.json({ ok: false, error: "Ingresá la contraseña." }, { status: 400 });
  }

  if (!(await verificarPassword(password))) {
    return NextResponse.json(
      { ok: false, error: "Contraseña incorrecta. Verificá e intentá de nuevo." },
      { status: 401 },
    );
  }

  const { token, maxAge } = await crearToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return response;
}
