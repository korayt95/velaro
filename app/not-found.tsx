import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Pagină negăsită</h2>
      <p className="text-slate-600 mb-8 max-w-md">Ne pare rău, pagina pe care o căutați nu există sau a fost mutată.</p>
      <Link href="/">
        <Button>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi la pagina principală
        </Button>
      </Link>
    </div>
  )
}

