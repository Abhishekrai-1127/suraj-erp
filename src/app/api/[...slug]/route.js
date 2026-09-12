import { NextResponse } from "next/server";
import { forwardToBackend } from "@/lib/server-api";

/**
 * Universal Server-Side API Gateway Route Handler (Single File).
 * Dynamically proxies all frontend /api/* requests to the Central ERP Backend API.
 * Keeps external backend host, port, credentials, and tokens completely private on the server.
 */

async function handleProxyRequest(request, paramsPromise, method) {
  const { slug } = await paramsPromise;
  const path = "/" + (Array.isArray(slug) ? slug.join("/") : slug || "");
  const { searchParams } = new URL(request.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  const authHeader = request.headers.get("authorization") || "";

  let body = undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await request.json();
    } catch (e) {
      body = undefined;
    }
  }

  const result = await forwardToBackend({
    method,
    path,
    data: body,
    params: queryParams,
    headers: { authorization: authHeader },
  });

  return NextResponse.json(result.data, { status: result.status });
}

export async function GET(request, { params }) {
  return handleProxyRequest(request, params, "GET");
}

export async function POST(request, { params }) {
  return handleProxyRequest(request, params, "POST");
}

export async function PUT(request, { params }) {
  return handleProxyRequest(request, params, "PUT");
}

export async function PATCH(request, { params }) {
  return handleProxyRequest(request, params, "PATCH");
}

export async function DELETE(request, { params }) {
  return handleProxyRequest(request, params, "DELETE");
}
