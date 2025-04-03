"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

// Adăugăm importul pentru funcțiile de gestionare a API key-ului
import { saveApiKey, isApiKeyConfigured, clearApiKey } from "@/lib/api-key-storage"

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void
}

export function ApiKeySetup({ onApiKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const checkApiKey = async () => {
      const configured = await isApiKeyConfigured()
      setIsConfigured(configured)
    }

    checkApiKey()
  }, [])

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError("API key-ul nu poate fi gol")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Facem un apel de test pentru a verifica validitatea API key-ului
      const response = await fetch("/api/verify-plate-recognizer-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "API key invalid")
      }

      // Salvăm API key-ul
      saveApiKey(apiKey)
      onApiKeySet(apiKey)

      toast({
        title: "API key configurat cu succes",
        description: "Acum poți folosi detecția numerelor de înmatriculare.",
      })
    } catch (error) {
      console.error("Error verifying API key:", error)
      setError("API key-ul nu este valid sau a apărut o eroare la verificare")

      toast({
        title: "Eroare",
        description: "Nu am putut verifica API key-ul. Verifică formatul și încearcă din nou.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurare API Key</CardTitle>
        <CardDescription>
          Pentru a folosi detecția numerelor de înmatriculare, te rog să configurezi API key-ul.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!isConfigured ? (
          <>
            <div className="grid gap-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <Button onClick={handleSaveApiKey} disabled={isLoading}>
              {isLoading ? "Se salvează..." : "Salvează"}
            </Button>
          </>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">API key-ul este configurat.</p>
            {isConfigured && (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearApiKey()
                    onApiKeySet("")
                  }}
                >
                  Șterge API Key
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

