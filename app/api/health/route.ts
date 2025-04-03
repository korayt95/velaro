import { NextResponse } from "next/server"

// Rută simplă pentru a verifica dacă API-ul funcționează
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiVersion: "1.0.0",
  })
}

