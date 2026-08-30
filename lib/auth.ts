export const COOKIE_NAME = "rp_session";
const DIAS = 7;

function getPassword(): string {
  return process.env.APP_PASSWORD || "procesos2026";
}

function getSecret(): string {
  return process.env.SESSION_SECRET || `rp::${getPassword()}::fallback-secret`;
}

const encoder = new TextEncoder();

async function hmac(mensaje: string, secreto: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const firma = await crypto.subtle.sign("HMAC", key, encoder.encode(mensaje));
  return Array.from(new Uint8Array(firma))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Comparacion en tiempo constante para evitar timing attacks. */
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}

export async function verificarPassword(intento: string): Promise<boolean> {
  const esperado = getPassword();
  // Se hashean ambos valores para comparar cadenas de longitud fija.
  const secreto = getSecret();
  const [a, b] = await Promise.all([hmac(intento, secreto), hmac(esperado, secreto)]);
  return iguales(a, b);
}

export async function crearToken(): Promise<{ token: string; maxAge: number }> {
  const maxAge = DIAS * 24 * 60 * 60;
  const exp = String(Date.now() + maxAge * 1000);
  const firma = await hmac(exp, getSecret());
  return { token: `${exp}.${firma}`, maxAge };
}

export async function validarToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const punto = token.lastIndexOf(".");
  if (punto <= 0) return false;
  const exp = token.slice(0, punto);
  const firma = token.slice(punto + 1);
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now()) return false;
  const esperada = await hmac(exp, getSecret());
  return iguales(firma, esperada);
}

export function passwordPorDefecto(): boolean {
  return !process.env.APP_PASSWORD;
}
