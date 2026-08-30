import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, validarToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const autorizado = await validarToken(token);

  const { pathname, search } = request.nextUrl;
  const esLogin = pathname === "/login";

  if (!autorizado && !esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (autorizado && esLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Se protege todo salvo los recursos estaticos y las rutas de autenticacion,
     * que necesitan ser accesibles para poder iniciar sesion.
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)",
  ],
};
