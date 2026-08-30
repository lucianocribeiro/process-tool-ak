import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url, { status: 303 });
  response.cookies.set({ name: COOKIE_NAME, value: "", path: "/", maxAge: 0 });
  return response;
}
