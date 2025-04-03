"use client"

import { useState } from "react"
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
import { Trash2, Edit, Plus, ImageIcon, Save, Sliders, Palette, Type } from "lucide-react"

interface SablonEditare {
  id: string
  name: string
  imageUrl: string
  createdAt: Date
  type: "filter" | "text" | "adjust"
  settings: Record<string, any>
}

export function SabloaneManager() {
  const [sabloane, setSabloane] = useState<SablonEditare[]>([
    {
      id: "sablon1",
      name: "Contrast ridicat",
      imageUrl: "/placeholder.svg?height=200&width=300",
      createdAt: new Date(),
      type: "filter",
      settings: { contrast: 150, brightness: 110, saturation: 120 },
    },
    {
      id: "sablon2",
      name: "Vintage",
      imageUrl: "/placeholder.svg?height=200&width=300",
      createdAt: new Date(),
      type: "filter",
      settings: { filter: "vintage" },
    },
    {
      id: "sablon3",
      name: "Watermark",
      imageUrl: "/placeholder.svg?height=200&width=300",
      createdAt: new Date(),
      type: "text",
      settings: { text: "© Velaro", position: { x: 50, y: 90 }, color: "#ffffff", size: 24 },
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sablonToDelete, setSablonToDelete] = useState<string | null>(null)
  const [newSablonName, setNewSablonName] = useState("")
  const [newSablonType, setNewSablonType] = useState<"filter" | "text" | "adjust">("filter")
  const { toast } = useToast()

  const handleAddSablon = () => {
    if (!newSablonName.trim()) {
      toast({
        title: "Eroare",
        description: "Te rugăm să introduci un nume pentru șablon.",
        variant: "destructive",
      })
      return
    }

    // Adăugăm noul șablon
    const newSablon: SablonEditare = {
      id: `sablon-${Date.now()}`,
      name: newSablonName,
      imageUrl: "/placeholder.svg?height=200&width=300",
      createdAt: new Date(),
      type: newSablonType,
      settings: {},
    }

    setSabloane((prev) => [...prev, newSablon])
    setIsAddDialogOpen(false)
    setNewSablonName("")

    toast({
      title: "Șablon adăugat",
      description: "Șablonul a fost adăugat cu succes.",
    })
  }

  const handleDeleteSablon = () => {
    if (!sablonToDelete) return

    setSabloane((prev) => prev.filter((sablon) => sablon.id !== sablonToDelete))
    setSablonToDelete(null)
    setIsDeleteDialogOpen(false)

    toast({
      title: "Șablon șters",
      description: "Șablonul a fost șters cu succes.",
    })
  }

  const getIconForType = (type: "filter" | "text" | "adjust") => {
    switch (type) {
      case "filter":
        return <Palette className="h-4 w-4" />
      case "text":
        return <Type className="h-4 w-4" />
      case "adjust":
        return <Sliders className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  return (
    <Card className="shadow-lg border-slate-200 overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-primary" />
          Șabloane pentru editare imagini
        </CardTitle>
        <CardDescription>Gestionează șabloanele personalizate pentru editarea rapidă a imaginilor</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">
              Șabloanele personalizate îți permit să aplici rapid aceleași setări de editare pentru mai multe imagini.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adaugă șablon
            </Button>
          </div>

          {sabloane.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <ImageIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-2">Nu ai niciun șablon salvat</p>
              <p className="text-sm text-slate-400 mb-4">
                Adaugă primul tău șablon pentru a eficientiza procesul de editare
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adaugă șablon
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sabloane.map((sablon) => (
                <div
                  key={sablon.id}
                  className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-all"
                >
                  <div className="aspect-video bg-slate-100 relative">
                    <img
                      src={sablon.imageUrl || "/placeholder.svg"}
                      alt={sablon.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/90 hover:bg-white text-red-500 hover:text-red-600"
                          onClick={() => {
                            setSablonToDelete(sablon.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{sablon.name}</p>
                      <div className="bg-slate-100 p-1 rounded-full">{getIconForType(sablon.type)}</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Adăugat la {sablon.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Dialog pentru adăugare șablon */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă șablon nou</DialogTitle>
            <DialogDescription>Creează un șablon nou pentru editarea rapidă a imaginilor</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sablon-name">Nume șablon</Label>
              <Input
                id="sablon-name"
                value={newSablonName}
                onChange={(e) => setNewSablonName(e.target.value)}
                placeholder="Ex: Contrast ridicat"
              />
            </div>

            <div className="space-y-2">
              <Label>Tip șablon</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={newSablonType === "filter" ? "default" : "outline"}
                  onClick={() => setNewSablonType("filter")}
                  className="flex flex-col items-center py-4 h-auto"
                >
                  <Palette className="h-5 w-5 mb-1" />
                  <span className="text-xs">Filtre</span>
                </Button>
                <Button
                  variant={newSablonType === "adjust" ? "default" : "outline"}
                  onClick={() => setNewSablonType("adjust")}
                  className="flex flex-col items-center py-4 h-auto"
                >
                  <Sliders className="h-5 w-5 mb-1" />
                  <span className="text-xs">Ajustări</span>
                </Button>
                <Button
                  variant={newSablonType === "text" ? "default" : "outline"}
                  onClick={() => setNewSablonType("text")}
                  className="flex flex-col items-center py-4 h-auto"
                >
                  <Type className="h-5 w-5 mb-1" />
                  <span className="text-xs">Text</span>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={handleAddSablon}>
              <Save className="h-4 w-4 mr-2" />
              Salvează șablon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pentru confirmare ștergere */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ești sigur că vrei să ștergi acest șablon?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune nu poate fi anulată. Șablonul va fi șters permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSablonToDelete(null)}>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSablon} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

