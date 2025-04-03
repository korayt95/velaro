"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Settings, HelpCircle } from "lucide-react"

interface ProcessingSettingsProps {
  blurLicensePlate: boolean
  onBlurLicensePlateChange: (value: boolean) => void
  autoEnhance: boolean
  onAutoEnhanceChange: (value: boolean) => void
  enhancementLevel: "light" | "medium" | "strong"
  onEnhancementLevelChange: (value: "light" | "medium" | "strong") => void
}

export function ProcessingSettings({
  blurLicensePlate,
  onBlurLicensePlateChange,
  autoEnhance,
  onAutoEnhanceChange,
  enhancementLevel,
  onEnhancementLevelChange,
}: ProcessingSettingsProps) {
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium flex items-center">
          <Settings className="h-4 w-4 mr-2 text-slate-500" />
          Setări de procesare
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle className="h-4 w-4 text-slate-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Aceste setări se aplică tuturor imaginilor procesate.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="blur-plate"
              checked={blurLicensePlate}
              onCheckedChange={(checked) => onBlurLicensePlateChange(checked as boolean)}
            />
            <Label htmlFor="blur-plate" className="text-sm font-medium cursor-pointer">
              Acoperă numărul de înmatriculare
            </Label>
          </div>
          <Badge variant={blurLicensePlate ? "default" : "outline"} className="text-xs">
            {blurLicensePlate ? "Activat" : "Dezactivat"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch id="auto-enhance" checked={autoEnhance} onCheckedChange={onAutoEnhanceChange} />
            <Label htmlFor="auto-enhance" className="text-sm font-medium cursor-pointer">
              Îmbunătățire automată la încărcare
            </Label>
          </div>
          <Badge variant={autoEnhance ? "default" : "outline"} className="text-xs">
            {autoEnhance ? "Activat" : "Dezactivat"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Nivel de îmbunătățire</Label>
            <Badge variant="outline" className="text-xs capitalize">
              {enhancementLevel === "light" ? "Ușor" : enhancementLevel === "medium" ? "Mediu" : "Puternic"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant={enhancementLevel === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => onEnhancementLevelChange("light")}
              className="flex-1"
            >
              Ușor
            </Button>
            <Button
              variant={enhancementLevel === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => onEnhancementLevelChange("medium")}
              className="flex-1"
            >
              Mediu
            </Button>
            <Button
              variant={enhancementLevel === "strong" ? "default" : "outline"}
              size="sm"
              onClick={() => onEnhancementLevelChange("strong")}
              className="flex-1"
            >
              Puternic
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

