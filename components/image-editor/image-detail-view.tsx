"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Wand2,
  Download,
  Grid,
  Star,
  BookmarkCheck,
  Bookmark,
  Image,
  Edit,
} from "lucide-react"
import { BeforeAfterSlider } from "./before-after-slider"
import { LicensePlateEditor, type LicensePlateSettings } from "./license-plate-editor"
import { ClientPlateBlur } from "./client-plate-blur"

interface ImageDetailViewProps {
  currentImage: {
    id: string
    dataUrl: string
    enhancedUrl: string
    analysis: any
    isAnalyzing: boolean
    isEnhancing: boolean
    isFavorite: boolean
  } | null
  currentIndex: number
  totalImages: number
  blurLicensePlate: boolean
  onBlurLicensePlateChange: (value: boolean) => void
  onNavigate: (direction: "prev" | "next") => void
  onEnhance: (id: string) => void
  onDownload: (url: string, index: number) => void
  onToggleFavorite: (id: string) => void
  onPreview: (url: string) => void
  onBackToGrid: () => void
  showBeforeAfter: boolean
  beforeAfterSlider: number
  onBeforeAfterChange: (value: number) => void
  onShowBeforeAfterChange: (value: boolean) => void
  isPremium?: boolean
  onUpdateEnhancedImage: (id: string, url: string) => void
}

export function ImageDetailView({
  currentImage,
  currentIndex,
  totalImages,
  blurLicensePlate,
  onBlurLicensePlateChange,
  onNavigate,
  onEnhance,
  onDownload,
  onToggleFavorite,
  onPreview,
  onBackToGrid,
  showBeforeAfter,
  beforeAfterSlider,
  onBeforeAfterChange,
  onShowBeforeAfterChange,
  isPremium = false,
  onUpdateEnhancedImage,
}: ImageDetailViewProps) {
  const [showLicensePlateEditor, setShowLicensePlateEditor] = useState(false)
  const [licensePlateSettings, setLicensePlateSettings] = useState<LicensePlateSettings | null>(null)
  // În componenta ImageDetailView, adăugăm starea pentru coordonatele plăcuței
  const [plateCoordinates, setPlateCoordinates] = useState<{
    xmin: number
    ymin: number
    xmax: number
    ymax: number
  } | null>(null)

  // Adăugăm o funcție pentru a detecta plăcuța de înmatriculare
  const detectPlate = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/detect-plate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to detect license plate")
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const plate = data.results[0]
        setPlateCoordinates({
          xmin: plate.box.xmin,
          ymin: plate.box.ymin,
          xmax: plate.box.xmax,
          ymax: plate.box.ymax,
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error detecting license plate:", error)
      return false
    }
  }

  // Adăugăm o funcție pentru a gestiona imaginea procesată
  const handleProcessedImage = (processedImageUrl: string) => {
    // Actualizăm imaginea îmbunătățită cu cea procesată
    if (currentImage) {
      onUpdateEnhancedImage(currentImage.id, processedImageUrl)
    }
  }

  if (!currentImage) return null

  const handleSaveLicensePlateSettings = (editedImageUrl: string, settings: LicensePlateSettings) => {
    // Aici ar trebui să actualizăm imaginea cu dreptunghiul personalizat
    // Pentru exemplu, vom actualiza doar starea locală
    setLicensePlateSettings(settings)
    setShowLicensePlateEditor(false)

    // Actualizăm imaginea îmbunătățită cu cea editată manual
    // Acest cod ar trebui adaptat pentru a actualiza starea reală a imaginii
    // currentImage.enhancedUrl = editedImageUrl;
  }

  // Dacă editorul de numere de înmatriculare este deschis, îl afișăm
  if (showLicensePlateEditor) {
    return (
      <LicensePlateEditor
        imageUrl={currentImage.dataUrl}
        onSave={handleSaveLicensePlateSettings}
        onCancel={() => setShowLicensePlateEditor(false)}
        initialSettings={licensePlateSettings || undefined}
        isPremium={isPremium}
      />
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Panoul stâng - Imaginea originală */}
      <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Camera className="h-5 w-5 mr-2 text-slate-700" />
              Imagine originală
            </CardTitle>
            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <Button variant="outline" size="icon" onClick={() => onNavigate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <Badge variant="outline">
                {currentIndex + 1}/{totalImages}
              </Badge>
              {currentIndex < totalImages - 1 && (
                <Button variant="outline" size="icon" onClick={() => onNavigate("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            {currentImage?.analysis
              ? `Scor: ${currentImage.analysis.score}/5`
              : currentImage?.isAnalyzing
                ? "Se analizează..."
                : "Imaginea va fi analizată automat"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          <div className="relative overflow-hidden rounded-lg border border-slate-200 group">
            {currentImage?.dataUrl ? (
              <>
                <img
                  src={currentImage.dataUrl || "/placeholder.svg"}
                  alt="Imagine originală"
                  className="w-full mx-auto rounded-md object-contain max-h-[350px]"
                  onClick={() => onPreview(currentImage.dataUrl)}
                />
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  onClick={() => onPreview(currentImage.dataUrl)}
                >
                  <Button variant="outline" className="bg-white/90">
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Mărește
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[350px] bg-slate-100 rounded-md">
                <LoadingSpinner size="md" />
                <p className="mt-4 text-slate-500">Se încarcă imaginea...</p>
              </div>
            )}
          </div>

          {currentImage?.analysis && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Analiza imaginii</h3>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= currentImage.analysis.score ? "text-yellow-400 fill-yellow-400" : "text-slate-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium">{currentImage.analysis.score}/5</span>
                </div>
              </div>

              <Separator className="my-2" />

              <p className="text-sm text-slate-600 mb-3">{currentImage.analysis.analysis}</p>

              {currentImage.analysis.improvements && currentImage.analysis.improvements.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1">Sugestii de îmbunătățire:</h4>
                  <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                    {currentImage.analysis.improvements.map((improvement: string, index: number) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {currentImage?.isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-4">
              <LoadingSpinner size="md" className="mb-2" />
              <p className="text-sm text-slate-500">Se analizează imaginea...</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pt-0">
          <div className="flex items-center space-x-2 w-full">
            <Checkbox
              id="blur-plate"
              checked={blurLicensePlate}
              onCheckedChange={async (checked) => {
                onBlurLicensePlateChange(checked as boolean)
                if (checked && currentImage?.dataUrl) {
                  await detectPlate(currentImage.dataUrl)
                } else {
                  setPlateCoordinates(null)
                }
              }}
            />
            <Label htmlFor="blur-plate" className="text-sm font-medium cursor-pointer">
              Acoperă numărul de înmatriculare
            </Label>

            {/* Buton pentru editorul manual */}
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => setShowLicensePlateEditor(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editare manuală
            </Button>
          </div>

          {/* Adăugăm componenta ClientPlateBlur dacă avem coordonatele plăcuței */}
          {currentImage?.dataUrl && plateCoordinates && blurLicensePlate && (
            <ClientPlateBlur
              imageUrl={currentImage.dataUrl}
              plateCoordinates={plateCoordinates}
              onProcessed={handleProcessedImage}
              blurType="rectangle" // sau "pixelate" în funcție de preferință
            />
          )}

          <div className="flex gap-2 w-full">
            <Button
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-6"
              onClick={() => currentImage && onEnhance(currentImage.id)}
              disabled={!currentImage || currentImage.isEnhancing || !currentImage.dataUrl}
            >
              {currentImage?.isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Se procesează imaginea...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Îmbunătățește imaginea
                </>
              )}
            </Button>

            <Button
              variant={currentImage?.isFavorite ? "default" : "outline"}
              className="w-12"
              onClick={() => currentImage && onToggleFavorite(currentImage.id)}
              disabled={!currentImage}
            >
              {currentImage?.isFavorite ? (
                <BookmarkCheck className="h-5 w-5 text-white" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Restul codului rămâne neschimbat */}
      {/* ... */}

      {/* Panoul drept - Previzualizare */}
      <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Image className="h-5 w-5 mr-2 text-slate-700" />
            Imagine îmbunătățită
          </CardTitle>
          <CardDescription>Rezultatul procesării automate AI</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center min-h-[350px]">
          {currentImage?.isEnhancing ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-slate-500">Se procesează imaginea...</p>
              <p className="text-xs text-slate-400 mt-2">Acest proces poate dura până la 30 de secunde</p>
            </div>
          ) : currentImage?.enhancedUrl ? (
            <div className="w-full relative overflow-hidden rounded-lg border border-slate-200 group">
              <img
                src={currentImage.enhancedUrl || "/placeholder.svg"}
                alt="Imagine îmbunătățită"
                className="w-full max-h-[350px] mx-auto rounded-md object-contain"
                onClick={() => onPreview(currentImage.enhancedUrl)}
              />
              <div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => onPreview(currentImage.enhancedUrl)}
              >
                <Button variant="outline" className="bg-white/90">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Mărește
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Image className="h-16 w-16 text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">Nicio imagine îmbunătățită încă</p>
              <p className="text-sm text-slate-400">Apasă pe butonul de îmbunătățire pentru a vedea rezultatul</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="py-6"
            onClick={() => currentImage?.enhancedUrl && onDownload(currentImage.enhancedUrl, currentIndex)}
            disabled={!currentImage?.enhancedUrl}
          >
            <Download className="mr-2 h-5 w-5" />
            Descarcă
          </Button>

          <Button
            variant="default"
            className="py-6 bg-primary hover:bg-primary/90"
            onClick={() => {
              if (currentIndex < totalImages - 1) {
                onNavigate("next")
              } else {
                onBackToGrid()
              }
            }}
          >
            {currentIndex < totalImages - 1 ? (
              <>
                Următoarea imagine
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            ) : (
              <>
                Înapoi la galerie
                <Grid className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Comparație side-by-side (doar dacă există imagine îmbunătățită) */}
      {currentImage?.enhancedUrl && (
        <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Comparație înainte / după</CardTitle>
              <div className="flex items-center gap-2">
                <Switch id="show-before-after" checked={showBeforeAfter} onCheckedChange={onShowBeforeAfterChange} />
                <Label htmlFor="show-before-after" className="text-sm cursor-pointer">
                  Slider comparativ
                </Label>
              </div>
            </div>
            <CardDescription>Compară imaginea originală cu cea îmbunătățită</CardDescription>
          </CardHeader>
          <CardContent>
            {showBeforeAfter ? (
              <BeforeAfterSlider
                beforeImage={currentImage.dataUrl}
                afterImage={currentImage.enhancedUrl}
                sliderPosition={beforeAfterSlider}
                onSliderChange={onBeforeAfterChange}
                height="500px"
                className="mx-auto max-w-4xl"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={currentImage.dataUrl || "/placeholder.svg"}
                      alt="Înainte"
                      className="w-full aspect-video object-cover rounded-md"
                    />
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs py-1 px-2 rounded-full shadow-md">
                      Înainte
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative overflow-hidden rounded-lg border border-slate-200">
                    <img
                      src={currentImage.enhancedUrl || "/placeholder.svg"}
                      alt="După"
                      className="w-full aspect-video object-cover rounded-md"
                    />
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs py-1 px-2 rounded-full shadow-md">
                      După
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

