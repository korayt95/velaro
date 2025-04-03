"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, Search, Car, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface VinSearchProps {
  onVehicleDataReceived: (data: any) => void
}

export function VinSearch({ onVehicleDataReceived }: VinSearchProps) {
  const [vin, setVin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSearch = async () => {
    // Validare VIN (17 caractere alfanumerice, fără I, O, Q)
    if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(vin)) {
      setError("VIN-ul trebuie să conțină exact 17 caractere alfanumerice (fără I, O, Q).")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch(`/api/vin?vin=${vin}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "A apărut o eroare la obținerea datelor vehiculului.")
      }

      // Procesăm datele primite
      onVehicleDataReceived(data)
      setSuccess(true)
      toast({
        title: "Date obținute cu succes!",
        description: `Am găsit informații pentru ${data.make} ${data.model} (${data.year}).`,
      })
    } catch (error) {
      console.error("Error fetching VIN data:", error)
      setError(error.message || "A apărut o eroare la obținerea datelor vehiculului.")
      toast({
        title: "Eroare",
        description: "Nu am putut obține informații pentru acest VIN.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Car className="h-5 w-5 mr-2 text-primary" />
          Caută după VIN
        </CardTitle>
        <CardDescription>Introdu numărul VIN al mașinii pentru a obține automat toate detaliile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Eroare</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Succes!</AlertTitle>
            <AlertDescription className="text-green-700">
              Datele vehiculului au fost obținute cu succes și completate în formular.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="vin">Număr VIN (Vehicle Identification Number)</Label>
          <div className="flex space-x-2">
            <Input
              id="vin"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="Ex: WVWZZZ1KZAM123456"
              className="flex-1"
              maxLength={17}
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleSearch} disabled={isLoading || vin.length !== 17}>
                {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Caută
              </Button>
            </motion.div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Numărul VIN are 17 caractere și poate fi găsit pe cartea de identitate a mașinii, în colțul parbrizului sau
            pe stâlpul ușii.
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 border-t border-slate-100 px-6 py-3">
        <div className="text-xs text-slate-500 flex items-center">
          <InfoIcon className="h-3 w-3 mr-1" />
          Datele obținute vor completa automat formularul pentru generarea anunțului.
        </div>
      </CardFooter>
    </Card>
  )
}

function InfoIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

