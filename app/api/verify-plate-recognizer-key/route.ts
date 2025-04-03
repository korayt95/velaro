import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Facem un apel de test către API-ul Plate Recognizer
    const response = await fetch("https://api.platerecognizer.com/v1/statistics/", {
      method: "GET",
      headers: {
        Authorization: `Token ${apiKey}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Invalid API key or API error: ${response.status} ${response.statusText}`,
        },
        { status: 400 },
      )
    }

    // Dacă am ajuns aici, API key-ul este valid
    return NextResponse.json({
      success: true,
      message: "API key is valid",
    })
  } catch (error) {
    console.error("Error verifying Plate Recognizer API key:", error)
    return NextResponse.json(
      {
        error: "Failed to verify API key. Please try again later.",
      },
      { status: 500 },
    )
  }
}

