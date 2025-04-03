"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { getUserListings, type ListingRecord, deleteUserListing } from "@/lib/firestore-service"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Clock, Copy, Trash2, AlertCircle, Car, Search, Download } from "lucide-react"
import { format } from "date-fns"
import { ro } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { exportToPdf } from "@/lib/pdf-export"

export default function HistoryPage() {
  const [listings, setListings] = useState<ListingRecord[]>([])
  const [filteredListings, setFilteredListings] = useState<ListingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [listingToDelete, setListingToDelete] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { user, loading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=history")
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a accesa istoricul.",
        variant: "destructive",
      })
    }
  }, [user, loading, router, toast])

  useEffect(() => {
    async function fetchListings() {
      if (user) {
        try {
          setIsLoading(true)
          const userListings = await getUserListings(user.uid)
          setListings(userListings)
          setFilteredListings(userListings)
        } catch (error) {
          toast({
            title: "Eroare",
            description: "Nu am putut încărca istoricul anunțurilor.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (user) {
      fetchListings()
    }
  }, [user, toast])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredListings(listings)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = listings.filter(
        (listing) =>
          listing.carData.make.toLowerCase().includes(lowercasedSearch) ||
          listing.carData.model.toLowerCase().includes(lowercasedSearch) ||
          listing.carData.year.toLowerCase().includes(lowercasedSearch),
      )
      setFilteredListings(filtered)
    }
  }, [searchTerm, listings])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiat!",
      description: "Anunțul a fost copiat în clipboard.",
    })
  }

  const handleExportToPdf = async (listing: ListingRecord) => {
    setIsExporting(true)
    try {
      await exportToPdf({
        content: listing.generatedListing,
        fileName: `anunt-${listing.carData.make}-${listing.carData.model}-${Date.now()}.pdf`,
        watermark: false, // Nu adăugăm watermark pentru utilizatorii logați
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

  const handleDeleteListing = async () => {
    if (!listingToDelete) return

    setIsDeleting(true)
    try {
      await deleteUserListing(listingToDelete)
      setListings((prev) => prev.filter((listing) => listing.id !== listingToDelete))
      setFilteredListings((prev) => prev.filter((listing) => listing.id !== listingToDelete))
      toast({
        title: "Anunț șters",
        description: "Anunțul a fost șters cu succes.",
      })
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut șterge anunțul. Încearcă din nou.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setListingToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setListingToDelete(id)
    setShowDeleteDialog(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Se încarcă..." />
      </div>
    )
  }

  if (!user && !loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <Link
            href="/generator"
            className="flex items-center text-slate-600 hover:text-slate-900 group transition-all"
          >
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow mr-2 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Înapoi la generator</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Istoricul anunțurilor tale
          </h1>
          <p className="text-slate-600 max-w-2xl">
            Aici găsești toate anunțurile generate anterior. Poți să le vizualizezi, copiezi, exportezi în PDF sau
            ștergi.
          </p>
        </motion.div>

        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-auto flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Caută după marcă, model sau an..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">
              Total anunțuri: {listings.length}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <LoadingSpinner text="Se încarcă anunțurile..." />
          </div>
        ) : filteredListings.length === 0 ? (
          <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              {searchTerm ? (
                <>
                  <div className="bg-slate-100 p-3 rounded-full mb-4">
                    <Search className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-4">Nu am găsit niciun anunț care să corespundă căutării tale.</p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Resetează căutarea
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-slate-100 p-3 rounded-full mb-4">
                    <Car className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 mb-4">Nu ai generat încă niciun anunț.</p>
                  <Link href="/generator">
                    <Button>Generează primul anunț</Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Accordion type="multiple" className="space-y-4">
              <AnimatePresence>
                {filteredListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <AccordionItem value={listing.id || "default"} className="border-none">
                      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="bg-white pb-4 flex flex-row items-start justify-between">
                          <div>
                            <CardTitle className="text-xl flex items-center">
                              {listing.carData.make} {listing.carData.model} ({listing.carData.year})
                              {listing.carData.damaged === "da" && (
                                <Badge variant="destructive" className="ml-2 text-xs">
                                  Avariată
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(listing.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: ro })}
                              <Badge variant="outline" className="ml-3 text-xs">
                                ID: {listing.id?.substring(0, 9) || "N/A"}
                              </Badge>
                            </CardDescription>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(listing.generatedListing)}
                              className="h-8"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copiază
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportToPdf(listing)}
                              className="h-8"
                              disabled={isExporting}
                            >
                              {isExporting ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                              ) : (
                                <Download className="h-4 w-4 mr-2" />
                              )}
                              PDF
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => confirmDelete(listing.id || "")}
                              className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <AccordionTrigger className="px-6 py-2 hover:no-underline">
                          <span className="text-sm text-slate-500">Detalii anunț</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <CardContent className="pt-4">
                            <Tabs defaultValue="preview">
                              <TabsList className="mb-4">
                                <TabsTrigger value="preview">Previzualizare</TabsTrigger>
                                <TabsTrigger value="details">Detalii mașină</TabsTrigger>
                              </TabsList>

                              <TabsContent value="preview">
                                <div className="prose max-w-none">
                                  <div dangerouslySetInnerHTML={{ __html: listing.generatedListing }} />
                                </div>
                              </TabsContent>

                              <TabsContent value="details">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                  <DetailItem label="Marcă" value={listing.carData.make} />
                                  <DetailItem label="Model" value={listing.carData.model} />
                                  <DetailItem label="An fabricație" value={listing.carData.year} />
                                  <DetailItem label="Kilometraj" value={`${listing.carData.mileage} km`} />
                                  <DetailItem label="Combustibil" value={listing.carData.fuel} />
                                  <DetailItem label="Transmisie" value={listing.carData.transmission} />
                                  <DetailItem label="Preț" value={`${listing.carData.price} EUR`} />
                                  <DetailItem label="Stare" value={listing.carData.condition} />
                                  {listing.carData.color && (
                                    <DetailItem label="Culoare" value={listing.carData.color} />
                                  )}
                                  {listing.carData.traction && (
                                    <DetailItem label="Tracțiune" value={listing.carData.traction} />
                                  )}
                                  {listing.carData.damaged && (
                                    <DetailItem
                                      label="Avariată"
                                      value={listing.carData.damaged === "da" ? "Da" : "Nu"}
                                    />
                                  )}
                                </div>
                                {listing.carData.additionalInfo && (
                                  <div className="mt-4">
                                    <h4 className="font-medium mb-2">Informații suplimentare:</h4>
                                    <p className="text-slate-700">{listing.carData.additionalInfo}</p>
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Accordion>
          </div>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Confirmare ștergere
            </DialogTitle>
            <DialogDescription>
              Ești sigur că vrei să ștergi acest anunț? Această acțiune nu poate fi anulată.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Anulează
            </Button>
            <Button variant="destructive" onClick={handleDeleteListing} disabled={isDeleting} className="sm:ml-2">
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Se șterge...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Șterge anunțul
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

