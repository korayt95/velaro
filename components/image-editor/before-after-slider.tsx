"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  sliderPosition: number
  onSliderChange: (value: number) => void
  className?: string
  height?: string
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  sliderPosition,
  onSliderChange,
  className = "",
  height = "400px",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const beforeImageRef = useRef<HTMLImageElement>(null)
  const sliderHandleRef = useRef<HTMLDivElement>(null)

  // Efect pentru actualizarea clip-path-ului imaginii "înainte"
  useEffect(() => {
    if (beforeImageRef.current) {
      beforeImageRef.current.style.clipPath = `inset(0 ${100 - sliderPosition}% 0 0)`
    }
  }, [sliderPosition])

  // Funcție pentru drag manual al slider-ului
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()

    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = container.getBoundingClientRect()
      const newPosition = Math.max(0, Math.min(100, ((e.clientX - containerRect.left) / containerRect.width) * 100))
      onSliderChange(newPosition)
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Funcție pentru touch pe dispozitive mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()

    const container = containerRef.current
    if (!container) return

    const handleTouchMove = (e: TouchEvent) => {
      const containerRect = container.getBoundingClientRect()
      const touch = e.touches[0]
      const newPosition = Math.max(0, Math.min(100, ((touch.clientX - containerRect.left) / containerRect.width) * 100))
      onSliderChange(newPosition)
    }

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }

    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg border border-slate-200 ${className}`}
      style={{ height }}
      ref={containerRef}
    >
      <div className="relative w-full h-full">
        {/* Imaginea "după" (în fundal) */}
        <img
          src={afterImage || "/placeholder.svg"}
          alt="După"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Imaginea "înainte" (în prim-plan, cu clip-path) */}
        <img
          ref={beforeImageRef}
          src={beforeImage || "/placeholder.svg"}
          alt="Înainte"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        />

        {/* Linia verticală a slider-ului */}
        <div
          className="absolute inset-y-0 bg-white w-1 cursor-ew-resize shadow-md"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Mânerul slider-ului */}
          <div
            ref={sliderHandleRef}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-ew-resize border-2 border-primary"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <ChevronLeft className="h-4 w-4 text-primary" />
            <ChevronRight className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Etichete */}
        <div className="absolute top-4 left-4 bg-black/70 text-white text-sm py-1 px-3 rounded-full shadow-md">
          Înainte
        </div>
        <div className="absolute top-4 right-4 bg-primary text-white text-sm py-1 px-3 rounded-full shadow-md">
          După
        </div>
      </div>
    </div>
  )
}

