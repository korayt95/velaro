"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      setHasError(true)
      setError(error.error)
      console.error("Error caught by error boundary:", error)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Ceva nu a funcționat corect</h2>
        <p className="text-slate-600 mb-6">
          Ne pare rău pentru inconveniență. Vă rugăm să încercați din nou sau contactați suportul dacă problema
          persistă.
        </p>
        <Button onClick={() => window.location.reload()}>Reîncarcă pagina</Button>
      </div>
    )
  }

  return <>{children}</>
}

