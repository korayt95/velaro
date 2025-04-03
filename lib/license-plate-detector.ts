"use server"

import sharp from "sharp"

export interface LicensePlateDetection {
  hasLicensePlate: boolean
  position?: {
    x: number // procent din lățimea imaginii (0-100)
    y: number // procent din înălțimea imaginii (0-100)
    width: number // procent din lățimea imaginii (0-100)
    height: number // procent din înălțimea imaginii (0-100)
  }
  confidence?: number
  plateText?: string
  region?: string
}

export async function detectLicensePlate(imageBuffer: Buffer): Promise<LicensePlateDetection> {
  try {
    // Folosim API key-ul din variabilele de mediu
    const plateRecognizerApiKey = process.env.PLATE_RECOGNIZER_API_KEY

    // Verificăm dacă avem API key-ul configurat
    if (!plateRecognizerApiKey) {
      console.error("Plate Recognizer API key is not configured in environment variables")
      return { hasLicensePlate: false }
    }

    // OPTIMIZARE IMAGINE ÎNAINTE DE A O TRIMITE CĂTRE API
    console.log("Original image size:", imageBuffer.length / 1024, "KB")

    // Folosim sharp pentru a optimiza imaginea
    let optimizedBuffer = imageBuffer

    // Verificăm dacă imaginea este prea mare (> 2.5MB pentru a lăsa o marjă)
    if (imageBuffer.length > 2.5 * 1024 * 1024) {
      console.log("Image is too large, resizing and optimizing...")

      try {
        // Redimensionăm și comprimăm imaginea
        optimizedBuffer = await sharp(imageBuffer)
          .resize(1024, 768, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer()

        console.log("Optimized image size:", optimizedBuffer.length / 1024, "KB")

        // Dacă tot este prea mare, reducem și mai mult calitatea
        if (optimizedBuffer.length > 2.5 * 1024 * 1024) {
          optimizedBuffer = await sharp(imageBuffer)
            .resize(800, 600, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 60 })
            .toBuffer()

          console.log("Further optimized image size:", optimizedBuffer.length / 1024, "KB")
        }
      } catch (err) {
        console.error("Error optimizing image:", err)
        // Continuăm cu imaginea originală dacă optimizarea eșuează
      }
    }

    // Pregătim datele pentru API
    const formData = new FormData()
    const blob = new Blob([optimizedBuffer], { type: "image/jpeg" })
    formData.append("upload", blob, "car-image.jpg")

    // Adăugăm parametri specifici pentru România
    formData.append("regions", "ro") // Specificăm România ca regiune
    formData.append("camera_id", "romanian-listings") // ID opțional pentru statistici

    // Adăugăm parametri pentru a îmbunătăți detecția
    formData.append(
      "config",
      JSON.stringify({
        mode: "fast", // Folosim modul rapid pentru detecție
        detection_mode: "vehicle", // Specificăm că detectăm numere pe vehicule
        region_config: { ro: { confidence_threshold: 0.5 } }, // Threshold mai mic pentru România
      }),
    )

    console.log("Calling Plate Recognizer API...")

    // Facem apelul către API
    const response = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
      method: "POST",
      headers: {
        Authorization: `Token ${plateRecognizerApiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Plate Recognizer API error:", response.status, response.statusText)
      console.error("Error details:", errorText)
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Plate Recognizer API response received")

    // Verificăm dacă avem rezultate
    if (!data.results || data.results.length === 0) {
      console.log("No license plates detected")
      return { hasLicensePlate: false }
    }

    // Luăm primul rezultat (cel mai probabil)
    const result = data.results[0]

    // Extragem coordonatele și le convertim în procente
    const box = result.box
    const { xmin, ymin, xmax, ymax } = box

    // Obținem dimensiunile imaginii din răspunsul API
    const imgWidth = data.img_width || 1000
    const imgHeight = data.img_height || 1000

    // Calculăm poziția și dimensiunile în procente
    const position = {
      x: (xmin / imgWidth) * 100,
      y: (ymin / imgHeight) * 100,
      width: ((xmax - xmin) / imgWidth) * 100,
      height: ((ymax - ymin) / imgHeight) * 100,
    }

    // Adăugăm un log pentru a verifica coordonatele
    console.log(
      `License plate detected at: x=${position.x}%, y=${position.y}%, width=${position.width}%, height=${position.height}%`,
    )
    console.log(`Original coordinates in pixels: xmin=${xmin}, ymin=${ymin}, xmax=${xmax}, ymax=${ymax}`)
    console.log(`Detected plate text: ${result.plate}, confidence: ${result.score}`)

    // Verificăm dacă avem informații despre orientare/rotație
    if (result.orientation) {
      console.log(`Plate orientation: ${result.orientation}`)
    }

    // Verificăm dacă avem informații despre regiune
    if (result.region && result.region.code) {
      console.log(`Plate region: ${result.region.code}, confidence: ${result.region.score}`)
    }

    return {
      hasLicensePlate: true,
      position,
      confidence: result.score,
      plateText: result.plate,
      region: result.region?.code || "RO",
    }
  } catch (err) {
    console.error("Error detecting license plate:", err)
    return { hasLicensePlate: false }
  }
}

