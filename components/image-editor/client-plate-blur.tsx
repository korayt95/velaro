"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface Position {
  x: number
  y: number
  width: number
  height: number
}

interface LicensePlateDetectionResult {
  hasLicensePlate: boolean
  position?: Position
  message?: string
}

/**
 * Funcție pentru a detecta plăcuțele de înmatriculare pe partea clientului
 * Aceasta este o implementare simplificată care poate fi extinsă cu algoritmi mai avansați
 */
export async function detectLicensePlateClient(imageUrl: string): Promise<LicensePlateDetectionResult> {
  try {
    // Simulăm un apel API pentru detectarea plăcuței
    // În implementarea reală, am putea folosi un model ML pe client sau un apel API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Returnăm un rezultat fals pentru a indica că nu am detectat plăcuța
        // Aceasta este doar o implementare placeholder
        resolve({
          hasLicensePlate: false,
          message:
            "Detectarea plăcuțelor de înmatriculare pe client este limitată. Folosiți funcția server pentru rezultate mai bune.",
        })
      }, 500)
    })
  } catch (error) {
    console.error("Eroare la detectarea plăcuței de înmatriculare:", error)
    return {
      hasLicensePlate: false,
      message: "A apărut o eroare la detectarea plăcuței de înmatriculare",
    }
  }
}

/**
 * Funcție pentru a blura plăcuțele de înmatriculare pe partea clientului
 */
export async function blurLicensePlateClient(
  imageUrl: string,
  position: Position,
  blurType: "blur" | "rectangle" = "blur",
  blurRadius = 10,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Nu s-a putut crea contextul canvas"))
        return
      }

      // Desenăm imaginea originală
      ctx.drawImage(img, 0, 0)

      // Calculăm coordonatele reale bazate pe procentaje
      const x = Math.floor(position.x * img.width)
      const y = Math.floor(position.y * img.height)
      const width = Math.floor(position.width * img.width)
      const height = Math.floor(position.height * img.height)

      // Aplicăm blur pe zona plăcuței
      if (blurType === "blur") {
        ctx.filter = `blur(${blurRadius}px)`
      }

      // Extragem zona pentru blur
      const plateRegion = ctx.getImageData(x, y, width, height)

      // Resetăm filtrul și desenăm zona cu blur
      ctx.filter = "none"
      ctx.putImageData(plateRegion, x, y)

      // Alternativ, putem desena un dreptunghi negru peste plăcuță
      if (blurType === "rectangle") {
        ctx.fillStyle = "black"
        ctx.fillRect(x, y, width, height)
      }

      // Convertim canvas în URL de date
      const blurredImageUrl = canvas.toDataURL("image/jpeg", 0.9)
      resolve(blurredImageUrl)
    }

    img.onerror = () => {
      reject(new Error("Nu s-a putut încărca imaginea pentru procesare"))
    }

    img.src = imageUrl
  })
}

/**
 * Hook pentru a aplica blur pe plăcuțele de înmatriculare
 */
export function useLicensePlateBlur(imageUrl: string | null, onProcessed: (url: string) => void) {
  const [blurredImageUrl, setBlurredImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      setBlurredImageUrl(null)
      setError(null)
      return
    }

    const processImage = async () => {
      setIsProcessing(true)
      setError(null)

      try {
        // Detectăm plăcuța
        const detectionResult = await detectLicensePlateClient(imageUrl)

        if (detectionResult.hasLicensePlate && detectionResult.position) {
          // Aplicăm blur pe plăcuță
          const blurredImage = await blurLicensePlateClient(imageUrl, detectionResult.position, "rectangle")
          setBlurredImageUrl(blurredImage)
          onProcessed(blurredImage)
        } else {
          // Nu am găsit plăcuță, returnăm imaginea originală
          setBlurredImageUrl(imageUrl)
          onProcessed(imageUrl)
        }
      } catch (err) {
        console.error("Eroare la procesarea imaginii:", err)
        setError("Nu s-a putut procesa imaginea pentru blur")
        setBlurredImageUrl(imageUrl) // Folosim imaginea originală în caz de eroare
        onProcessed(imageUrl)
      } finally {
        setIsProcessing(false)
      }
    }

    processImage()
  }, [imageUrl])

  return { blurredImageUrl, isProcessing, error }
}

export function ClientPlateBlur({ imageUrl, plateCoordinates, onProcessed, blurType = "blur" }: any) {
  const { blurredImageUrl, isProcessing } = useLicensePlateBlur(imageUrl, onProcessed)

  if (isProcessing) {
    return <LoadingSpinner size="sm" />
  }

  return <img src={blurredImageUrl || imageUrl} alt="Blurred image" />
}

