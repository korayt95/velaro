"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  presetColors?: string[]
}

export function ColorPicker({
  value,
  onChange,
  presetColors = ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"],
}: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: value }} />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Selectează culoarea</h4>
            <p className="text-sm text-muted-foreground">Alege o culoare din preseturi sau introdu una personalizată</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {presetColors.map((color) => (
              <div
                key={color}
                className="w-8 h-8 rounded-full cursor-pointer border border-slate-200"
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-color">Culoare personalizată</Label>
            <Input id="custom-color" type="color" value={value} onChange={(e) => onChange(e.target.value)} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

