"use server"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateCarImage(prompt: string, baseImage?: string): Promise<string> {
  try {
    let response

    if (baseImage) {
      // Dacă avem o imagine de bază, folosim DALL-E pentru editare
      // Extragem partea base64 din dataURL
      const base64Image = baseImage.split(",")[1]

      response = await openai.images.edit({
        image: Buffer.from(base64Image, "base64"),
        prompt: `High quality professional car photo. ${prompt}`,
        n: 1,
        size: "1024x1024",
      })
    } else {
      // Altfel, generăm o imagine nouă
      response = await openai.images.generate({
        prompt: `High quality professional car photo. ${prompt}`,
        n: 1,
        size: "1024x1024",
      })
    }

    // Returnăm URL-ul imaginii generate
    return response.data[0].url || ""
  } catch (error) {
    console.error("Error generating image:", error)
    throw new Error("Failed to generate image")
  }
}

