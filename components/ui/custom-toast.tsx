import { toast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react"

type ToastType = "success" | "error" | "info" | "warning"

interface ShowToastOptions {
  title: string
  description?: string
  duration?: number
}

export const showToast = (type: ToastType, options: ShowToastOptions) => {
  const { title, description, duration = 3000 } = options

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const variants = {
    success: "default",
    error: "destructive",
    warning: "default",
    info: "default",
  }

  toast({
    title,
    description,
    variant: variants[type] as any,
    duration,
    icon: icons[type],
  })
}

