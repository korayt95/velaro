import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Car, Star, Check, ChevronRight } from "lucide-react"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { WhyUseVelaroSection } from "@/components/why-use-velaro-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-primary/90 text-white py-12 md:py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-6">
                🚀 Generează anunțuri auto profesionale în secunde
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Vinde-ți mașina <span className="text-primary-foreground">mai rapid</span> cu anunțuri create de AI
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-slate-300 max-w-xl mx-auto md:mx-0">
                Creează anunțuri profesionale pentru mașina ta în câteva secunde și atrage mai mulți cumpărători
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/generator">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    Începe acum <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 border-white/20 text-white px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    Cum funcționează <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-400" />
                  <span>3 generări gratuite</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-400" />
                  <span>Fără card de credit</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-400" />
                  <span>Rezultate instant</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-75"></div>
              <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-sm text-slate-500 dark:text-slate-400">Anunț generat</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3">Volkswagen Golf 7 2018 - Stare impecabilă, Carte service</h3>
                  <div className="prose prose-sm dark:prose-invert">
                    <p>
                      Vând Volkswagen Golf 7, fabricație 2018, motor 1.6 TDI, 115 CP, cutie manuală, 98.000 km rulați,
                      carte service la zi.
                    </p>
                    <p>Mașina este în stare impecabilă, fără evenimente în trafic, un singur proprietar, nefumător.</p>
                    <ul>
                      <li>Climatronic bi-zone</li>
                      <li>Navigație</li>
                      <li>Faruri LED</li>
                      <li>Senzori parcare</li>
                      <li>Jante aliaj 17"</li>
                    </ul>
                    <p>
                      Preț: <strong>13.900 EUR</strong>, negociabil. Accept orice test autorizat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Why Use Velaro Section */}
      <WhyUseVelaroSection />

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ce spun utilizatorii noștri</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experiențe reale ale clienților care au folosit Velaro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Alexandru Popescu"
              role="Dealer Auto"
              quote="Am vândut mașina în doar 3 zile după ce am folosit Velaro pentru anunț. Incredibil!"
              rating={5}
            />
            <TestimonialCard
              name="Maria Ionescu"
              role="Proprietar auto"
              quote="Nu știam cum să descriu mașina mea. Velaro a creat un anunț profesional în câteva secunde."
              rating={5}
            />
            <TestimonialCard
              name="Cristian Dumitrescu"
              role="Colecționar auto"
              quote="Folosesc Velaro pentru toate mașinile mele. Economisesc ore și primesc mai multe apeluri."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Gata să vinzi mașina mai rapid?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Primele 3 generări sunt gratuite. Încearcă acum și convinge-te singur!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generator">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg">
                Generează primul anunț
              </Button>
            </Link>
            <Link href="/demo/history">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              >
                Vezi demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-white text-xl font-bold flex items-center">
                <Car className="h-5 w-5 mr-2 text-primary" />
                Velaro
              </h3>
              <p className="mt-2">© {new Date().getFullYear()} Toate drepturile rezervate</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="hover:text-white">
                Termeni
              </Link>
              <Link href="/privacy" className="hover:text-white">
                Confidențialitate
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function TestimonialCard({ name, role, quote, rating = 5 }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-slate-700 mb-6 italic">"{quote}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-3">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-slate-500 text-sm">{role}</p>
        </div>
      </div>
    </div>
  )
}

