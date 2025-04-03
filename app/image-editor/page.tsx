"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Image,
  Download,
  Upload,
  Plus,
  X,
  Zap,
  Filter,
  LayoutGrid,
  LayoutList,
  Smartphone,
  Laptop,
  Tablet,
  Gauge,
  Lightbulb,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

// Importăm componentele noi
import { UploadArea } from "@/components/image-editor/upload-area"
import { ProcessingSettings } from "@/components/image-editor/processing-settings"
import { ImageCard } from "@/components/image-editor/image-card"
import { ImageDetailView } from "@/components/image-editor/image-detail-view"

export default function ImageEditorPage() {
  const [images, setImages] = useState<
    {
      id: string
      file: File | null
      dataUrl: string
      analysis: any | null
      enhancedUrl: string
      isAnalyzing: boolean
      isEnhancing: boolean
      isFavorite: boolean
    }[]
  >([])
  const [isDragging, setIsDragging] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [blurLicensePlate, setBlurLicensePlate] = useState(true)
  const [activeTab, setActiveTab] = useState("upload")
  const [fullscreenPreview, setFullscreenPreview] = useState<string | null>(null)
  const [editorView, setEditorView] = useState<"detail" | "grid">("grid")
  const [sortBy, setSortBy] = useState<"date" | "score" | "favorite">("date")
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const [beforeAfterSlider, setBeforeAfterSlider] = useState(50)
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile" | "tablet">("desktop")
  const [showTips, setShowTips] = useState(true)
  const [enhancementLevel, setEnhancementLevel] = useState<"light" | "medium" | "strong">("medium")
  const [autoEnhance, setAutoEnhance] = useState(false)
  const [showUploadArea, setShowUploadArea] = useState(true)

  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Redirecționăm utilizatorii nelogați
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=image-editor")
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a accesa editorul de imagini.",
        variant: "destructive",
      })
    }
  }, [user, loading, router, toast])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Verificăm dacă nu depășim limita de 10 imagini
    if (images.length + files.length > 10) {
      toast({
        title: "Limită atinsă",
        description: "Poți încărca maximum 10 imagini simultan.",
        variant: "destructive",
      })
      return
    }

    const newImages = Array.from(files)
      .map((file) => {
        // Verificăm dacă fișierul este o imagine
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Fișier invalid",
            description: `${file.name} nu este o imagine validă.`,
            variant: "destructive",
          })
          return null
        }

        // Verificăm dimensiunea fișierului (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Fișier prea mare",
            description: `${file.name} depășește limita de 5MB.`,
            variant: "destructive",
          })
          return null
        }

        return {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          dataUrl: "",
          analysis: null,
          enhancedUrl: "",
          isAnalyzing: false,
          isEnhancing: false,
          isFavorite: false,
        }
      })
      .filter(Boolean) as any[]

    // Adăugăm imaginile noi la cele existente
    setImages((prev) => [...prev, ...newImages])

    // Ascundem zona de upload după ce am încărcat imagini
    if (newImages.length > 0) {
      setShowUploadArea(false)
    }

    // Încărcăm dataUrl pentru fiecare imagine
    for (const image of newImages) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImages((prev) =>
          prev.map((img) => (img.id === image.id ? { ...img, dataUrl: e.target?.result as string } : img)),
        )
      }
      reader.readAsDataURL(image.file as File)
    }

    // Analizăm automat imaginile noi
    for (const image of newImages) {
      await analyzeImage(image.id, image.file as File)

      // Dacă auto-enhance este activat, îmbunătățim automat imaginea după analiză
      if (autoEnhance) {
        // Așteptăm puțin pentru a permite finalizarea analizei
        setTimeout(() => {
          handleEnhanceImage(image.id)
        }, 1000)
      }
    }

    // Dacă este prima imagine încărcată, setăm tab-ul activ la editor
    if (images.length === 0 && newImages.length > 0) {
      // Așteptăm puțin pentru a permite încărcarea imaginii înainte de a schimba tab-ul
      setTimeout(() => {
        setActiveTab("editor")
      }, 500)
    }
  }

  const analyzeImage = async (imageId: string, file: File) => {
    // Actualizăm starea pentru a arăta că imaginea se analizează
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, isAnalyzing: true } : img)))

    try {
      const formData = new FormData()
      formData.append("image", file)

      const response = await fetch("/api/image-analysis", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const data = await response.json()

      // Actualizăm starea cu rezultatele analizei
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, analysis: data, isAnalyzing: false } : img)),
      )

      toast({
        title: "Analiză completă",
        description: `Scor: ${data.score}/5. ${data.improvements.length > 0 ? "Vezi sugestiile pentru îmbunătățire." : ""}`,
      })
    } catch (error) {
      console.error("Error analyzing image:", error)

      // Actualizăm starea pentru a arăta că analiza s-a încheiat (cu eroare)
      setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, isAnalyzing: false } : img)))

      toast({
        title: "Eroare",
        description: "Nu am putut analiza imaginea. Încearcă din nou.",
        variant: "destructive",
      })
    }
  }

  const handleEnhanceImage = async (imageId: string) => {
    const image = images.find((img) => img.id === imageId)

    if (!image || !image.dataUrl) {
      toast({
        title: "Eroare",
        description: "Imaginea nu este disponibilă pentru procesare.",
        variant: "destructive",
      })
      return
    }

    // Actualizăm starea pentru a arăta că imaginea se procesează
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, isEnhancing: true } : img)))

    try {
      console.log("Starting image enhancement for image ID:", imageId)

      // Verificăm dimensiunea imaginii
      const response = await fetch(image.dataUrl)
      const blob = await response.blob()
      console.log("Original image size:", (blob.size / 1024 / 1024).toFixed(2), "MB")

      // Pre-procesare client-side pentru a optimiza imaginile prea mari
      let processedBlob = blob

      // Dacă imaginea este prea mare (> 5MB), o redimensionăm pe client
      if (blob.size > 5 * 1024 * 1024) {
        try {
          console.log("Image is too large, pre-processing on client side...")
          // Creăm un canvas pentru a redimensiona imaginea
          const img = new HTMLImageElement()
          img.crossOrigin = "anonymous"

          // Așteaptă încărcarea imaginii
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject(new Error("Failed to load image"))
            img.src = image.dataUrl
          })

          // Calculăm noile dimensiuni păstrând raportul de aspect
          let width = img.width
          let height = img.height
          const MAX_WIDTH = 1280
          const MAX_HEIGHT = 1024

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }

          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height)
            height = MAX_HEIGHT
          }

          // Redimensionăm imaginea
          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height)

            // Convertim în JPEG cu calitate redusă
            processedBlob = await new Promise<Blob>((resolve) => {
              canvas.toBlob(
                (result) => {
                  if (result) {
                    resolve(result)
                  } else {
                    resolve(blob) // Fallback to original if conversion fails
                  }
                },
                "image/jpeg",
                0.8,
              )
            })
          }

          console.log("Processed image size:", (processedBlob.size / 1024 / 1024).toFixed(2), "MB")
        } catch (error) {
          console.error("Error pre-processing image:", error)
          // Continuăm cu imaginea originală dacă pre-procesarea eșuează
        }
      }

      // Creăm un FormData pentru a trimite imaginea
      const formData = new FormData()
      formData.append("image", processedBlob, "car-image.jpg")
      formData.append("enhance", "true")
      formData.append("blurPlate", blurLicensePlate.toString())
      formData.append("enhancementLevel", enhancementLevel)

      console.log("Sending request to image-editor API with params:", {
        blurPlate: blurLicensePlate,
        enhancementLevel,
        imageSize: (processedBlob.size / 1024 / 1024).toFixed(2) + "MB",
      })

      // Apelăm API-ul nostru pentru a procesa imaginea
      const enhanceResponse = await fetch("/api/image-editor", {
        method: "POST",
        body: formData,
      })

      console.log("API response status:", enhanceResponse.status)

      if (!enhanceResponse.ok) {
        const errorText = await enhanceResponse.text()
        console.error("API error response:", errorText)
        throw new Error(
          `Failed to process image: ${enhanceResponse.status} ${enhanceResponse.statusText}. ${errorText}`,
        )
      }

      const data = await enhanceResponse.json()
      console.log("API response received successfully")

      // Actualizăm starea cu URL-ul imaginii procesate
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, enhancedUrl: data.imageUrl, isEnhancing: false } : img)),
      )

      toast({
        title: "Imagine procesată",
        description: data.message || "Procesare finalizată cu succes!",
      })
    } catch (error) {
      console.error("Error processing image:", error)

      // Actualizăm starea pentru a arăta că procesarea s-a încheiat (cu eroare)
      setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, isEnhancing: false } : img)))

      toast({
        title: "Eroare la procesare",
        description:
          error instanceof Error
            ? `Nu am putut procesa imaginea: ${error.message}`
            : "Nu am putut procesa imaginea. Încearcă din nou.",
        variant: "destructive",
      })
    }
  }

  const handleBatchEnhance = async () => {
    if (images.length === 0) {
      toast({
        title: "Nicio imagine",
        description: "Nu există imagini pentru procesare în batch.",
        variant: "destructive",
      })
      return
    }

    setBatchProcessing(true)
    setBatchProgress(0)

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]

        // Sărim peste imaginile care au fost deja îmbunătățite
        if (image.enhancedUrl) {
          setBatchProgress(Math.round(((i + 1) / images.length) * 100))
          continue
        }

        // Îmbunătățim imaginea
        await handleEnhanceImage(image.id)

        // Actualizăm progresul
        setBatchProgress(Math.round(((i + 1) / images.length) * 100))

        // Adăugăm o mică pauză pentru a evita rate limiting și pentru feedback vizual
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      toast({
        title: "Procesare în batch completă",
        description: "Toate imaginile au fost îmbunătățite cu succes!",
      })
    } catch (error) {
      console.error("Error in batch processing:", error)
      toast({
        title: "Eroare",
        description: "A apărut o eroare în timpul procesării în batch.",
        variant: "destructive",
      })
    } finally {
      setBatchProcessing(false)
    }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    if (imageUrl) {
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = `velaro-enhanced-car-image-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const toggleFavorite = (imageId: string) => {
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, isFavorite: !img.isFavorite } : img)))

    toast({
      title: "Favorite actualizat",
      description: "Starea de favorite a fost actualizată cu succes.",
    })
  }

  const removeImage = (imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId))

    // Dacă am șters imaginea curentă, actualizăm indexul
    if (images[currentImageIndex]?.id === imageId) {
      setCurrentImageIndex((prev) => Math.min(prev, images.length - 2))
    }

    // Dacă am șters toate imaginile, arătăm din nou zona de upload
    if (images.length <= 1) {
      setShowUploadArea(true)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFileUpload(files)
  }

  const navigateImages = (direction: "prev" | "next") => {
    if (direction === "prev" && currentImageIndex > 0) {
      setCurrentImageIndex((prev) => prev - 1)
    } else if (direction === "next" && currentImageIndex < images.length - 1) {
      setCurrentImageIndex((prev) => prev + 1)
    }
  }

  const downloadAllEnhanced = () => {
    const enhancedImages = images.filter((img) => img.enhancedUrl)
    if (enhancedImages.length === 0) {
      toast({
        title: "Nicio imagine îmbunătățită",
        description: "Nu există imagini îmbunătățite pentru descărcare.",
        variant: "destructive",
      })
      return
    }

    // Descărcăm fiecare imagine îmbunătățită
    enhancedImages.forEach((img, index) => {
      setTimeout(() => {
        handleDownload(img.enhancedUrl, index)
      }, index * 500) // Adăugăm un delay pentru a evita probleme cu blocarea descărcărilor multiple
    })

    toast({
      title: "Descărcare inițiată",
      description: `Se descarcă ${enhancedImages.length} imagini îmbunătățite.`,
    })
  }

  // Adăugăm funcția pentru actualizarea imaginii îmbunătățite
  const handleUpdateEnhancedImage = (imageId: string, newUrl: string) => {
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, enhancedUrl: newUrl } : img)))
  }

  // Sortăm imaginile în funcție de criteriul selectat
  const sortedImages = [...images].sort((a, b) => {
    if (sortBy === "score") {
      const scoreA = a.analysis?.score || 0
      const scoreB = b.analysis?.score || 0
      return scoreB - scoreA // Sortare descrescătoare după scor
    } else if (sortBy === "favorite") {
      // Sortare cu favorite la început
      return a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1
    } else {
      // Sortare implicită după data adăugării (id conține timestamp)
      return a.id.localeCompare(b.id)
    }
  })

  // Dacă utilizatorul nu este autentificat și încă se încarcă, afișăm un spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Se încarcă..." />
      </div>
    )
  }

  // Dacă utilizatorul nu este autentificat și nu se mai încarcă, nu afișăm nimic (redirecționarea se va face prin useEffect)
  if (!user && !loading) {
    return null
  }

  const currentImage = images[currentImageIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Preview fullscreen */}
      <AnimatePresence>
        {fullscreenPreview && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-full max-h-full"
            >
              <img
                src={fullscreenPreview || "/placeholder.svg"}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-white rounded-full"
                onClick={(e) => {
                  e.stopPropagation()
                  setFullscreenPreview(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-slate-600 hover:text-slate-900 mb-2 group transition-all">
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow mr-2 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Înapoi la pagina principală</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Editor de imagini AI pentru mașini
          </h1>
          <p className="text-center text-slate-600 mb-6">
            Îmbunătățește calitatea fotografiilor pentru anunțul tău auto
          </p>
        </div>

        {/* Modificăm structura paginii pentru a avea pași clari */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="mx-auto w-full max-w-md grid grid-cols-3 p-1 bg-slate-100 rounded-xl">
            <TabsTrigger
              value="upload"
              className="relative overflow-visible group rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex flex-col items-center py-2">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center mb-1 shadow-sm">
                  1
                </div>
                <span className="text-xs font-medium">Încarcă</span>
              </div>
              {images.length > 0 && (
                <Badge className="absolute -right-1 -top-1 transform scale-75 bg-primary text-white z-10">
                  {images.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              disabled={images.length === 0}
              className="relative overflow-visible group rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex flex-col items-center py-2">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center mb-1 shadow-sm">
                  2
                </div>
                <span className="text-xs font-medium">Editează</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="export"
              disabled={images.length === 0}
              className="relative overflow-visible group rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <div className="flex flex-col items-center py-2">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center mb-1 shadow-sm">
                  3
                </div>
                <span className="text-xs font-medium">Exportă</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Conținutul tab-urilor rămâne același, dar adăugăm un nou tab pentru export */}
          <TabsContent value="upload" className="space-y-6">
            {/* Secțiunea de încărcare imagini */}
            <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-primary" />
                  Încarcă imagini
                </CardTitle>
                <CardDescription>Trage și plasează imagini sau folosește butonul de încărcare</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Zona de upload - afișată doar dacă showUploadArea este true sau nu avem imagini */}
                {(showUploadArea || images.length === 0) && (
                  <UploadArea
                    isDragging={isDragging}
                    imagesCount={images.length}
                    maxImages={10}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onFileSelect={handleFileUpload}
                  />
                )}

                {/* Setări de procesare */}
                <ProcessingSettings
                  blurLicensePlate={blurLicensePlate}
                  onBlurLicensePlateChange={setBlurLicensePlate}
                  autoEnhance={autoEnhance}
                  onAutoEnhanceChange={setAutoEnhance}
                  enhancementLevel={enhancementLevel}
                  onEnhancementLevelChange={setEnhancementLevel}
                />

                {/* Miniaturi imagini */}
                {images.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium flex items-center">
                        <Image className="h-5 w-5 mr-2 text-slate-700" />
                        Imagini încărcate
                      </h3>
                      <div className="flex gap-2">
                        {!showUploadArea && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUploadArea(true)}
                            className="bg-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adaugă mai multe
                          </Button>
                        )}

                        {images.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBatchEnhance}
                            disabled={batchProcessing || images.length === 0}
                            className="bg-white"
                          >
                            {batchProcessing ? (
                              <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Procesare în batch...
                              </>
                            ) : (
                              <>
                                <Zap className="h-4 w-4 mr-2" />
                                Îmbunătățește toate
                              </>
                            )}
                          </Button>
                        )}
                        {images.some((img) => img.enhancedUrl) && (
                          <Button variant="outline" size="sm" onClick={downloadAllEnhanced} className="bg-white">
                            <Download className="h-4 w-4 mr-2" />
                            Descarcă toate
                          </Button>
                        )}
                      </div>
                    </div>

                    {batchProcessing && (
                      <div className="space-y-2">
                        <Progress value={batchProgress} className="h-2" />
                        <p className="text-xs text-center text-slate-500">
                          Procesare în batch: {batchProgress}% completat
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`relative rounded-md overflow-hidden border-2 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                            index === currentImageIndex ? "border-primary" : "border-transparent"
                          }`}
                          onClick={() => {
                            setCurrentImageIndex(index)
                            setActiveTab("editor")
                          }}
                        >
                          {image.dataUrl ? (
                            <div className="aspect-square relative">
                              <img
                                src={image.dataUrl || "/placeholder.svg"}
                                alt={`Imagine ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="default"
                                    size="icon"
                                    className="h-8 w-8 bg-white/90 text-slate-700 hover:bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setFullscreenPreview(image.dataUrl)
                                    }}
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                    </svg>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeImage(image.id)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {image.isAnalyzing && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <LoadingSpinner size="sm" />
                                </div>
                              )}
                              {image.analysis && (
                                <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md">
                                  <div className="flex items-center">
                                    <svg
                                      className={`h-3 w-3 ${
                                        image.analysis.score >= 4
                                          ? "text-yellow-400 fill-yellow-400"
                                          : image.analysis.score >= 3
                                            ? "text-yellow-500"
                                            : "text-slate-400"
                                      }`}
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                    <span className="text-xs ml-0.5">{image.analysis.score}</span>
                                  </div>
                                </div>
                              )}
                              {image.enhancedUrl && (
                                <div className="absolute bottom-1 left-1 bg-green-500 rounded-full p-1 shadow-md">
                                  <svg
                                    className="h-3 w-3 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                  </svg>
                                </div>
                              )}
                              {image.isFavorite && (
                                <div className="absolute top-1 left-1 bg-yellow-500 rounded-full p-1 shadow-md">
                                  <svg
                                    className="h-3 w-3 text-white fill-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="aspect-square bg-slate-100 flex items-center justify-center">
                              <LoadingSpinner size="sm" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {images.length > 0 && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={() => setActiveTab("editor")}
                      className="px-6 py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                    >
                      Continuă la editor
                      <svg
                        className="ml-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sugestii pentru fotografii mai bune */}
            {showTips && (
              <Card className="shadow-md border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Sfaturi pentru fotografii mai bune
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowTips(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>Cum să obții cele mai bune fotografii pentru anunțul tău auto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <svg
                          className="h-4 w-4 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="5" />
                          <line x1="12" y1="1" x2="12" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="23" />
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                          <line x1="1" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="12" x2="23" y2="12" />
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                        Iluminare
                      </h3>
                      <p className="text-sm text-blue-700">
                        Fotografiază mașina la răsărit sau apus pentru o lumină difuză, sau la umbră în zilele însorite.
                        Evită lumina directă a soarelui care creează reflexii puternice.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <svg
                          className="h-4 w-4 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        Unghi și distanță
                      </h3>
                      <p className="text-sm text-blue-700">
                        Fotografiază din mai multe unghiuri: 3/4 față, lateral, spate. Menține distanța uniformă și
                        fotografiază de la înălțimea mașinii pentru proporții corecte.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <svg
                          className="h-4 w-4 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 3h20" />
                          <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
                          <path d="m7 16 5 5 5-5" />
                        </svg>
                        Fundal și context
                      </h3>
                      <p className="text-sm text-blue-700">
                        Alege un fundal neutru și curat, fără elemente care distrag atenția. Spații deschise, parcări
                        goale sau zone verzi simple sunt ideale.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            {images.length > 0 && (
              <>
                {/* Controale pentru vizualizare și sortare */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={editorView === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditorView("grid")}
                    >
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      Grid
                    </Button>

                    <Button
                      variant={editorView === "detail" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditorView("detail")}
                    >
                      <LayoutList className="h-4 w-4 mr-2" />
                      Detaliat
                    </Button>

                    <Separator orientation="vertical" className="h-8 mx-2" />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Sortare: {sortBy === "date" ? "Data adăugării" : sortBy === "score" ? "Scor" : "Favorite"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setSortBy("date")}>Data adăugării</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("score")}>Scor</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy("favorite")}>Favorite</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Previzualizare
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setDevicePreview("desktop")}>
                          <Laptop className="h-4 w-4 mr-2" />
                          Desktop
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDevicePreview("mobile")}>
                          <Smartphone className="h-4 w-4 mr-2" />
                          Mobil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDevicePreview("tablet")}>
                          <Tablet className="h-4 w-4 mr-2" />
                          Tabletă
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-white">
                      <Gauge className="h-3 w-3 mr-1 text-primary" />
                      {images.filter((img) => img.enhancedUrl).length}/{images.length} îmbunătățite
                    </Badge>

                    {images.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBatchEnhance}
                        disabled={batchProcessing}
                        className="bg-white"
                      >
                        {batchProcessing ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Procesare...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Îmbunătățește toate
                          </>
                        )}
                      </Button>
                    )}

                    {images.some((img) => img.enhancedUrl) && (
                      <Button variant="outline" size="sm" onClick={downloadAllEnhanced} className="bg-white">
                        <Download className="h-4 w-4 mr-2" />
                        Descarcă toate
                      </Button>
                    )}
                  </div>
                </div>

                {/* Vizualizare Grid */}
                {editorView === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedImages.map((image, index) => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        index={index}
                        devicePreview={devicePreview}
                        onEnhance={handleEnhanceImage}
                        onDownload={handleDownload}
                        onToggleFavorite={toggleFavorite}
                        onRemove={removeImage}
                        onViewDetails={(index) => {
                          setCurrentImageIndex(index)
                          setEditorView("detail")
                        }}
                        onPreview={(url) => setFullscreenPreview(url)}
                      />
                    ))}
                  </div>
                )}

                {/* Vizualizare detaliată */}
                {editorView === "detail" && (
                  <ImageDetailView
                    currentImage={currentImage}
                    currentIndex={currentImageIndex}
                    totalImages={images.length}
                    blurLicensePlate={blurLicensePlate}
                    onBlurLicensePlateChange={setBlurLicensePlate}
                    onNavigate={navigateImages}
                    onEnhance={handleEnhanceImage}
                    onDownload={handleDownload}
                    onToggleFavorite={toggleFavorite}
                    onPreview={(url) => setFullscreenPreview(url)}
                    onBackToGrid={() => setEditorView("grid")}
                    showBeforeAfter={showBeforeAfter}
                    beforeAfterSlider={beforeAfterSlider}
                    onBeforeAfterChange={setBeforeAfterSlider}
                    onShowBeforeAfterChange={setShowBeforeAfter}
                    onUpdateEnhancedImage={handleUpdateEnhancedImage}
                  />
                )}
              </>
            )}
          </TabsContent>
          <TabsContent value="export" className="space-y-6">
            <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2 text-primary" />
                  Exportă imaginile
                </CardTitle>
                <CardDescription>Descarcă imaginile editate sau trimite-le direct în anunțul tău</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images
                    .filter((img) => img.enhancedUrl)
                    .map((image, index) => (
                      <div key={image.id} className="border rounded-lg overflow-hidden bg-white">
                        <div className="aspect-video bg-slate-100 relative">
                          <img
                            src={image.enhancedUrl || "/placeholder.svg"}
                            alt={`Imagine ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 flex justify-between items-center">
                          <p className="font-medium">Imagine {index + 1}</p>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(image.enhancedUrl, index)}>
                            <Download className="h-4 w-4 mr-2" />
                            Descarcă
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>

                {images.filter((img) => img.enhancedUrl).length === 0 ? (
                  <div className="text-center py-12">
                    <Download className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-2">Nu ai nicio imagine îmbunătățită</p>
                    <p className="text-sm text-slate-400 mb-4">
                      Editează imaginile în pasul anterior pentru a le putea exporta
                    </p>
                    <Button onClick={() => setActiveTab("editor")}>Înapoi la editare</Button>
                  </div>
                ) : (
                  <div className="flex justify-center mt-6">
                    <Button onClick={downloadAllEnhanced} className="px-6 py-6">
                      <Download className="mr-2 h-5 w-5" />
                      Descarcă toate imaginile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

