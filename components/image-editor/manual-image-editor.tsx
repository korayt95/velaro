"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ColorPicker } from "@/components/ui/color-picker"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Save, RotateCcw, Type, Sliders, Palette, Check, X, Square, Circle, Undo, Redo } from "lucide-react"

interface ManualImageEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string) => void
  onCancel: () => void
}

export function ManualImageEditor({ imageUrl, onSave, onCancel }: ManualImageEditorProps) {
  const [activeTab, setActiveTab] = useState("adjust")
  const [isProcessing, setIsProcessing] = useState(false)
  const [undoStack, setUndoStack] = useState<string[]>([])
  const [redoStack, setRedoStack] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(imageUrl)

  // Stări pentru ajustări
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(100)

  // Stări pentru text și forme
  const [textInput, setTextInput] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [textSize, setTextSize] = useState(24)
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 })

  // Stări pentru filtre
  const [selectedFilter, setSelectedFilter] = useState("none")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Inițializare canvas și imagine
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    img.onload = () => {
      imageRef.current = img
      drawImageToCanvas()
      // Salvăm starea inițială pentru undo
      setUndoStack([imageUrl])
    }
  }, [imageUrl])

  // Funcție pentru desenarea imaginii pe canvas
  const drawImageToCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Setăm dimensiunile canvas-ului
    canvas.width = imageRef.current.width
    canvas.height = imageRef.current.height

    // Aplicăm transformările
    ctx.save()

    // Translăm la centrul canvas-ului pentru rotație
    ctx.translate(canvas.width / 2, canvas.height / 2)

    // Rotim
    ctx.rotate((rotation * Math.PI) / 180)

    // Aplicăm zoom
    const scale = zoom / 100
    ctx.scale(scale, scale)

    // Desenăm imaginea centrată
    ctx.drawImage(
      imageRef.current,
      -imageRef.current.width / 2,
      -imageRef.current.height / 2,
      imageRef.current.width,
      imageRef.current.height,
    )

    // Restaurăm contextul
    ctx.restore()

    // Aplicăm filtrele
    applyFilters(ctx, canvas)

    // Actualizăm imaginea curentă
    setCurrentImage(canvas.toDataURL("image/jpeg"))
  }

  // Aplicăm filtrele pe imagine
  const applyFilters = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Aplicăm brightness, contrast, saturation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      // Brightness
      const brightnessValue = brightness / 100
      data[i] = data[i] * brightnessValue
      data[i + 1] = data[i + 1] * brightnessValue
      data[i + 2] = data[i + 2] * brightnessValue

      // Contrast
      const contrastFactor = (contrast / 100) * 2
      const factor = (259 * (contrastFactor + 255)) / (255 * (259 - contrastFactor))
      data[i] = factor * (data[i] - 128) + 128
      data[i + 1] = factor * (data[i + 1] - 128) + 128
      data[i + 2] = factor * (data[i + 2] - 128) + 128

      // Saturation
      const saturationValue = saturation / 100
      const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      data[i] = gray + saturationValue * (data[i] - gray)
      data[i + 1] = gray + saturationValue * (data[i + 1] - gray)
      data[i + 2] = gray + saturationValue * (data[i + 2] - gray)
    }

    // Aplicăm filtrele predefinite
    switch (selectedFilter) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
          data[i] = avg
          data[i + 1] = avg
          data[i + 2] = avg
        }
        break
      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        }
        break
      case "invert":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]
          data[i + 1] = 255 - data[i + 1]
          data[i + 2] = 255 - data[i + 2]
        }
        break
      case "highContrast":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] > 127 ? 255 : 0
          data[i + 1] = data[i + 1] > 127 ? 255 : 0
          data[i + 2] = data[i + 2] > 127 ? 255 : 0
        }
        break
      case "vintage":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = Math.min(255, r * 0.9 + g * 0.1 + b * 0.1)
          data[i + 1] = Math.min(255, r * 0.2 + g * 0.7 + b * 0.1)
          data[i + 2] = Math.min(255, r * 0.1 + g * 0.1 + b * 0.8)
        }
        break
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // Funcție pentru a adăuga text pe imagine
  const addTextToImage = () => {
    if (!canvasRef.current || !textInput) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Salvăm starea curentă pentru undo
    saveToUndoStack()

    // Setăm proprietățile textului
    ctx.fillStyle = textColor
    ctx.font = `${textSize}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Calculăm poziția textului
    const x = (textPosition.x / 100) * canvas.width
    const y = (textPosition.y / 100) * canvas.height

    // Desenăm textul
    ctx.fillText(textInput, x, y)

    // Actualizăm imaginea curentă
    setCurrentImage(canvas.toDataURL("image/jpeg"))
  }

  // Funcție pentru a adăuga o formă pe imagine
  const addShape = (shape: "rectangle" | "circle") => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Salvăm starea curentă pentru undo
    saveToUndoStack()

    // Setăm proprietățile formei
    ctx.strokeStyle = textColor
    ctx.lineWidth = 3

    // Calculăm poziția și dimensiunea
    const x = (textPosition.x / 100) * canvas.width
    const y = (textPosition.y / 100) * canvas.height
    const size = textSize * 2

    // Desenăm forma
    if (shape === "rectangle") {
      ctx.strokeRect(x - size / 2, y - size / 2, size, size)
    } else if (shape === "circle") {
      ctx.beginPath()
      ctx.arc(x, y, size / 2, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Actualizăm imaginea curentă
    setCurrentImage(canvas.toDataURL("image/jpeg"))
  }

  // Funcție pentru a salva starea curentă în stiva de undo
  const saveToUndoStack = () => {
    if (!canvasRef.current) return

    const currentState = canvasRef.current.toDataURL("image/jpeg")
    setUndoStack((prev) => [...prev, currentState])
    setRedoStack([]) // Resetăm stiva de redo când facem o nouă modificare
  }

  // Funcție pentru undo
  const handleUndo = () => {
    if (undoStack.length <= 1) return

    const newUndoStack = [...undoStack]
    const lastState = newUndoStack.pop()
    if (!lastState) return

    setRedoStack((prev) => [...prev, currentImage])
    setUndoStack(newUndoStack)

    // Încărcăm ultima stare
    const lastValidState = newUndoStack[newUndoStack.length - 1]
    setCurrentImage(lastValidState)

    // Încărcăm imaginea în canvas
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = lastValidState
    img.onload = () => {
      if (!canvasRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0, img.width, img.height)
    }
  }

  // Funcție pentru redo
  const handleRedo = () => {
    if (redoStack.length === 0) return

    const newRedoStack = [...redoStack]
    const nextState = newRedoStack.pop()
    if (!nextState) return

    setUndoStack((prev) => [...prev, currentImage])
    setRedoStack(newRedoStack)

    // Încărcăm următoarea stare
    setCurrentImage(nextState)

    // Încărcăm imaginea în canvas
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = nextState
    img.onload = () => {
      if (!canvasRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0, img.width, img.height)
    }
  }

  // Funcție pentru a aplica modificările
  const applyChanges = () => {
    drawImageToCanvas()
    saveToUndoStack()
  }

  // Funcție pentru a salva imaginea finală
  const handleSave = () => {
    setIsProcessing(true)

    setTimeout(() => {
      if (canvasRef.current) {
        const finalImage = canvasRef.current.toDataURL("image/jpeg")
        onSave(finalImage)
      }
      setIsProcessing(false)
    }, 500)
  }

  // Funcție pentru a reseta toate modificările
  const handleReset = () => {
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setRotation(0)
    setZoom(100)
    setSelectedFilter("none")

    // Resetăm canvas-ul la imaginea originală
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrl
    img.onload = () => {
      imageRef.current = img
      drawImageToCanvas()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panoul stâng - Previzualizare imagine */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Editor imagine</CardTitle>
            <CardDescription>Editează și personalizează imaginea folosind instrumentele disponibile</CardDescription>
          </CardHeader>

          <CardContent>
            <div
              className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center"
              style={{ minHeight: "500px" }}
            >
              {isProcessing ? (
                <LoadingSpinner size="lg" text="Se procesează imaginea..." />
              ) : (
                <>
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[500px] object-contain"
                    style={{ display: "none" }} // Canvas-ul este ascuns, folosim doar pentru procesare
                  />
                  <img
                    src={currentImage || "/placeholder.svg"}
                    alt="Imagine editată"
                    className="max-w-full max-h-[500px] object-contain"
                  />
                </>
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length <= 1}>
                  <Undo className="h-4 w-4 mr-1" />
                  Undo
                </Button>
                <Button variant="outline" size="sm" onClick={handleRedo} disabled={redoStack.length === 0}>
                  <Redo className="h-4 w-4 mr-1" />
                  Redo
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Anulează
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Resetează
                </Button>
                <Button onClick={handleSave} disabled={isProcessing}>
                  {isProcessing ? <LoadingSpinner size="sm" className="mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                  Salvează
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panoul drept - Controale */}
      <div>
        <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Instrumente de editare</CardTitle>
            <CardDescription>Ajustează și personalizează imaginea</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="adjust" className="text-xs">
                  <Sliders className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Ajustări</span>
                </TabsTrigger>
                <TabsTrigger value="filters" className="text-xs">
                  <Palette className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Filtre</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="text-xs">
                  <Type className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Text & Forme</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab pentru ajustări */}
              <TabsContent value="adjust" className="space-y-4">
                <div className="space-y-2">
                  <Label>Luminozitate ({brightness}%)</Label>
                  <Slider
                    value={[brightness]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setBrightness(value[0])}
                    onValueCommit={applyChanges}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contrast ({contrast}%)</Label>
                  <Slider
                    value={[contrast]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setContrast(value[0])}
                    onValueCommit={applyChanges}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Saturație ({saturation}%)</Label>
                  <Slider
                    value={[saturation]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setSaturation(value[0])}
                    onValueCommit={applyChanges}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rotație ({rotation}°)</Label>
                  <Slider
                    value={[rotation]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={(value) => setRotation(value[0])}
                    onValueCommit={applyChanges}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Zoom ({zoom}%)</Label>
                  <Slider
                    value={[zoom]}
                    min={50}
                    max={200}
                    step={1}
                    onValueChange={(value) => setZoom(value[0])}
                    onValueCommit={applyChanges}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={applyChanges} className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Aplică ajustările
                  </Button>
                </div>
              </TabsContent>

              {/* Tab pentru filtre */}
              <TabsContent value="filters" className="space-y-4">
                <div className="space-y-2">
                  <Label>Filtre predefinite</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`border rounded-md p-2 cursor-pointer transition-all ${selectedFilter === "none" ? "border-primary bg-primary/10" : "border-slate-200"}`}
                      onClick={() => {
                        setSelectedFilter("none")
                        applyChanges()
                      }}
                    >
                      <div className="aspect-square bg-slate-100 mb-1"></div>
                      <p className="text-xs text-center">Normal</p>
                    </div>
                    <div
                      className={`border rounded-md p-2 cursor-pointer transition-all ${selectedFilter === "grayscale" ? "border-primary bg-primary/10" : "border-slate-200"}`}
                      onClick={() => {
                        setSelectedFilter("grayscale")
                        applyChanges()
                      }}
                    >
                      <div className="aspect-square bg-gray-500 mb-1"></div>
                      <p className="text-xs text-center">Alb-negru</p>
                    </div>
                    <div
                      className={`border rounded-md p-2 cursor-pointer transition-all ${selectedFilter === "sepia" ? "border-primary bg-primary/10" : "border-slate-200"}`}
                      onClick={() => {
                        setSelectedFilter("sepia")
                        applyChanges()
                      }}
                    >
                      <div className="aspect-square bg-amber-200 mb-1"></div>
                      <p className="text-xs text-center">Sepia</p>
                    </div>
                    <div
                      className={`border rounded-md p-2 cursor-pointer transition-all ${selectedFilter === "invert" ? "border-primary bg-primary/10" : "border-slate-200"}`}
                      onClick={() => {
                        setSelectedFilter("invert")
                        applyChanges()
                      }}
                    >
                      <div className="aspect-square bg-slate-800 mb-1"></div>
                      <p className="text-xs text-center">Inversat</p>
                    </div>
                    <div
                      className={`border rounded-md p-2 cursor-pointer transition-all ${selectedFilter === "highContrast" ? "border-primary bg-primary/10" : "border-slate-200"}`}
                      onClick={() => {
                        setSelectedFilter("highContrast")
                        applyChanges()
                      }}
                    >
                      <div className="aspect-square bg-gradient-to-r from-black to-white mb-1"></div>
                      <p className="text-xs text-center">Contrast</p>
                    </div>
                    <div
                      className={`border rounded-md p-2 cursor-pointer transition-all ${selectedFilter === "vintage" ? "border-primary bg-primary/10" : "border-slate-200"}`}
                      onClick={() => {
                        setSelectedFilter("vintage")
                        applyChanges()
                      }}
                    >
                      <div className="aspect-square bg-amber-700 mb-1"></div>
                      <p className="text-xs text-center">Vintage</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={applyChanges} className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Aplică filtrul
                  </Button>
                </div>
              </TabsContent>

              {/* Tab pentru text și forme */}
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-input">Text</Label>
                  <Input
                    id="text-input"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Introdu textul"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Culoare text</Label>
                  <ColorPicker
                    value={textColor}
                    onChange={setTextColor}
                    presetColors={["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00"]}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dimensiune text ({textSize}px)</Label>
                  <Slider
                    value={[textSize]}
                    min={10}
                    max={100}
                    step={1}
                    onValueChange={(value) => setTextSize(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Poziție orizontală ({textPosition.x}%)</Label>
                  <Slider
                    value={[textPosition.x]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setTextPosition((prev) => ({ ...prev, x: value[0] }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Poziție verticală ({textPosition.y}%)</Label>
                  <Slider
                    value={[textPosition.y]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setTextPosition((prev) => ({ ...prev, y: value[0] }))}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-4">
                  <Button onClick={addTextToImage}>
                    <Type className="h-4 w-4 mr-1" />
                    Adaugă text
                  </Button>
                  <Button onClick={() => addShape("rectangle")}>
                    <Square className="h-4 w-4 mr-1" />
                    Dreptunghi
                  </Button>
                  <Button onClick={() => addShape("circle")}>
                    <Circle className="h-4 w-4 mr-1" />
                    Cerc
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Resetează
            </Button>
            <Button onClick={handleSave} disabled={isProcessing}>
              {isProcessing ? <LoadingSpinner size="sm" className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
              Salvează
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

