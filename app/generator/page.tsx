"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Copy, ArrowLeft, Car, AlertCircle, CheckCircle2 } from "lucide-react"
import { generateCarListing } from "@/lib/generate-listing"
import { saveGeneratedListing, getUserGenerationCount } from "@/lib/firestore-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { VinSearch } from "@/components/vin-search"
import { exportToPdf } from "@/lib/pdf-export"

export default function GeneratorPage() {
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    fuel: "benzina",
    transmission: "manuala",
    traction: "fata",
    color: "",
    damaged: "nu",
    price: "",
    condition: "folosit",
    additionalInfo: "",
    tone: "profesional",
  })

  const [generatedListing, setGeneratedListing] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationsLeft, setGenerationsLeft] = useState(3)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Redirecționăm utilizatorii nelogați
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=generator")
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a accesa generatorul.",
        variant: "destructive",
      })
    }
  }, [user, loading, router, toast])

  // Verificăm numărul de generări disponibile
  useEffect(() => {
    async function checkGenerationCount() {
      if (user) {
        try {
          const count = await getUserGenerationCount(user.uid)
          setGenerationsLeft(Math.max(0, 3 - count))
        } catch (error) {
          console.error("Error checking generation count:", error)
        }
      } else {
        setGenerationsLeft(3)
      }
    }

    if (user) {
      checkGenerationCount()
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleVehicleDataReceived = (data) => {
    // Actualizăm formularul cu datele primite de la API-ul VIN
    setFormData((prev) => ({
      ...prev,
      make: data.make || prev.make,
      model: data.model || prev.model,
      year: data.year || prev.year,
      fuel:
        data.engine?.type?.toLowerCase() === "benzină"
          ? "benzina"
          : data.engine?.type?.toLowerCase() === "diesel"
            ? "diesel"
            : data.engine?.type?.toLowerCase() === "hibrid"
              ? "hibrid"
              : data.engine?.type?.toLowerCase() === "electric"
                ? "electric"
                : prev.fuel,
      transmission:
        data.transmission?.toLowerCase() === "manuală"
          ? "manuala"
          : data.transmission?.toLowerCase() === "automată"
            ? "automata"
            : prev.transmission,
      color: data.body?.color || prev.color,
      // Adăugăm informații suplimentare din datele VIN
      additionalInfo: data.features?.length
        ? `${prev.additionalInfo ? prev.additionalInfo + ", " : ""}${data.features.join(", ")}`
        : prev.additionalInfo,
    }))

    // Schimbăm tab-ul la "manual" pentru a arăta formularul completat
    setActiveTab("manual")

    toast({
      title: "Formular completat",
      description: "Datele vehiculului au fost completate automat. Verifică și ajustează dacă este necesar.",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să te autentifici pentru a genera anunțuri.",
        variant: "destructive",
      })
      router.push("/login?redirect=generator")
      return
    }

    if (generationsLeft <= 0) {
      toast({
        title: "Limită atinsă",
        description: "Ai folosit toate generările gratuite. Abonează-te pentru mai multe.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const listing = await generateCarListing(formData)
      setGeneratedListing(listing)

      // Salvăm automat anunțul pentru utilizatorii logați
      if (user) {
        try {
          await saveGeneratedListing(user.uid, formData, listing)
          setGenerationsLeft((prev) => prev - 1)
          toast({
            title: "Anunț generat și salvat",
            description: "Anunțul a fost generat cu succes și salvat în istoricul tău.",
          })
        } catch (error) {
          console.error("Error saving listing:", error)
          toast({
            title: "Anunț generat",
            description: "Anunțul a fost generat, dar nu a putut fi salvat. Încearcă să-l salvezi manual.",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut genera anunțul. Încearcă din nou.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedListing)
    setCopied(true)
    toast({
      title: "Copiat!",
      description: "Anunțul a fost copiat în clipboard.",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportToPdf = async () => {
    setIsExporting(true)
    try {
      await exportToPdf({
        content: generatedListing,
        fileName: `anunt-${formData.make}-${formData.model}-${Date.now()}.pdf`,
        watermark: !user || generationsLeft <= 0, // Adăugăm watermark pentru utilizatorii care nu plătesc
      })
      toast({
        title: "PDF generat",
        description: "Anunțul a fost exportat în format PDF.",
      })
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast({
        title: "Eroare",
        description: "Nu am putut exporta anunțul în format PDF. Încearcă din nou.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-slate-600 hover:text-slate-900 mb-2 group transition-all">
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow mr-2 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Înapoi la pagina principală</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Generatorul de anunțuri auto
          </h1>
          <p className="text-center text-slate-600 mb-6">
            Completează detaliile mașinii tale și generează un anunț profesional în câteva secunde
          </p>

          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-slate-200 flex items-center">
              <span className="text-slate-600 mr-2">Generări gratuite rămase:</span>
              <Badge variant={generationsLeft > 0 ? "default" : "destructive"} className="text-sm">
                {generationsLeft}
              </Badge>
            </div>
          </div>

          {generationsLeft === 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Limită atinsă</AlertTitle>
                <AlertDescription>
                  Ai folosit toate generările gratuite.{" "}
                  <Link href="/pricing" className="font-medium underline">
                    Abonează-te
                  </Link>{" "}
                  pentru generări nelimitate.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="vin">
                  <Car className="h-4 w-4 mr-2" />
                  Caută după VIN
                </TabsTrigger>
                <TabsTrigger value="manual">
                  <span className="h-4 w-4 mr-2">📝</span>
                  Completare manuală
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vin">
                <VinSearch onVehicleDataReceived={handleVehicleDataReceived} />
              </TabsContent>

              <TabsContent value="manual">
                <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
                  <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-medium">Detalii mașină</h2>
                    <p className="text-sm text-slate-500">Completează informațiile despre mașina ta</p>
                  </div>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="make" className="text-sm font-medium">
                              Marca
                            </Label>
                            <Input
                              id="make"
                              name="make"
                              placeholder="Ex: Dacia, Volkswagen"
                              value={formData.make}
                              onChange={handleInputChange}
                              required
                              className="border-slate-300 focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="model" className="text-sm font-medium">
                              Model
                            </Label>
                            <Input
                              id="model"
                              name="model"
                              placeholder="Ex: Logan, Golf"
                              value={formData.model}
                              onChange={handleInputChange}
                              required
                              className="border-slate-300 focus:border-primary focus:ring-primary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="year" className="text-sm font-medium">
                              An fabricație
                            </Label>
                            <Input
                              id="year"
                              name="year"
                              placeholder="Ex: 2018"
                              value={formData.year}
                              onChange={handleInputChange}
                              required
                              className="border-slate-300 focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="mileage" className="text-sm font-medium">
                              Kilometraj
                            </Label>
                            <Input
                              id="mileage"
                              name="mileage"
                              placeholder="Ex: 120000"
                              value={formData.mileage}
                              onChange={handleInputChange}
                              required
                              className="border-slate-300 focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="color" className="text-sm font-medium">
                              Culoare
                            </Label>
                            <Input
                              id="color"
                              name="color"
                              placeholder="Ex: Negru, Albastru metalizat"
                              value={formData.color}
                              onChange={handleInputChange}
                              className="border-slate-300 focus:border-primary focus:ring-primary"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fuel" className="text-sm font-medium">
                              Combustibil
                            </Label>
                            <Select value={formData.fuel} onValueChange={(value) => handleSelectChange("fuel", value)}>
                              <SelectTrigger className="border-slate-300 focus:ring-primary relative z-10">
                                <SelectValue placeholder="Alege combustibilul" />
                              </SelectTrigger>
                              <SelectContent className="overflow-y-auto max-h-[200px]">
                                <SelectItem value="benzina">Benzină</SelectItem>
                                <SelectItem value="diesel">Diesel</SelectItem>
                                <SelectItem value="hibrid">Hibrid</SelectItem>
                                <SelectItem value="electric">Electric</SelectItem>
                                <SelectItem value="gpl">GPL</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="transmission" className="text-sm font-medium">
                              Transmisie
                            </Label>
                            <Select
                              value={formData.transmission}
                              onValueChange={(value) => handleSelectChange("transmission", value)}
                            >
                              <SelectTrigger className="border-slate-300 focus:ring-primary relative z-10">
                                <SelectValue placeholder="Alege transmisia" />
                              </SelectTrigger>
                              <SelectContent className="overflow-y-auto max-h-[200px]">
                                <SelectItem value="manuala">Manuală</SelectItem>
                                <SelectItem value="automata">Automată</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="traction" className="text-sm font-medium">
                              Tracțiune
                            </Label>
                            <Select
                              value={formData.traction}
                              onValueChange={(value) => handleSelectChange("traction", value)}
                            >
                              <SelectTrigger className="border-slate-300 focus:ring-primary relative z-10">
                                <SelectValue placeholder="Alege tracțiunea" />
                              </SelectTrigger>
                              <SelectContent className="overflow-y-auto max-h-[200px]">
                                <SelectItem value="fata">Față</SelectItem>
                                <SelectItem value="spate">Spate</SelectItem>
                                <SelectItem value="integrala">Integrală</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-medium">
                              Preț (EUR)
                            </Label>
                            <Input
                              id="price"
                              name="price"
                              placeholder="Ex: 8500"
                              value={formData.price}
                              onChange={handleInputChange}
                              required
                              className="border-slate-300 focus:border-primary focus:ring-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="condition" className="text-sm font-medium">
                              Stare
                            </Label>
                            <Select
                              value={formData.condition}
                              onValueChange={(value) => handleSelectChange("condition", value)}
                            >
                              <SelectTrigger className="border-slate-300 focus:ring-primary relative z-10">
                                <SelectValue placeholder="Alege starea" />
                              </SelectTrigger>
                              <SelectContent className="overflow-y-auto max-h-[200px]">
                                <SelectItem value="nou">Nou</SelectItem>
                                <SelectItem value="folosit">Folosit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="damaged" className="text-sm font-medium">
                              Avariată
                            </Label>
                            <Select
                              value={formData.damaged}
                              onValueChange={(value) => handleSelectChange("damaged", value)}
                            >
                              <SelectTrigger className="border-slate-300 focus:ring-primary relative z-10">
                                <SelectValue placeholder="Este avariată?" />
                              </SelectTrigger>
                              <SelectContent className="overflow-y-auto max-h-[200px]">
                                <SelectItem value="nu">Nu</SelectItem>
                                <SelectItem value="da">Da</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tone" className="text-sm font-medium">
                            Tonul anunțului
                          </Label>
                          <Select value={formData.tone} onValueChange={(value) => handleSelectChange("tone", value)}>
                            <SelectTrigger className="border-slate-300 focus:ring-primary relative z-10">
                              <SelectValue placeholder="Alege tonul anunțului" />
                            </SelectTrigger>
                            <SelectContent className="overflow-y-auto max-h-[200px]">
                              <SelectItem value="profesional">Profesional</SelectItem>
                              <SelectItem value="relaxat">Relaxat și prietenos</SelectItem>
                              <SelectItem value="tehnic">Tehnic și detaliat</SelectItem>
                              <SelectItem value="persuasiv">Persuasiv și convingător</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="additionalInfo" className="text-sm font-medium">
                            Informații suplimentare
                          </Label>
                          <Textarea
                            id="additionalInfo"
                            name="additionalInfo"
                            placeholder="Dotări, istoric, defecte, etc. Adaugă cuvinte cheie separate prin virgulă pentru a personaliza anunțul."
                            value={formData.additionalInfo}
                            onChange={handleInputChange}
                            rows={4}
                            className="border-slate-300 focus:border-primary focus:ring-primary"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Sfat: Adaugă cuvinte cheie relevante separate prin virgulă (ex: "carte service, un singur
                            proprietar, faruri LED, navigație")
                          </p>
                        </div>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white py-6 shadow-md"
                            disabled={isGenerating || generationsLeft <= 0}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Se generează...
                              </>
                            ) : (
                              <>
                                Generează anunțul
                                <Car className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-medium">Anunț generat</h2>
              <p className="text-sm text-slate-500">Previzualizează și copiază anunțul tău</p>
            </div>
            <CardContent className="pt-6">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="mb-4 w-full grid grid-cols-2">
                  <TabsTrigger value="preview" className="text-sm">
                    Previzualizare
                  </TabsTrigger>
                  <TabsTrigger value="html" className="text-sm">
                    HTML
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="min-h-[400px]">
                  {generatedListing ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      <div className="prose max-w-none border rounded-lg p-6 bg-white shadow-sm">
                        <div dangerouslySetInnerHTML={{ __html: generatedListing }} />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        <Button variant="outline" onClick={copyToClipboard} className="flex-1 py-5">
                          {copied ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                              Copiat!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copiază
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleExportToPdf}
                          className="flex-1 py-5"
                          disabled={isExporting}
                        >
                          {isExporting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Se exportă...
                            </>
                          ) : (
                            <>
                              <svg
                                className="mr-2 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <path d="M9 15v-4"></path>
                                <path d="M12 15v-6"></path>
                                <path d="M15 15v-2"></path>
                              </svg>
                              Exportă PDF
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center text-slate-500 bg-white/50 border border-dashed border-slate-300 rounded-lg p-6">
                      <Car className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="mb-2">Completează formularul și generează un anunț pentru a-l vedea aici.</p>
                      <p className="text-sm text-slate-400">Anunțul va fi formatat profesional și gata de utilizare.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="html" className="min-h-[400px]">
                  {generatedListing ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-4"
                    >
                      <pre className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-auto text-sm font-mono h-[400px]">
                        {generatedListing}
                      </pre>

                      <div className="flex space-x-2 mt-6">
                        <Button variant="outline" onClick={copyToClipboard} className="w-full py-5">
                          {copied ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                              Copiat!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copiază HTML
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center text-slate-500 bg-white/50 border border-dashed border-slate-300 rounded-lg p-6">
                      <Car className="h-12 w-12 text-slate-300 mb-4" />
                      <p className="mb-2">
                        Completează formularul și generează un anunț pentru a vedea codul HTML aici.
                      </p>
                      <p className="text-sm text-slate-400">
                        Codul HTML poate fi copiat și folosit direct pe platformele de anunțuri.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

