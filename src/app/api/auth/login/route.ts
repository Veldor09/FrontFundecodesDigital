import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json({ message: "API URL no configurada" }, { status: 500 });
    }

    // Llama al backend NestJS
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = data?.message || "Credenciales inválidas o usuario no verificado";
      return NextResponse.json({ message: msg }, { status: res.status });
    }

    const token = data?.access_token;
    if (!token) {
      return NextResponse.json({ message: "Respuesta inválida del servidor" }, { status: 500 });
    }

    // Guarda el JWT en cookie httpOnly
    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });
    return response;
  } catch (e) {
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
