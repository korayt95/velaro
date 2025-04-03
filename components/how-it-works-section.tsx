"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { FileText, Sparkles, Share2, ChevronRight, Car, Zap, Clock, CheckCircle2 } from "lucide-react"

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: "Completează detaliile",
      description: "Introdu informațiile despre mașina ta: marcă, model, an, kilometraj și alte detalii relevante.",
      icon: <FileText className="h-6 w-6" />,
      color: "bg-primary",
      features: [
        "Formular simplu și intuitiv",
        "Câmpuri predefinite pentru toate detaliile importante",
        "Sugestii inteligente pentru completare rapidă",
      ],
    },
    {
      title: "Generează anunțul",
      description:
        "Algoritmul nostru de inteligență artificială creează un anunț profesional și atractiv în câteva secunde.",
      icon: <Sparkles className="h-6 w-6" />,
      color: "bg-purple-500",
      features: [
        "Generare instantanee cu AI avansat",
        "Descrieri optimizate pentru vânzare rapidă",
        "Formatare profesională automată",
      ],
    },
    {
      title: "Copiază și publică",
      description: "Copiază anunțul generat și publică-l pe platformele tale preferate de vânzare auto.",
      icon: <Share2 className="h-6 w-6" />,
      color: "bg-green-500",
      features: [
        "Copiere cu un singur click",
        "Format compatibil cu toate platformele",
        "Salvare în istoric pentru acces ulterior",
      ],
    },
  ]

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  }

  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block text-primary font-semibold mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            PROCES SIMPLU ÎN 3 PAȘI
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            Cum funcționează Velaro
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Generează anunțuri auto profesionale în doar 3 pași simpli
          </motion.p>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-12 overflow-x-auto max-w-full">
          <div className="inline-flex bg-slate-100 p-1 rounded-full">
            {steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`relative px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeStep === index ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {activeStep === index && (
                  <motion.div
                    layoutId="activeStepIndicator"
                    className={`absolute inset-0 rounded-full ${steps[activeStep].color}`}
                    transition={{ type: "spring", duration: 0.6 }}
                  />
                )}
                <span className="relative flex items-center">
                  {step.icon}
                  <span className="ml-2">{step.title}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Step description */}
          <motion.div key={activeStep} initial="initial" animate="animate" exit="exit" variants={fadeInUp}>
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${steps[activeStep].color} text-white mb-6`}
            >
              {steps[activeStep].icon}
            </div>
            <h3 className="text-2xl font-bold mb-4">{`Pasul ${activeStep + 1}: ${steps[activeStep].title}`}</h3>
            <p className="text-lg text-slate-600 mb-8">{steps[activeStep].description}</p>

            <div className="space-y-4">
              {steps[activeStep].features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="ml-3 text-slate-700">{feature}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center text-primary font-medium">
              <span>Încearcă acum</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </motion.div>

          {/* Right side - Illustration */}
          <motion.div
            key={`illustration-${activeStep}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-xl opacity-50"></div>
            <Card className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-0">
              {activeStep === 0 && (
                <div className="p-6">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                    <div className="flex items-center mb-3">
                      <Car className="h-5 w-5 text-primary mr-2" />
                      <h4 className="font-medium">Detalii mașină</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <div className="text-xs text-slate-500">Marcă</div>
                          <div className="font-medium">Volkswagen</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <div className="text-xs text-slate-500">Model</div>
                          <div className="font-medium">Golf</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <div className="text-xs text-slate-500">An</div>
                          <div className="font-medium">2018</div>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <div className="text-xs text-slate-500">Kilometraj</div>
                          <div className="font-medium">98.000 km</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg">
                      <Zap className="h-4 w-4 mr-2" />
                      <span>Generează</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                      <h4 className="font-medium">Anunț generat</h4>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>2 secunde</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="text-lg font-bold mb-2">Volkswagen Golf 7 2018 - Stare impecabilă</h3>
                    <p className="text-sm text-slate-700 mb-2">
                      Vând Volkswagen Golf 7, fabricație 2018, motor 1.6 TDI, 115 CP, cutie manuală, 98.000 km rulați,
                      carte service la zi.
                    </p>
                    <p className="text-sm text-slate-700 mb-2">
                      Mașina este în stare impecabilă, fără evenimente în trafic, un singur proprietar, nefumător.
                    </p>
                    <div className="text-sm font-medium">Preț: 13.900 EUR</div>
                  </div>
                  <div className="flex justify-center mt-4">
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span>Generat cu succes</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Share2 className="h-5 w-5 text-green-500 mr-2" />
                      <h4 className="font-medium">Partajează anunțul</h4>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                    <h3 className="text-lg font-bold mb-2">Volkswagen Golf 7 2018 - Stare impecabilă</h3>
                    <p className="text-sm text-slate-700 mb-2 line-clamp-2">
                      Vând Volkswagen Golf 7, fabricație 2018, motor 1.6 TDI, 115 CP, cutie manuală, 98.000 km rulați...
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <span className="text-blue-600 font-bold">A</span>
                      </div>
                      <span className="text-sm font-medium">Autovit</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                        <span className="text-yellow-600 font-bold">O</span>
                      </div>
                      <span className="text-sm font-medium">OLX</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

