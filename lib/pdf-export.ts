import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface ExportToPdfOptions {
  content: string
  fileName?: string
  watermark?: boolean
}

export async function exportToPdf({
  content,
  fileName = "anunt-auto.pdf",
  watermark = false,
}: ExportToPdfOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Creăm un element temporar pentru a randa HTML-ul
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = content
      tempDiv.style.width = "595px" // Lățimea standard A4 în pixeli la 72 DPI
      tempDiv.style.padding = "40px"
      tempDiv.style.boxSizing = "border-box"
      tempDiv.style.fontFamily = "Arial, sans-serif"
      tempDiv.style.position = "fixed"
      tempDiv.style.left = "-10000px"
      tempDiv.style.top = "0"

      // Adăugăm elementul la DOM pentru a putea fi randat
      document.body.appendChild(tempDiv)

      // Folosim html2canvas pentru a converti HTML-ul în canvas
      html2canvas(tempDiv, {
        scale: 2, // Calitate mai bună
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })
        .then((canvas) => {
          // Creăm un document PDF A4
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
          })

          // Convertim canvas-ul în imagine
          const imgData = canvas.toDataURL("image/jpeg", 1.0)

          // Adăugăm imaginea în PDF
          pdf.addImage(imgData, "JPEG", 0, 0, 210, (canvas.height * 210) / canvas.width)

          // Adăugăm watermark dacă este necesar
          if (watermark) {
            pdf.setTextColor(200, 200, 200) // Gri deschis
            pdf.setFontSize(60)
            pdf.setGState(new pdf.GState({ opacity: 0.3 }))

            // Rotim și poziționăm watermark-ul în centrul paginii
            pdf.saveGraphicsState()
            pdf.translate(105, 150)
            pdf.rotate(-45)
            pdf.text("VELARO", 0, 0, { align: "center" })
            pdf.restoreGraphicsState()

            // Adăugăm și un footer cu watermark
            pdf.setTextColor(150, 150, 150)
            pdf.setFontSize(8)
            pdf.setGState(new pdf.GState({ opacity: 0.8 }))
            pdf.text("Generat cu Velaro - listingai.ro", 105, 290, { align: "center" })
          }

          // Salvăm PDF-ul
          pdf.save(fileName)

          // Curățăm elementul temporar
          document.body.removeChild(tempDiv)

          resolve()
        })
        .catch((error) => {
          document.body.removeChild(tempDiv)
          reject(error)
        })
    } catch (error) {
      reject(error)
    }
  })
}

