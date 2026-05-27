/**
 * Next.js BFF (Backend-for-Frontend) proxy for the Merchant Portal.
 *
 * Architecture (D11):
 *   Browser → Vercel /api/portal/* → Railway FastAPI /api/merchant/*
 *
 * Security model:
 *   - JWT never reaches browser JavaScript.
 *   - On login: Railway returns JWT in body → BFF sets HttpOnly cookie.
 *   - On subsequent requests: BFF reads cookie, injects as Authorization header.
 *   - On logout: BFF clears cookie (Railway logout is a no-op).
 *
 * Cookie spec: HttpOnly; Secure; SameSite=Lax; Path=/api/portal; Max-Age=28800
 */
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  "https://beedin-sync-production.up.railway.app";

const COOKIE_NAME = "beedin_session";
const COOKIE_MAX_AGE = 8 * 60 * 60; // 8 hours in seconds

type Context = { params: { path: string[] } };

// ── HTTP method handlers ───────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Context) {
  return proxyRequest(req, params.path, "GET");
}
export async function POST(req: NextRequest, { params }: Context) {
  return proxyRequest(req, params.path, "POST");
}
export async function PUT(req: NextRequest, { params }: Context) {
  return proxyRequest(req, params.path, "PUT");
}
export async function PATCH(req: NextRequest, { params }: Context) {
  return proxyRequest(req, params.path, "PATCH");
}
export async function DELETE(req: NextRequest, { params }: Context) {
  return proxyRequest(req, params.path, "DELETE");
}

// ── Core proxy logic ───────────────────────────────────────────────────────────

async function proxyRequest(
  req: NextRequest,
  pathParts: string[],
  method: string
): Promise<NextResponse> {
  const apiPath = pathParts.join("/");
  const backendBase = `${BACKEND_URL}/api/merchant/${apiPath}`;
  const search = new URL(req.url).search;
  const backendUrl = search ? `${backendBase}${search}` : backendBase;

  // Inject Bearer token from httpOnly session cookie
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

  const headers: Record<string, string> = {};
  // For JSON requests set Content-Type explicitly; for multipart use the original
  // (with boundary) or let the fetch API set it automatically.
  if (!contentTypeOverride) {
    headers["Content-Type"] = "application/json";
  } else if (contentTypeOverride) {
    headers["Content-Type"] = contentTypeOverride;
  }
  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }

  // Forward body for mutating requests
  // Multipart (file upload) is forwarded as raw bytes; JSON is re-serialised.
  let body: BodyInit | undefined;
  let contentTypeOverride: string | undefined;
  if (method !== "GET" && method !== "DELETE") {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.startsWith("multipart/form-data")) {
      // Forward the raw FormData so FastAPI's UploadFile parsing works correctly.
      // We must NOT re-set Content-Type — the browser boundary string must be preserved.
      body = await req.blob();
      contentTypeOverride = ct; // keep original with boundary
    } else {
      try {
        body = JSON.stringify(await req.json());
      } catch {
        body = undefined;
      }
    }
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 503 }
    );
  }

  const data = await backendRes.json().catch(() => ({}));

  // ── Login: JWT → httpOnly cookie ─────────────────────────────────────────
  if (apiPath === "auth/login" && method === "POST" && backendRes.ok && data.token) {
    const res = NextResponse.json(
      { ok: true, role: data.role, merchant_id: data.merchant_id },
      { status: 200 }
    );
    res.cookies.set(COOKIE_NAME, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    return res;
  }

  // ── Logout: clear cookie + redirect to login ─────────────────────────────
  if (apiPath === "auth/logout" && method === "POST") {
    const res = NextResponse.redirect(new URL("/portal/login", req.url));
    res.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  }

  // ── Pass-through all other routes ─────────────────────────────────────────
  return NextResponse.json(data, { status: backendRes.status });
}
