import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Obținem calea URL
  const path = request.nextUrl.pathname

  // Verificăm dacă este o rută API
  if (path.startsWith("/api/")) {
    // Adăugăm header-uri CORS pentru a permite accesul de pe alte domenii
    const response = NextResponse.next()

    // Permitem accesul de pe orice domeniu (în producție, ar trebui să restricționăm la domeniul tău)
    response.headers.set("Access-Control-Allow-Origin", "*")

    // Permitem metodele HTTP specifice
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

    // Permitem header-uri specifice
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

    // Nu mai este nevoie să adăugăm API key-ul în header, deoarece îl folosim direct din variabilele de mediu
    // Păstrăm doar header-urile CORS

    return response
  }

  // Pentru alte rute, continuăm normal
  return NextResponse.next()
}

// Configurăm middleware-ul să ruleze doar pentru rutele API
export const config = {
  matcher: "/api/:path*",
}

