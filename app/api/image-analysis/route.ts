import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convertim imaginea în buffer
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Analizăm imaginea cu OpenAI Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Ești un expert în fotografie auto și analizezi calitatea imaginilor cu mașini.
          Evaluează imaginea și oferă un scor de la 1 la 5 (1 = calitate foarte slabă, 5 = calitate excelentă).
          Analizează următoarele aspecte:
          1. Claritatea și rezoluția imaginii
          2. Iluminarea (prea întunecată, prea luminoasă, echilibrată)
          3. Unghiul și încadrarea mașinii
          4. Fundalul și contextul
          5. Vizibilitatea detaliilor importante
          
          Răspunde cu un JSON în următorul format:
          {
            "score": număr între 1 și 5,
            "analysis": "Analiză detaliată a imaginii",
            "improvements": ["Sugestie 1", "Sugestie 2", ...],
            "strengths": ["Punct forte 1", "Punct forte 2", ...]
          }`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analizează această imagine cu o mașină și evaluează calitatea ei." },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageFile.type};base64,${buffer.toString("base64")}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    })

    const result = JSON.parse(response.choices[0].message.content)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error analyzing image:", error)
    return NextResponse.json({ error: "Failed to analyze image. Please try again later." }, { status: 500 })
  }
}

