"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  User,
  Key,
  Loader2,
  Car,
  Shield,
  AlertTriangle,
  Trash2,
  Mail,
  Clock,
  BarChart3,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getUserGenerationCount } from "@/lib/firestore-service"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ImageIcon } from "lucide-react"
import { SabloaneManager } from "./sabloane-manager"

export default function ProfilePage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [generationCount, setGenerationCount] = useState(0)
  const [activeTab, setActiveTab] = useState("account")
  // Adăugăm un buton pentru activarea accesului premium
  const [isPremium, setIsPremium] = useState(false)
  const { user, loading, resetPassword, deleteAccount } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=profile")
      toast({
        title: "Autentificare necesară",
        description: "Trebuie să fii autentificat pentru a accesa profilul.",
        variant: "destructive",
      })
    }
  }, [user, loading, router, toast])

  useEffect(() => {
    async function fetchGenerationCount() {
      if (user) {
        try {
          const count = await getUserGenerationCount(user.uid)
          setGenerationCount(count)
        } catch (error) {
          console.error("Error fetching generation count:", error)
        }
      }
    }

    if (user) {
      fetchGenerationCount()
    }
  }, [user])

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Eroare",
        description: "Parolele nu coincid.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Eroare",
        description: "Parola trebuie să aibă minim 6 caractere.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (user && user.email) {
        await resetPassword(user.email)
        toast({
          title: "Email trimis",
          description: "Verifică-ți emailul pentru instrucțiuni de resetare a parolei.",
        })
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut trimite emailul de resetare.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
      toast({
        title: "Cont șters",
        description: "Contul tău a fost șters cu succes.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Eroare",
        description: "Nu am putut șterge contul. Încearcă din nou.",
        variant: "destructive",
      })
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Adăugăm această funcție în componenta ProfilePage
  const activatePremium = () => {
    setIsPremium(true)
    toast({
      title: "Acces premium activat",
      description: "Acum ai acces la toate funcționalitățile premium.",
    })
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

  const creationDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Necunoscut"

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

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="bg-primary p-2 rounded-lg shadow-lg mr-3">
                <Car className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Profilul tău Velaro
              </h1>
            </div>
            <p className="text-slate-600 max-w-2xl">
              Gestionează informațiile contului tău și verifică utilizarea serviciului.
            </p>
          </motion.div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Cont
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Securitate
              </TabsTrigger>
              <TabsTrigger value="sabloane" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <ImageIcon className="h-4 w-4 mr-2" />
                Șabloane
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Informații cont
                    </CardTitle>
                    <CardDescription>Vizualizează informațiile contului tău</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/2 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input id="email" value={user.email || ""} disabled className="bg-slate-50 pl-10" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Data creării contului</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input value={creationDate} disabled className="bg-slate-50 pl-10" />
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-1/2 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">ID Utilizator</Label>
                          <Input value={user.uid} disabled className="bg-slate-50 font-mono text-xs" />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Metoda de autentificare</Label>
                          <div className="flex items-center bg-slate-50 p-2 rounded-md border border-slate-200">
                            {user.providerData[0]?.providerId === "google.com" ? (
                              <>
                                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2">
                                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                      fill="#4285F4"
                                    />
                                    <path
                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                      fill="#34A853"
                                    />
                                    <path
                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                      fill="#FBBC05"
                                    />
                                    <path
                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                      fill="#EA4335"
                                    />
                                    <path d="M1 1h22v22H1z" fill="none" />
                                  </svg>
                                </div>
                                <span>Google</span>
                              </>
                            ) : (
                              <>
                                <Mail className="h-5 w-5 text-slate-500 mr-2" />
                                <span>Email și parolă</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                      Utilizare serviciu
                    </CardTitle>
                    <CardDescription>Verifică utilizarea serviciului și abonamentul tău</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Anunțuri generate</Label>
                        <Badge variant={generationCount < 3 ? "outline" : "destructive"}>
                          {generationCount} din 3 gratuite
                        </Badge>
                      </div>
                      <Progress value={(generationCount / 3) * 100} className="h-2" />
                    </div>

                    {/* Adăugăm acest buton în secțiunea de utilizare serviciu */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className="bg-white">
                          Plan curent
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{isPremium ? "Premium" : "Gratuit"}</h3>
                          <p className="text-sm text-slate-500">
                            {isPremium ? "Acces la toate funcționalitățile" : "3 generări gratuite"}
                          </p>
                        </div>
                        {isPremium ? (
                          <Badge variant="default" className="bg-green-500">
                            Activ
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={activatePremium}>
                            Activează Premium
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/pricing" className="w-full">
                      <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                        Abonează-te pentru generări nelimitate
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="h-5 w-5 mr-2 text-primary" />
                      Schimbă parola
                    </CardTitle>
                    <CardDescription>Actualizează parola contului tău</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Parolă nouă</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmă parola</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" disabled={isLoading || user?.providerData[0]?.providerId === "google.com"}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Se procesează...
                          </>
                        ) : (
                          "Trimite email de resetare"
                        )}
                      </Button>

                      {user?.providerData[0]?.providerId === "google.com" && (
                        <p className="text-sm text-slate-500 mt-2">
                          Contul tău folosește autentificarea Google. Gestionează parola din contul Google.
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm border-red-100">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-600">
                      <Trash2 className="h-5 w-5 mr-2" />
                      Șterge contul
                    </CardTitle>
                    <CardDescription>Șterge permanent contul tău și toate datele asociate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-red-600">Atenție: Acțiune ireversibilă</h3>
                          <p className="text-sm text-red-600">
                            Ștergerea contului va elimina permanent toate datele tale, inclusiv istoricul anunțurilor
                            generate. Această acțiune nu poate fi anulată.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Șterge contul permanent
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
            {/* Noul tab pentru template-uri */}
            <TabsContent value="sabloane" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {isPremium ? (
                  <SabloaneManager />
                ) : (
                  <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                        Șabloane pentru editare imagini
                      </CardTitle>
                      <CardDescription>
                        Personalizează și salvează șabloane pentru editarea rapidă a imaginilor
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                        <div className="bg-amber-100 p-2 rounded-full mr-3">
                          <CreditCard className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-amber-800 mb-1">Funcționalitate premium</h3>
                          <p className="text-sm text-amber-700">
                            Șabloanele personalizate sunt disponibile doar pentru utilizatorii premium. Abonează-te
                            pentru a debloca această funcționalitate.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">Șabloane personalizate</h3>
                            <p className="text-slate-500">
                              Salvează setări de editare și filtre pentru utilizare rapidă
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link href="/pricing" className="w-full">
                        <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                          Abonează-te pentru a debloca
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

