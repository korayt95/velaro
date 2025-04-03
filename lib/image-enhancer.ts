"use server"

export async function enhanceCarImage(imageBase64: string, prompt: string): Promise<string> {
  try {
    // Verificăm dacă avem o imagine validă
    if (!imageBase64 || !imageBase64.includes("base64")) {
      throw new Error("Invalid image data")
    }

    // Extragem partea base64 din dataURL
    const base64Image = imageBase64.split(",")[1]

    // Convertim base64 în blob
    const byteCharacters = atob(base64Image)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "image/jpeg" })

    // Creăm un FormData pentru a trimite imaginea
    const formData = new FormData()
    formData.append("image", blob, "car-image.jpg")

    // Apelăm API-ul nostru pentru a îmbunătăți imaginea
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/image-editor`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to enhance image")
    }

    const data = await response.json()
    return data.imageUrl
  } catch (error) {
    console.error("Error enhancing image:", error)
    throw new Error("Failed to enhance image")
  }
}

