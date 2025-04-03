/**
 * Aplică un efect de blur asupra numărului de înmatriculare detectat în imagine
 * Rescalează coordonatele în funcție de dimensiunea afișată a imaginii
 */
export function applyBlurToPlate(imageElement: HTMLImageElement, box: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
  
        if (!ctx) {
          reject(new Error("Nu s-a putut crea contextul canvas"))
          return
        }
  
        // Setăm dimensiunea canvas-ului la dimensiunea afișată a imaginii
        canvas.width = imageElement.width
        canvas.height = imageElement.height
  
        // Desenăm imaginea originală
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)
  
        // Calculăm factorii de scalare
        const scaleX = imageElement.width / imageElement.naturalWidth
        const scaleY = imageElement.height / imageElement.naturalHeight
  
        // Coordonate scalate
        const xmin = box.xmin * scaleX
        const xmax = box.xmax * scaleX
        const ymin = box.ymin * scaleY
        const ymax = box.ymax * scaleY
  
        const width = xmax - xmin
        const height = ymax - ymin
  
        // Extragem zona pentru blur
        const imageData = ctx.getImageData(xmin, ymin, width, height)
  
        // Logica de blur - pixelare simplă
        const pixelSize = 4 // Dimensiunea pixelilor pentru blur
        for (let y = 0; y < height; y += pixelSize) {
          for (let x = 0; x < width; x += pixelSize) {
            const index = (y * width + x) * 4
            const r = imageData.data[index]
            const g = imageData.data[index + 1]
            const b = imageData.data[index + 2]
  
            for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
              for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
                const i = ((y + dy) * width + (x + dx)) * 4
                if (i < imageData.data.length) {
                  imageData.data[i] = r
                  imageData.data[i + 1] = g
                  imageData.data[i + 2] = b
                }
              }
            }
          }
        }
  
        // Desenăm zona blurată
        ctx.putImageData(imageData, xmin, ymin)
  
        // Returnăm rezultatul ca URL de date
        resolve(canvas.toDataURL("image/jpeg", 0.9))
      } catch (error) {
        console.error("Eroare la aplicarea blur-ului:", error)
        reject(error)
      }
    })
  }
  
  /**
   * Aplică un dreptunghi negru peste numărul de înmatriculare
   */
  export function applyBlackRectangleToPlate(imageElement: HTMLImageElement, box: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
  
        if (!ctx) {
          reject(new Error("Nu s-a putut crea contextul canvas"))
          return
        }
  
        // Setăm dimensiunea canvas-ului la dimensiunea afișată a imaginii
        canvas.width = imageElement.width
        canvas.height = imageElement.height
  
        // Desenăm imaginea originală
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height)
  
        // Calculăm factorii de scalare
        const scaleX = imageElement.width / imageElement.naturalWidth
        const scaleY = imageElement.height / imageElement.naturalHeight
  
        // Coordonate scalate
        const xmin = box.xmin * scaleX
        const xmax = box.xmax * scaleX
        const ymin = box.ymin * scaleY
        const ymax = box.ymax * scaleY
  
        const width = xmax - xmin
        const height = ymax - ymin
  
        // Desenăm dreptunghiul negru
        ctx.fillStyle = "black"
        ctx.fillRect(xmin, ymin, width, height)
  
        // Returnăm rezultatul ca URL de date
        resolve(canvas.toDataURL("image/jpeg", 0.9))
      } catch (error) {
        console.error("Eroare la aplicarea dreptunghiului:", error)
        reject(error)
      }
    })
  }
  
  