"use client"

import type React from "react"

import { useRef } from "react"
import { motion } from "framer-motion"
import { ImagePlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UploadAreaProps {
  isDragging: boolean
  imagesCount: number
  maxImages: number
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (files: FileList | null) => void
  className?: string
}

export function UploadArea({
  isDragging,
  imagesCount,
  maxImages,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  className = "",
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className={`border-2 ${isDragging ? "border-primary bg-primary/5" : "border-dashed border-slate-300"} rounded-lg p-8 text-center transition-all ${className}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        className="flex flex-col items-center justify-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4"
        >
          <ImagePlus className="h-10 w-10 text-primary" />
        </motion.div>
        <p className="text-slate-700 font-medium mb-2">Trage imagini aici sau click pentru a încărca</p>
        <p className="text-sm text-slate-500">Suportă JPG, PNG (max 5MB)</p>
        <Badge className="mt-3" variant="outline">
          {imagesCount}/{maxImages} imagini
        </Badge>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg, image/png"
        onChange={(e) => onFileSelect(e.target.files)}
        multiple
      />
    </div>
  )
}

