"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash2, Edit, Plus, Image } from "lucide-react"

interface LicensePlateTemplate {
  id: string
  name: string
  imageUrl: string
  createdAt: Date
}

export function LicensePlateTemplates() {
  const [templates, setTemplates] = useState<LicensePlateTemplate[]>([
    {
      id: "template1",
      name: "Brand personal",
      imageUrl: "/placeholder.svg?height=100&width=400",
      createdAt: new Date(),
    },
    {
      id: "template2",
      name: "Confidențial",
      imageUrl: "/placeholder.svg?height=100&width=400",
      createdAt: new Date(),
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [newTemplateName, setNewTemplateName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificăm dacă fișierul este o imagine
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Fișier invalid",
        description: "Te rugăm să selectezi o imagine.",
        variant: "destructive",
      })
      return
    }

    // Verificăm dimensiunea fișierului (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Fișier prea mare",
        description: "Imaginea trebuie să fie mai mică de 2MB.",
        variant: "destructive",
      })
      return
    }

    // Citim fișierul ca URL de date
    const reader = new FileReader()
    reader.onload = () => {
      // Adăugăm noul template
      const newTemplate: LicensePlateTemplate = {
        id: `template-${Date.now()}`,
        name: newTemplateName || `Template ${templates.length + 1}`,
        imageUrl: reader.result as string,
        createdAt: new Date(),
      }

      setTemplates((prev) => [...prev, newTemplate])
      setIsAddDialogOpen(false)
      setNewTemplateName("")

      toast({
        title: "Template adăugat",
        description: "Template-ul a fost adăugat cu succes.",
      })
    }

    reader.readAsDataURL(file)
  }

  const handleDeleteTemplate = () => {
    if (!templateToDelete) return

    setTemplates((prev) => prev.filter((template) => template.id !== templateToDelete))
    setTemplateToDelete(null)
    setIsDeleteDialogOpen(false)

    toast({
      title: "Template șters",
      description: "Template-ul a fost șters cu succes.",
    })
  }

  return (
    <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Image className="h-5 w-5 mr-2 text-primary" />
          Template-uri pentru numere de înmatriculare
        </CardTitle>
        <CardDescription>
          Gestionează template-urile personalizate pentru acoperirea numerelor de înmatriculare
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Template-urile personalizate îți permit să adaugi logo-ul sau brandul tău peste numerele de înmatriculare.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adaugă template
            </Button>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <Image className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">Nu ai niciun template salvat</p>
              <p className="text-sm text-slate-400 mb-4">
                Adaugă primul tău template pentru a personaliza numerele de înmatriculare
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adaugă template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg overflow-hidden bg-white">
                  <div className="aspect-[4/1] bg-slate-100 relative">
                    <img
                      src={template.imageUrl || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => {
                            // Implementare pentru editare
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/90 hover:bg-white text-red-500 hover:text-red-600"
                          onClick={() => {
                            setTemplateToDelete(template.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium truncate">{template.name}</p>
                    <p className="text-xs text-slate-500">Adăugat la {template.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog pentru adăugare template */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă template nou</DialogTitle>
            <DialogDescription>
              Încarcă o imagine pentru a o folosi ca template pentru numerele de înmatriculare
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nume template</Label>
              <Input
                id="template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Ex: Brand personal"
              />
            </div>

            <div className="space-y-2">
              <Label>Imagine template</Label>
              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-slate-400 mb-4" />
                <p className="text-sm text-slate-500 mb-2">Click pentru a încărca o imagine</p>
                <p className="text-xs text-slate-400">Suportă PNG, JPG (max 2MB)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg"
                  onChange={handleFileSelect}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Recomandare: folosește o imagine cu fundal transparent (PNG) pentru rezultate optime
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Încarcă și salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru confirmare ștergere */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur că vrei să ștergi acest template?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Template-ul va fi șters permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

