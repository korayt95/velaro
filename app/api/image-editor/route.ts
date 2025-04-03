import { type NextRequest, NextResponse } from "next/server"
import sharp from "sharp"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { app } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    console.log("Image editor API called")

    const formData = await request.formData()
    const imageFile = formData.get("image") as File
    const enhance = formData.get("enhance") === "true"
    const blurPlate = formData.get("blurPlate") === "true"
    const enhancementLevel = (formData.get("enhancementLevel") as string) || "medium"

    if (!imageFile) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 })
    }

    console.log("Processing image:", {
      fileName: imageFile.name,
      fileSize: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`,
      enhance,
      blurPlate,
      enhancementLevel,
    })

    // Convertim fișierul în buffer
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Detectăm plăcuța de înmatriculare dacă este necesar
    let plateDetectionResult = null
    if (blurPlate) {
      try {
        console.log("Detecting license plate...")
        plateDetectionResult = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/detect-plate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: `data:image/jpeg;base64,${buffer.toString("base64")}` }),
        }).then(res => res.json())
        console.log("License plate detection result:", plateDetectionResult)
      } catch (error) {
        console.error("Error detecting license plate:", error)
      }
    }

    // Procesăm imaginea cu sharp
    let sharpInstance = sharp(buffer)

    // Obținem metadatele imaginii
    const metadata = await sharpInstance.metadata()
    console.log("Image metadata:", {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    })

    // Aplicăm îmbunătățirile dacă este necesar
    if (enhance) {
      console.log(`Applying ${enhancementLevel} enhancements...`)

      // Setăm parametrii de îmbunătățire în funcție de nivel
      let sharpenAmount = 1.0
      let contrastAmount = 1.0
      let saturationAmount = 1.0
      let gammaValue = 1.0 // Asigurăm că gamma începe cu o valoare validă

      if (enhancementLevel === "strong") {
        sharpenAmount = 1.5
        contrastAmount = 1.3
        saturationAmount = 1.3
        gammaValue = 1.2
      } else if (enhancementLevel === "medium") {
        sharpenAmount = 1.2
        contrastAmount = 1.15
        saturationAmount = 1.15
        gammaValue = 1.1
      } else {
        // light
        sharpenAmount = 1.1
        contrastAmount = 1.05
        saturationAmount = 1.05
        gammaValue = 1.0
      }

      // Aplicăm îmbunătățirile
      sharpInstance = sharpInstance
        .sharpen(sharpenAmount)
        .gamma(gammaValue) // Folosim valoarea gamma validă
        .modulate({
          brightness: 1.0, // Păstrăm luminozitatea neschimbată
          saturation: saturationAmount,
        })
        .convolve({
          width: 3,
          height: 3,
          kernel: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
          scale: 1,
        })
    }

    // Aplicăm blur pe plăcuța de înmatriculare dacă a fost detectată
    let plateDetected = false
    if (blurPlate && plateDetectionResult && plateDetectionResult.hasLicensePlate && plateDetectionResult.position) {
      try {
        console.log("Applying blur to license plate...")

        const position = plateDetectionResult.position
        const imgWidth = metadata.width || 800
        const imgHeight = metadata.height || 600

        // Calculăm coordonatele în pixeli
        const x = Math.floor(position.x * imgWidth)
        const y = Math.floor(position.y * imgHeight)
        const width = Math.floor(position.width * imgWidth)
        const height = Math.floor(position.height * imgHeight)

        console.log("License plate coordinates:", { x, y, width, height })

        // Verificăm dacă coordonatele sunt valide
        if (x >= 0 && y >= 0 && width > 0 && height > 0 && x + width <= imgWidth && y + height <= imgHeight) {
          // Aplicăm un dreptunghi negru peste plăcuța de înmatriculare
          const overlayBuffer = await sharp({
            create: {
              width: width,
              height: height,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 255 },
            },
          })
            .png()
            .toBuffer()

          sharpInstance = sharpInstance.composite([
            {
              input: overlayBuffer,
              left: x,
              top: y,
            },
          ])

          plateDetected = true
          console.log("Blur applied successfully")
        } else {
          console.warn("Invalid license plate coordinates, skipping blur")
        }
      } catch (error) {
        console.error("Error applying blur:", error)
      }
    }

    // Convertim imaginea procesată în format PNG
    const processedImageBuffer = await sharpInstance.png().toBuffer()
    // Încărcăm imaginea pe Firebase Storage
    const imageUrl = await uploadImageToStorage(processedImageBuffer, `processed-images/${Date.now()}.png`)

    console.log("Image processed and uploaded successfully:", imageUrl)

    // Returnăm URL-ul imaginii procesate
    return NextResponse.json({
      imageUrl,
      message: plateDetected
        ? "Imagine procesată cu succes și plăcuță de înmatriculare blurată."
        : "Imagine procesată cu succes.",
      plateDetected,
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json(
      { error: `Failed to process image: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

async function uploadImageToStorage(processedImageBuffer: Buffer, path: string): Promise<string> {
  try {
    const storage = getStorage(app)
    const storageRef = ref(storage, path)
    
    // Convertim buffer-ul în Blob
    const blob = new Blob([processedImageBuffer], { type: "image/png" })
    
    // Încărcăm imaginea
    await uploadBytes(storageRef, blob)
    
    // Obținem URL-ul de descărcare
    const downloadUrl = await getDownloadURL(storageRef)
    
    return downloadUrl
  } catch (error) {
    console.error("Error uploading image to storage:", error)
    throw new Error("Failed to upload image to storage")
  }
}

