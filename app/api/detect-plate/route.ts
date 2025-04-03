import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 })
    }

    // Obținem API key-ul din variabilele de mediu
    const apiKey = process.env.PLATE_RECOGNIZER_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Convertim URL-ul de date în blob
    const response = await fetch(imageUrl)
    const imageBlob = await response.blob()

    // Creăm un FormData pentru a trimite imaginea la API-ul PlateRecognizer
    const formData = new FormData()
    formData.append("upload", imageBlob, "image.jpg")

    // Facem cererea către API-ul PlateRecognizer
    const plateResponse = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
      },
      // @ts-ignore - FormData este valid pentru fetch în Next.js
      body: formData,
    })

    if (!plateResponse.ok) {
      const errorText = await plateResponse.text()
      throw new Error(`PlateRecognizer API error: ${plateResponse.status} ${errorText}`)
    }

    const plateData = await plateResponse.json()

    return NextResponse.json(plateData)
  } catch (error) {
    console.error("Error detecting license plate:", error)
    return NextResponse.json(
      { error: `Failed to detect license plate: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

