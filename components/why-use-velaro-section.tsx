"use client"

import { motion } from "framer-motion"
import { Star, Clock, TrendingUp, Search, Zap, Users, BarChart3 } from "lucide-react"

export function WhyUseVelaroSection() {
  const features = [
    {
      icon: <Star className="h-10 w-10" />,
      title: "Anunțuri profesionale",
      description:
        "Generează descrieri detaliate și atractive care evidențiază cele mai bune caracteristici ale mașinii tale.",
      color: "bg-yellow-500",
      delay: 0.1,
    },
    {
      icon: <TrendingUp className="h-10 w-10" />,
      title: "Vinde mai rapid",
      description: "Anunțurile optimizate atrag mai mulți cumpărători potențiali și cresc șansele de vânzare rapidă.",
      color: "bg-green-500",
      delay: 0.2,
    },
    {
      icon: <Clock className="h-10 w-10" />,
      title: "Economisește timp",
      description: "Creează anunțuri complete în câteva secunde, nu ore. Concentrează-te pe vânzare, nu pe scriere.",
      color: "bg-blue-500",
      delay: 0.3,
    },
    {
      icon: <Search className="h-10 w-10" />,
      title: "Optimizare SEO",
      description:
        "Anunțurile sunt optimizate pentru motoarele de căutare, crescând vizibilitatea și atrăgând mai mulți cumpărători.",
      color: "bg-purple-500",
      delay: 0.4,
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Tehnologie AI avansată",
      description:
        "Folosim cele mai recente modele de inteligență artificială pentru a crea anunțuri personalizate și convingătoare.",
      color: "bg-orange-500",
      delay: 0.5,
    },
    {
      icon: <BarChart3 className="h-10 w-10" />,
      title: "Analiză de piață",
      description:
        "Recomandări de preț bazate pe analiza pieței auto din România pentru a maximiza valoarea mașinii tale.",
      color: "bg-red-500",
      delay: 0.6,
    },
  ]

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.span
            className="inline-block text-primary font-semibold mb-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            AVANTAJE EXCLUSIVE
          </motion.span>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            De ce să folosești Velaro?
          </motion.h2>
          <motion.p
            className="text-xl text-slate-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Soluția perfectă pentru a crea anunțuri auto care atrag atenția și vând mai rapid
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div
                className={`mb-6 p-4 rounded-xl ${feature.color} bg-opacity-10 inline-block group-hover:bg-opacity-20 transition-all`}
              >
                <div className={`text-${feature.color.split("-")[1]}-600`}>{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Alătură-te celor peste 10,000 de utilizatori mulțumiți
          </h3>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Vânzătorii care folosesc Velaro vând mașinile cu până la 30% mai rapid și primesc cu 45% mai multe
            contactări de la cumpărători interesați.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold">30%</div>
              <div className="text-sm text-white/80">Vânzare mai rapidă</div>
            </motion.div>
            <motion.div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold">45%</div>
              <div className="text-sm text-white/80">Mai multe contactări</div>
            </motion.div>
            <motion.div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-white/80">Satisfacție clienți</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

