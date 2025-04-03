"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Car, LogIn, Key, Mail, AlertCircle, Loader2, Lock, Shield, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    hasNumber: false,
    hasUppercase: false,
  })
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  // Clear error when tab changes
  useEffect(() => {
    setError("")
  }, [activeTab])

  // Validare parolă
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
    })
  }, [password])

  const isPasswordValid = () => {
    return passwordValidation.length && passwordValidation.hasNumber && passwordValidation.hasUppercase
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signIn(email, password)
      toast({
        title: "Autentificare reușită",
        description: "Bine ai revenit!",
        duration: 3000,
      })
      router.push(redirect)
    } catch (error) {
      setError("Email sau parolă incorectă.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError("")

    if (!isPasswordValid()) {
      setError("Parola nu îndeplinește toate cerințele.")
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password)
      toast({
        title: "Cont creat cu succes",
        description: "Bine ai venit în comunitatea Velaro!",
        duration: 3000,
      })
      router.push(redirect)
    } catch (error) {
      setError("Acest email este deja folosit sau parola este prea scurtă.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setIsGoogleLoading(true)

    try {
      await signInWithGoogle()
      toast({
        title: "Autentificare reușită",
        description: "Bine ai revenit!",
        duration: 3000,
      })
      router.push(redirect)
    } catch (error) {
      setError("Eroare la autentificarea cu Google.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Te rugăm să introduci adresa de email.")
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(email)
      toast({
        title: "Email trimis",
        description: "Verifică-ți emailul pentru instrucțiuni de resetare a parolei.",
        duration: 3000,
      })
    } catch (error) {
      setError("Nu am putut trimite emailul de resetare. Verifică adresa de email.")
    } finally {
      setIsLoading(false)
    }
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-slate-600 hover:text-slate-900 group transition-all">
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow mr-2 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Înapoi la pagina principală</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
          {/* Left side - Brand message */}
          <motion.div
            className="w-full md:w-1/2 text-center md:text-left"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="flex items-center justify-center md:justify-start mb-6">
              <div className="bg-slate-900 p-2 rounded-lg shadow-lg">
                <Car className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold ml-3">Velaro</h1>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Bine ai venit la viitorul anunțurilor auto
            </h2>
            <p className="text-slate-600 mb-8">
              Creează anunțuri profesionale pentru mașina ta în câteva secunde și vinde mai rapid cu ajutorul
              inteligenței artificiale.
            </p>

            <div className="hidden md:block space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-4 transform transition-all hover:scale-105 hover:shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mr-4">
                    <LogIn className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Acces la toate funcțiile</h3>
                    <p className="text-slate-500">Salvează anunțurile și accesează-le oricând</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 transform transition-all hover:scale-105 hover:shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mr-4">
                    <Car className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">3 generări gratuite</h3>
                    <p className="text-slate-500">Testează serviciul fără niciun cost</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 transform transition-all hover:scale-105 hover:shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 mr-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Securitate garantată</h3>
                    <p className="text-slate-500">Datele tale sunt protejate și confidențiale</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Login/Register form */}
          <motion.div className="w-full md:w-1/2" initial="hidden" animate="visible" variants={fadeIn}>
            <Card className="shadow-2xl border-slate-200 overflow-hidden bg-white">
              <CardHeader className="space-y-1 pb-8">
                <CardTitle className="text-2xl font-bold text-center">Contul tău Velaro</CardTitle>
                <CardDescription className="text-center">
                  Autentifică-te sau creează un cont pentru a începe
                </CardDescription>
              </CardHeader>

              {/* Google Sign In Button */}
              <div className="px-8 pb-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full py-6 flex items-center justify-center shadow-sm border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
                    )}
                    <span className="font-medium">Continuă cu Google</span>
                  </Button>
                </motion.div>
              </div>

              <div className="px-8 py-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-500">sau</span>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-4">
                <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-2 w-full mb-6 bg-slate-100 rounded-lg p-1 relative">
                    <div
                      className={`absolute top-1 bottom-1 left-1 w-[calc(50%-2px)] bg-white rounded-md shadow-sm transition-all duration-200 transform ${
                        activeTab === "login" ? "translate-x-0" : "translate-x-[100%]"
                      }`}
                    />
                    <TabsTrigger value="login" className="text-sm py-2.5 rounded-md transition-all relative z-10">
                      Autentificare
                    </TabsTrigger>
                    <TabsTrigger value="register" className="text-sm py-2.5 rounded-md transition-all relative z-10">
                      Înregistrare
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleSignIn}>
                      <CardContent className="space-y-4 pt-2 px-0">
                        {error && (
                          <Alert variant="destructive" className="text-sm py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="nume@exemplu.ro"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500 py-6"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm font-medium">
                              Parolă
                            </Label>
                            <button
                              type="button"
                              className="text-xs text-primary hover:underline"
                              onClick={handleResetPassword}
                            >
                              Ai uitat parola?
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500 py-6"
                              placeholder="Introdu parola"
                              required
                            />
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-4 px-0">
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 shadow-md"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Se procesează...
                              </>
                            ) : (
                              <>
                                <LogIn className="mr-2 h-4 w-4" />
                                Autentificare
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form onSubmit={handleSignUp}>
                      <CardContent className="space-y-4 pt-2 px-0">
                        {error && (
                          <Alert variant="destructive" className="text-sm py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-sm font-medium">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="nume@exemplu.ro"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500 py-6"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="text-sm font-medium">
                            Parolă
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              id="register-password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500 py-6"
                              placeholder="Introdu parola"
                              required
                            />
                          </div>

                          {password.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center">
                                <div
                                  className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center transition-colors ${
                                    passwordValidation.length
                                      ? "bg-green-100 text-green-600"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {passwordValidation.length ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                  )}
                                </div>
                                <p
                                  className={`text-xs ${passwordValidation.length ? "text-green-600" : "text-slate-500"}`}
                                >
                                  Minim 8 caractere
                                </p>
                              </div>
                              <div className="flex items-center">
                                <div
                                  className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center transition-colors ${
                                    passwordValidation.hasNumber
                                      ? "bg-green-100 text-green-600"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {passwordValidation.hasNumber ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                  )}
                                </div>
                                <p
                                  className={`text-xs ${passwordValidation.hasNumber ? "text-green-600" : "text-slate-500"}`}
                                >
                                  Minim o cifră (0-9)
                                </p>
                              </div>
                              <div className="flex items-center">
                                <div
                                  className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center transition-colors ${
                                    passwordValidation.hasUppercase
                                      ? "bg-green-100 text-green-600"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {passwordValidation.hasUppercase ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                  )}
                                </div>
                                <p
                                  className={`text-xs ${passwordValidation.hasUppercase ? "text-green-600" : "text-slate-500"}`}
                                >
                                  Minim o literă mare (A-Z)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="pt-4 px-0">
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 shadow-md"
                            disabled={isLoading || !isPasswordValid()}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Se procesează...
                              </>
                            ) : (
                              <>
                                <Key className="mr-2 h-4 w-4" />
                                Creează cont
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="px-8 pb-8 pt-2 text-center">
                <p className="text-xs text-slate-500">
                  Prin crearea unui cont, ești de acord cu{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Termenii și Condițiile
                  </Link>{" "}
                  și{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Politica de Confidențialitate
                  </Link>
                  .
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

