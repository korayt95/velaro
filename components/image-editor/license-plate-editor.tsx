"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Move, Maximize, Palette, Type, Save, RotateCcw, Check, X, Upload } from "lucide-react"

interface LicensePlateEditorProps {
  imageUrl: string
  onSave: (editedImageUrl: string, settings: LicensePlateSettings) => void
  onCancel: () => void
  initialSettings?: LicensePlateSettings
  isPremium?: boolean
}

export interface LicensePlateSettings {
  position: { x: number; y: number }
  size: { width: number; height: number }
  color: string
  opacity: number
  text: string
  textColor: string
  fontSize: number
  rotation: number
  useTemplate: boolean
  templateId?: string
}

export function LicensePlateEditor({
  imageUrl,
  onSave,
  onCancel,
  initialSettings,
  isPremium = false,
}: LicensePlateEditorProps) {
  // Starea pentru setările dreptunghiului
  const [settings, setSettings] = useState<LicensePlateSettings>(
    initialSettings || {
      position: { x: 50, y: 80 }, // Poziție implicită (procente)
      size: { width: 30, height: 8 }, // Dimensiune implicită (procente)
      color: "#000000", // Culoare implicită (negru)
      opacity: 1, // Opacitate implicită
      text: "", // Text implicit (gol)
      textColor: "#FFFFFF", // Culoare text implicită (alb)
      fontSize: 14, // Dimensiune font implicită
      rotation: 0, // Rotație implicită
      useTemplate: false, // Nu folosim template implicit
      templateId: undefined, // Niciun template selectat implicit
    },
  )

  // Stare pentru a urmări dacă dreptunghiul este în curs de tragere
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [activeTab, setActiveTab] = useState("position")
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; imageUrl: string }>>([])

  // Referințe pentru container și imagine
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Încărcăm template-urile utilizatorului (pentru utilizatorii premium)
  useEffect(() => {
    if (isPremium) {
      // Aici ar trebui să facem un apel API pentru a încărca template-urile utilizatorului
      // Pentru exemplu, vom folosi niște template-uri hardcodate
      setTemplates([
        { id: "template1", name: "Template 1", imageUrl: "/placeholder.svg?height=100&width=400" },
        { id: "template2", name: "Template 2", imageUrl: "/placeholder.svg?height=100&width=400" },
      ])
    }
  }, [isPremium])

  // Funcție pentru a actualiza poziția dreptunghiului în timpul tragerii
  const handleDrag = (event, info) => {
    if (!containerRef.current || !imageRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const imageRect = imageRef.current.getBoundingClientRect()

    // Calculăm noua poziție în procente
    const newX = ((info.point.x - imageRect.left) / imageRect.width) * 100
    const newY = ((info.point.y - imageRect.top) / imageRect.height) * 100

    // Actualizăm poziția, asigurându-ne că rămâne în limitele imaginii
    setSettings((prev) => ({
      ...prev,
      position: {
        x: Math.max(0, Math.min(100 - prev.size.width, newX)),
        y: Math.max(0, Math.min(100 - prev.size.height, newY)),
      },
    }))
  }

  // Funcție pentru a actualiza dimensiunea dreptunghiului în timpul redimensionării
  const handleResize = (event, info) => {
    if (!containerRef.current || !imageRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const imageRect = imageRef.current.getBoundingClientRect()

    // Calculăm noua dimensiune în procente
    const newWidth = (info.offset.x / imageRect.width) * 100
    const newHeight = (info.offset.y / imageRect.height) * 100

    // Actualizăm dimensiunea, asigurându-ne că rămâne în limite rezonabile
    setSettings((prev) => ({
      ...prev,
      size: {
        width: Math.max(5, Math.min(90, prev.size.width + newWidth)),
        height: Math.max(2, Math.min(50, prev.size.height + newHeight)),
      },
    }))
  }

  // Funcție pentru a genera imaginea finală cu dreptunghiul aplicat
  const generateFinalImage = async () => {
    if (!imageRef.current) return imageUrl

    // Creăm un canvas pentru a desena imaginea cu dreptunghiul
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return imageUrl

    // Setăm dimensiunile canvas-ului la dimensiunile imaginii
    const img = new Image()
    img.crossOrigin = "anonymous"

    return new Promise<string>((resolve) => {
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        // Desenăm imaginea originală
        ctx.drawImage(img, 0, 0)

        // Salvăm starea curentă a canvas-ului
        ctx.save()

        // Calculăm coordonatele și dimensiunile dreptunghiului în pixeli
        const rectX = (settings.position.x / 100) * img.width
        const rectY = (settings.position.y / 100) * img.height
        const rectWidth = (settings.size.width / 100) * img.width
        const rectHeight = (settings.size.height / 100) * img.height

        // Aplicăm rotația (dacă există)
        if (settings.rotation !== 0) {
          // Rotim în jurul centrului dreptunghiului
          const centerX = rectX + rectWidth / 2
          const centerY = rectY + rectHeight / 2

          ctx.translate(centerX, centerY)
          ctx.rotate((settings.rotation * Math.PI) / 180)
          ctx.translate(-centerX, -centerY)
        }

        // Setăm culoarea și opacitatea dreptunghiului
        ctx.fillStyle = settings.color
        ctx.globalAlpha = settings.opacity

        // Desenăm dreptunghiul
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight)

        // Dacă avem text, îl desenăm
        if (settings.text) {
          ctx.globalAlpha = 1 // Resetăm opacitatea pentru text
          ctx.fillStyle = settings.textColor
          ctx.font = `bold ${settings.fontSize}px Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          // Desenăm textul în centrul dreptunghiului
          ctx.fillText(settings.text, rectX + rectWidth / 2, rectY + rectHeight / 2)
        }

        // Restaurăm starea canvas-ului
        ctx.restore()

        // Convertim canvas-ul în URL de date
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
        resolve(dataUrl)
      }

      img.src = imageUrl
    })
  }

  // Funcție pentru a salva setările și imaginea editată
  const handleSave = async () => {
    const editedImageUrl = await generateFinalImage()
    onSave(editedImageUrl, settings)
  }

  // Funcție pentru a reseta setările la valorile implicite
  const handleReset = () => {
    setSettings({
      position: { x: 50, y: 80 },
      size: { width: 30, height: 8 },
      color: "#000000",
      opacity: 1,
      text: "",
      textColor: "#FFFFFF",
      fontSize: 14,
      rotation: 0,
      useTemplate: false,
      templateId: undefined,
    })
  }

  // Funcție pentru a selecta un template
  const selectTemplate = (templateId: string) => {
    setSettings((prev) => ({
      ...prev,
      useTemplate: true,
      templateId,
    }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Panoul stâng - Previzualizare imagine */}
      <div className="lg:col-span-2">
        <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Ajustare număr înmatriculare</CardTitle>
            <CardDescription>
              Poziționează, redimensionează și personalizează dreptunghiul care va acoperi numărul de înmatriculare
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div
              ref={containerRef}
              className="relative w-full overflow-hidden rounded-lg border border-slate-200"
              style={{ height: "500px" }}
            >
              {/* Imaginea originală */}
              <img
                ref={imageRef}
                src={imageUrl || "/placeholder.svg"}
                alt="Imagine originală"
                className="absolute inset-0 w-full h-full object-contain"
              />

              {/* Dreptunghiul pentru numărul de înmatriculare */}
              {!settings.useTemplate ? (
                <motion.div
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={() => setIsDragging(false)}
                  onDrag={handleDrag}
                  className="absolute cursor-move"
                  style={{
                    left: `${settings.position.x}%`,
                    top: `${settings.position.y}%`,
                    width: `${settings.size.width}%`,
                    height: `${settings.size.height}%`,
                    backgroundColor: settings.color,
                    opacity: settings.opacity,
                    transform: `rotate(${settings.rotation}deg)`,
                    transformOrigin: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: isDragging ? "2px dashed white" : "none",
                  }}
                >
                  {/* Text personalizat */}
                  {settings.text && (
                    <span
                      style={{
                        color: settings.textColor,
                        fontSize: `${settings.fontSize}px`,
                        fontWeight: "bold",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "90%",
                      }}
                    >
                      {settings.text}
                    </span>
                  )}

                  {/* Mâner pentru redimensionare */}
                  <motion.div
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    onDragStart={() => setIsResizing(true)}
                    onDragEnd={() => setIsResizing(false)}
                    onDrag={handleResize}
                    className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-slate-300 rounded-full cursor-se-resize"
                    style={{
                      transform: "translate(50%, 50%)",
                      display: isDragging || isResizing ? "block" : "none",
                    }}
                  />
                </motion.div>
              ) : (
                // Template personalizat
                settings.templateId && (
                  <motion.div
                    drag
                    dragMomentum={false}
                    dragElastic={0}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={() => setIsDragging(false)}
                    onDrag={handleDrag}
                    className="absolute cursor-move"
                    style={{
                      left: `${settings.position.x}%`,
                      top: `${settings.position.y}%`,
                      width: `${settings.size.width}%`,
                      transform: `rotate(${settings.rotation}deg)`,
                      transformOrigin: "center",
                      border: isDragging ? "2px dashed white" : "none",
                    }}
                  >
                    <img
                      src={templates.find((t) => t.id === settings.templateId)?.imageUrl || ""}
                      alt="Template"
                      className="w-full h-auto"
                      style={{ opacity: settings.opacity }}
                    />

                    {/* Mâner pentru redimensionare */}
                    <motion.div
                      drag
                      dragMomentum={false}
                      dragElastic={0}
                      onDragStart={() => setIsResizing(true)}
                      onDragEnd={() => setIsResizing(false)}
                      onDrag={handleResize}
                      className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-slate-300 rounded-full cursor-se-resize"
                      style={{
                        transform: "translate(50%, 50%)",
                        display: isDragging || isResizing ? "block" : "none",
                      }}
                    />
                  </motion.div>
                )
              )}
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Anulează
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Resetează
                </Button>

                <Button onClick={handleSave}>
                  <Check className="mr-2 h-4 w-4" />
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
            <CardTitle>Setări personalizare</CardTitle>
            <CardDescription>Ajustează proprietățile dreptunghiului pentru numărul de înmatriculare</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="position" className="text-xs">
                  <Move className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Poziție</span>
                </TabsTrigger>
                <TabsTrigger value="size" className="text-xs">
                  <Maximize className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Dimensiune</span>
                </TabsTrigger>
                <TabsTrigger value="style" className="text-xs">
                  <Palette className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Stil</span>
                </TabsTrigger>
                <TabsTrigger value="text" className="text-xs">
                  <Type className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Text</span>
                </TabsTrigger>
              </TabsList>

              {/* Tab pentru poziție */}
              <TabsContent value="position" className="space-y-4">
                <div className="space-y-2">
                  <Label>Poziție X ({Math.round(settings.position.x)}%)</Label>
                  <Slider
                    value={[settings.position.x]}
                    min={0}
                    max={100 - settings.size.width}
                    step={1}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        position: { ...prev.position, x: value[0] },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Poziție Y ({Math.round(settings.position.y)}%)</Label>
                  <Slider
                    value={[settings.position.y]}
                    min={0}
                    max={100 - settings.size.height}
                    step={1}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        position: { ...prev.position, y: value[0] },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rotație ({settings.rotation}°)</Label>
                  <Slider
                    value={[settings.rotation]}
                    min={-45}
                    max={45}
                    step={1}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        rotation: value[0],
                      }))
                    }
                  />
                </div>
              </TabsContent>

              {/* Tab pentru dimensiune */}
              <TabsContent value="size" className="space-y-4">
                <div className="space-y-2">
                  <Label>Lățime ({Math.round(settings.size.width)}%)</Label>
                  <Slider
                    value={[settings.size.width]}
                    min={5}
                    max={90}
                    step={1}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        size: { ...prev.size, width: value[0] },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Înălțime ({Math.round(settings.size.height)}%)</Label>
                  <Slider
                    value={[settings.size.height]}
                    min={2}
                    max={50}
                    step={1}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        size: { ...prev.size, height: value[0] },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Raport de aspect</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          size: { width: 30, height: 8 },
                        }))
                      }
                    >
                      Standard
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          size: { width: 20, height: 20 },
                        }))
                      }
                    >
                      Pătrat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          size: { width: 40, height: 10 },
                        }))
                      }
                    >
                      Lat
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Tab pentru stil */}
              <TabsContent value="style" className="space-y-4">
                <div className="space-y-2">
                  <Label>Culoare</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: settings.color }} />
                          {settings.color}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Selectează culoarea</h4>
                            <p className="text-sm text-muted-foreground">Alege culoarea dreptunghiului</p>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              "#000000",
                              "#FFFFFF",
                              "#FF0000",
                              "#00FF00",
                              "#0000FF",
                              "#FFFF00",
                              "#FF00FF",
                              "#00FFFF",
                              "#FF9900",
                              "#9900FF",
                            ].map((color) => (
                              <div
                                key={color}
                                className="w-8 h-8 rounded-full cursor-pointer border border-slate-200"
                                style={{ backgroundColor: color }}
                                onClick={() => setSettings((prev) => ({ ...prev, color }))}
                              />
                            ))}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="custom-color">Culoare personalizată</Label>
                            <Input
                              id="custom-color"
                              type="color"
                              value={settings.color}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  color: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Opacitate ({Math.round(settings.opacity * 100)}%)</Label>
                  <Slider
                    value={[settings.opacity * 100]}
                    min={10}
                    max={100}
                    step={1}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        opacity: value[0] / 100,
                      }))
                    }
                  />
                </div>

                {isPremium && (
                  <div className="space-y-2 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="use-template">Folosește template</Label>
                      <Switch
                        id="use-template"
                        checked={settings.useTemplate}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            useTemplate: checked,
                          }))
                        }
                      />
                    </div>

                    {settings.useTemplate && (
                      <div className="space-y-2 mt-4">
                        <Label>Template-uri disponibile</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {templates.map((template) => (
                            <div
                              key={template.id}
                              className={`border rounded-md p-2 cursor-pointer transition-all ${
                                settings.templateId === template.id
                                  ? "border-primary bg-primary/10"
                                  : "border-slate-200"
                              }`}
                              onClick={() => selectTemplate(template.id)}
                            >
                              <img
                                src={template.imageUrl || "/placeholder.svg"}
                                alt={template.name}
                                className="w-full h-auto"
                              />
                              <p className="text-xs text-center mt-1">{template.name}</p>
                            </div>
                          ))}

                          <div className="border border-dashed border-slate-200 rounded-md p-2 flex flex-col items-center justify-center h-[50px]">
                            <Button variant="ghost" size="sm" className="h-8 text-xs">
                              <Upload className="h-3 w-3 mr-1" />
                              Încarcă
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Tab pentru text */}
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-text">Text personalizat</Label>
                  <Input
                    id="custom-text"
                    value={settings.text}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        text: e.target.value,
                      }))
                    }
                    placeholder="Introdu textul dorit"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Culoare text</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: settings.textColor }} />
                          {settings.textColor}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Selectează culoarea textului</h4>
                            <p className="text-sm text-muted-foreground">Alege culoarea pentru textul personalizat</p>
                          </div>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              "#FFFFFF",
                              "#000000",
                              "#FF0000",
                              "#00FF00",
                              "#0000FF",
                              "#FFFF00",
                              "#FF00FF",
                              "#00FFFF",
                              "#FF9900",
                              "#9900FF",
                            ].map((color) => (
                              <div
                                key={color}
                                className="w-8 h-8 rounded-full cursor-pointer border border-slate-200"
                                style={{ backgroundColor: color }}
                                onClick={() => setSettings((prev) => ({ ...prev, textColor: color }))}
                              />
                            ))}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="custom-text-color">Culoare personalizată</Label>
                            <Input
                              id="custom-text-color"
                              type="color"
                              value={settings.textColor}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  textColor: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dimensiune font ({settings.fontSize}px)</Label>
                  <Slider
                    value={[settings.fontSize]}
                    min={8}
                    max={36}
                    step={1}
                    onValueChange={(value) =>
                      setSettings((prev) => ({
                        ...prev,
                        fontSize: value[0],
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preseturi text</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          text: "BRAND",
                          textColor: "#FFFFFF",
                          fontSize: 18,
                        }))
                      }
                    >
                      Brand
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          text: "CONFIDENȚIAL",
                          textColor: "#FF0000",
                          fontSize: 16,
                        }))
                      }
                    >
                      Confidențial
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          text: "VELARO",
                          textColor: "#FFFFFF",
                          fontSize: 20,
                        }))
                      }
                    >
                      Velaro
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          text: "AUTO",
                          textColor: "#FFFF00",
                          fontSize: 18,
                        }))
                      }
                    >
                      Auto
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Resetează
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Salvează
            </Button>
          </CardFooter>
        </Card>

        {isPremium && (
          <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm mt-4">
            <CardHeader>
              <CardTitle>Salvează ca template</CardTitle>
              <CardDescription>Salvează setările curente ca template pentru utilizare ulterioară</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nume template</Label>
                  <Input id="template-name" placeholder="Ex: Brand personal" />
                </div>

                <Button className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Salvează ca template
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

