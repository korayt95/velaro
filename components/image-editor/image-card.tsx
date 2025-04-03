"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Star, Maximize2, Edit, Bookmark, BookmarkCheck, Trash2, Info, Download, Wand2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageCardProps {
  image: {
    id: string
    dataUrl: string
    enhancedUrl: string
    analysis: any
    isAnalyzing: boolean
    isEnhancing: boolean
    isFavorite: boolean
    file?: File | null
  }
  index: number
  devicePreview: "desktop" | "mobile" | "tablet"
  onEnhance: (id: string) => void
  onDownload: (url: string, index: number) => void
  onToggleFavorite: (id: string) => void
  onRemove: (id: string) => void
  onViewDetails: (index: number) => void
  onPreview: (url: string) => void
}

export function ImageCard({
  image,
  index,
  devicePreview,
  onEnhance,
  onDownload,
  onToggleFavorite,
  onRemove,
  onViewDetails,
  onPreview,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className="overflow-hidden shadow-md hover:shadow-lg transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div
          className={cn(
            "aspect-video relative overflow-hidden",
            devicePreview === "mobile" && "max-w-[320px] mx-auto",
            devicePreview === "tablet" && "max-w-[500px] mx-auto",
          )}
        >
          <img
            src={image.enhancedUrl || image.dataUrl || "/placeholder.svg"}
            alt={`Imagine ${index + 1}`}
            className="w-full h-full object-cover"
            onClick={() => onPreview(image.enhancedUrl || image.dataUrl)}
          />

          {/* Overlay pentru acțiuni rapide */}
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="default"
              size="sm"
              className="bg-white/90 text-slate-800 hover:bg-white"
              onClick={() => onPreview(image.enhancedUrl || image.dataUrl)}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Mărește
            </Button>

            <Button
              variant="default"
              size="sm"
              className="bg-white/90 text-slate-800 hover:bg-white"
              onClick={() => onViewDetails(index)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editează
            </Button>
          </motion.div>

          {/* Indicator de scor */}
          {image.analysis && (
            <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md">
              <div className="flex items-center">
                <Star
                  className={`h-4 w-4 ${
                    image.analysis.score >= 4
                      ? "text-yellow-400 fill-yellow-400"
                      : image.analysis.score >= 3
                        ? "text-yellow-500"
                        : "text-slate-400"
                  }`}
                />
                <span className="ml-1 text-sm font-medium">{image.analysis.score}/5</span>
              </div>
            </div>
          )}

          {/* Indicator de procesare */}
          {image.isAnalyzing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <LoadingSpinner size="md" text="Analizare..." />
            </div>
          )}

          {image.isEnhancing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <LoadingSpinner size="md" text="Îmbunătățire..." />
            </div>
          )}

          {/* Badge pentru imagine îmbunătățită */}
          {image.enhancedUrl && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs py-1 px-2 rounded-full shadow-md">
              Îmbunătățită
            </div>
          )}

          {/* Badge pentru favorite */}
          {image.isFavorite && (
            <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs py-1 px-2 rounded-full shadow-md flex items-center">
              <Bookmark className="h-3 w-3 mr-1 fill-white" />
              Favorit
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Imagine {index + 1}</h3>
          <Badge variant="outline" className="text-xs">
            {image.file?.name?.split(".").pop() || "JPG"}
          </Badge>
        </div>

        {image.analysis && <div className="text-sm text-slate-600 line-clamp-2 mb-3">{image.analysis.analysis}</div>}

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!image.enhancedUrl && !image.isEnhancing) {
                  onEnhance(image.id)
                } else if (image.enhancedUrl) {
                  onDownload(image.enhancedUrl, index)
                }
              }}
              disabled={image.isEnhancing}
              className="h-8"
            >
              {image.isEnhancing ? (
                <LoadingSpinner size="sm" className="mr-1" />
              ) : image.enhancedUrl ? (
                <Download className="h-3 w-3 mr-1" />
              ) : (
                <Wand2 className="h-3 w-3 mr-1" />
              )}
              {image.enhancedUrl ? "Descarcă" : "Îmbunătățește"}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={image.isFavorite ? "default" : "outline"}
                    size="icon"
                    onClick={() => onToggleFavorite(image.id)}
                    className="h-8 w-8"
                  >
                    {image.isFavorite ? (
                      <BookmarkCheck className="h-3 w-3 text-white" />
                    ) : (
                      <Bookmark className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{image.isFavorite ? "Elimină de la favorite" : "Adaugă la favorite"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => onRemove(image.id)} className="h-8 w-8">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Șterge imaginea</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => onViewDetails(index)} className="h-8 w-8">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Vezi detalii</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}

