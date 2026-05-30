/**
 * Test local login API route. Never logs passwords.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
    }),
);

const email = "kristenpalmermd@gmail.com";
const password = process.env.URGENT_AUTH_PASSWORD;
if (!password) {
  console.error("Set URGENT_AUTH_PASSWORD");
  process.exit(1);
}
const base = process.argv[2] ?? "http://localhost:3000";

async function testLogin(origin) {
  const res = await fetch(`${origin}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  const setCookie = res.headers.getSetCookie?.() ?? [];
  return { origin, status: res.status, hasTokens: Boolean(body.access_token), cookies: setCookie.length, message: body.message };
}

const results = await Promise.all([
  testLogin(base),
  testLogin("https://www.fiscmak.com").catch((e) => ({ origin: "prod", error: e.message })),
]);

for (const r of results) {
  console.log(JSON.stringify(r));
}
