"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Check,
  ArrowLeft,
  Star,
  Zap,
  Shield,
  Clock,
  Sparkles,
  Globe,
  BarChart3,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const checkScroll = () => {
      if (tableRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = tableRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5) // 5px buffer
      }
    }

    // Check on mount
    checkScroll()

    // Add event listener
    const currentRef = tableRef.current
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScroll)
    }

    // Cleanup
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScroll)
      }
    }
  }, [])

  const scrollTable = (direction: "left" | "right") => {
    if (tableRef.current) {
      const scrollAmount = 200 // px to scroll
      const newScrollLeft =
        direction === "left" ? tableRef.current.scrollLeft - scrollAmount : tableRef.current.scrollLeft + scrollAmount

      tableRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  const handleSubscribe = (plan: string) => {
    setIsLoading(true)

    // This would connect to Stripe in the full implementation
    setTimeout(() => {
      toast({
        title: "Funcționalitate în dezvoltare",
        description: "Abonamentele vor fi disponibile în curând.",
        duration: 3000,
      })
      setIsLoading(false)
    }, 1000)
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-slate-600 hover:text-slate-900 group transition-all">
            <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow mr-2 transition-all">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span>Înapoi la pagina principală</span>
          </Link>
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 px-4 py-1 bg-primary/10 text-primary border-primary/20 rounded-full">
              PREȚURI TRANSPARENTE
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Alege planul potrivit pentru tine
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Toate planurile includ acces la tehnologia noastră AI avansată pentru generarea anunțurilor auto
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
              <PricingCard
                title="Gratuit"
                description="Perfect pentru a testa serviciul"
                price="0"
                icon={<Star className="h-6 w-6" />}
                iconColor="bg-yellow-500"
                features={["3 generări gratuite", "Anunțuri de bază", "Salvare în istoric", "Fără suport prioritar"]}
                buttonText={user ? "Plan curent" : "Înregistrează-te"}
                buttonVariant="outline"
                buttonDisabled={!!user}
                onSubscribe={() => {}}
                href={user ? undefined : "/login"}
              />
            </motion.div>

            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
              <PricingCard
                title="Standard"
                description="Pentru vânzători ocazionali"
                price="9.99"
                icon={<Zap className="h-6 w-6" />}
                iconColor="bg-blue-500"
                features={[
                  "30 generări pe lună",
                  "Anunțuri optimizate",
                  "Salvare în istoric",
                  "Suport prin email",
                  "Acces la șabloane premium",
                ]}
                buttonText="Abonează-te"
                buttonVariant="default"
                buttonDisabled={isLoading}
                onSubscribe={() => handleSubscribe("standard")}
                popular
              />
            </motion.div>

            <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
              <PricingCard
                title="Premium"
                description="Pentru dealeri și profesioniști"
                price="29.99"
                icon={<Sparkles className="h-6 w-6" />}
                iconColor="bg-purple-500"
                features={[
                  "Generări nelimitate",
                  "Anunțuri premium",
                  "Istoric nelimitat",
                  "Suport prioritar 24/7",
                  "Analiză SEO pentru anunțuri",
                  "Traducere în alte limbi",
                  "Statistici avansate",
                ]}
                buttonText="Abonează-te"
                buttonVariant="default"
                buttonDisabled={isLoading}
                onSubscribe={() => handleSubscribe("premium")}
              />
            </motion.div>
          </div>

          <motion.div
            className="mt-24 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Compară planurile</h2>

              {/* Scroll indicators */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollTable("left")}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5 text-primary" />
                </button>
              )}

              {canScrollRight && (
                <button
                  onClick={() => scrollTable("right")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5 text-primary" />
                </button>
              )}

              <div
                ref={tableRef}
                className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pb-4"
              >
                <div className="min-w-[600px]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-4 px-4 font-medium text-slate-500">Funcționalitate</th>
                        <th className="text-center py-4 px-4 font-medium text-slate-500">Gratuit</th>
                        <th className="text-center py-4 px-4 font-medium text-slate-500">Standard</th>
                        <th className="text-center py-4 px-4 font-medium text-slate-500">Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-4 px-4 font-medium">Generări lunare</td>
                        <td className="py-4 px-4 text-center">3 total</td>
                        <td className="py-4 px-4 text-center">30</td>
                        <td className="py-4 px-4 text-center">Nelimitat</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-4 px-4 font-medium">Calitate anunțuri</td>
                        <td className="py-4 px-4 text-center">De bază</td>
                        <td className="py-4 px-4 text-center">Optimizată</td>
                        <td className="py-4 px-4 text-center">Premium</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-4 px-4 font-medium">Salvare în istoric</td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-4 px-4 font-medium">Suport clienți</td>
                        <td className="py-4 px-4 text-center">De bază</td>
                        <td className="py-4 px-4 text-center">Email</td>
                        <td className="py-4 px-4 text-center">Prioritar 24/7</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-4 px-4 font-medium">Analiză SEO</td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-xs">✕</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-xs">✕</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 font-medium">Traducere în alte limbi</td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-xs">✕</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 text-xs">✕</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Scroll indicator text */}
              <div className="text-center mt-4 text-sm text-slate-500">
                <span>Glisează pentru a vedea toate funcționalitățile</span>
              </div>
            </div>
          </motion.div>

          <div className="mt-24 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-12">Întrebări frecvente</h2>

            <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
              <motion.div
                className="bg-white p-8 rounded-xl shadow-md border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg mr-4">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Ce se întâmplă după ce folosesc cele 3 generări gratuite?</h3>
                </div>
                <p className="text-slate-600 ml-12">
                  După ce folosești cele 3 generări gratuite, va trebui să te abonezi la unul dintre planurile noastre
                  pentru a continua să generezi anunțuri.
                </p>
              </motion.div>

              <motion.div
                className="bg-white p-8 rounded-xl shadow-md border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg mr-4">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Pot anula abonamentul oricând?</h3>
                </div>
                <p className="text-slate-600 ml-12">
                  Da, poți anula abonamentul în orice moment. Vei avea acces la serviciu până la sfârșitul perioadei de
                  facturare curente.
                </p>
              </motion.div>

              <motion.div
                className="bg-white p-8 rounded-xl shadow-md border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg mr-4">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Ce metode de plată acceptați?</h3>
                </div>
                <p className="text-slate-600 ml-12">
                  Acceptăm plăți cu cardul (Visa, Mastercard) și PayPal. Toate plățile sunt procesate securizat prin
                  Stripe.
                </p>
              </motion.div>

              <motion.div
                className="bg-white p-8 rounded-xl shadow-md border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-start mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg mr-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Cum funcționează generarea anunțurilor?</h3>
                </div>
                <p className="text-slate-600 ml-12">
                  Folosim inteligența artificială avansată pentru a crea anunțuri optimizate pe baza informațiilor pe
                  care le furnizezi despre mașina ta.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PricingCard({
  title,
  description,
  price,
  icon,
  iconColor,
  features,
  buttonText,
  buttonVariant = "default",
  buttonDisabled = false,
  onSubscribe,
  popular = false,
  href,
}) {
  return (
    <Card
      className={`relative h-full flex flex-col ${popular ? "border-primary shadow-xl" : "shadow-lg border-slate-200"} overflow-hidden`}
    >
      {popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-white text-xs font-bold py-1 px-10 rotate-45 translate-x-8 translate-y-3">
            Popular
          </div>
        </div>
      )}

      <CardHeader className={`pb-8 ${popular ? "bg-primary/5" : ""}`}>
        <div className={`w-12 h-12 rounded-xl ${iconColor} flex items-center justify-center text-white mb-4`}>
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="mb-6 flex items-baseline">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-slate-600 ml-1">€/lună</span>
        </div>

        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <p className="ml-3 text-slate-700">{feature}</p>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto">
        {href ? (
          <Link href={href} className="w-full">
            <Button
              variant={buttonVariant}
              className={`w-full py-6 ${popular ? "bg-primary hover:bg-primary/90 text-white" : ""}`}
              disabled={buttonDisabled}
            >
              {buttonText}
            </Button>
          </Link>
        ) : (
          <Button
            variant={buttonVariant}
            className={`w-full py-6 ${popular ? "bg-primary hover:bg-primary/90 text-white" : ""}`}
            disabled={buttonDisabled}
            onClick={onSubscribe}
          >
            {buttonText}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

