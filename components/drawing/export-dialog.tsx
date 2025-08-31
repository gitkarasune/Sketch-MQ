"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download } from "lucide-react"

export type ExportFormat = "png" | "jpg" | "svg" | "pdf"

export interface ExportOptions {
  format: ExportFormat
  quality: number
  width: number
  height: number
  backgroundColor: string
  includeBackground: boolean
}

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (options: ExportOptions) => void
  defaultWidth?: number
  defaultHeight?: number
}

export default function ExportDialog({
  open,
  onOpenChange,
  onExport,
  defaultWidth = 800,
  defaultHeight = 600,
}: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    format: "png",
    quality: 0.9,
    width: defaultWidth,
    height: defaultHeight,
    backgroundColor: "#ffffff",
    includeBackground: true,
  })

  const formatOptions = [
    { value: "png", label: "PNG", description: "Best for detailed images with transparency" },
    { value: "jpg", label: "JPEG", description: "Best for photos, smaller file size" },
    { value: "svg", label: "SVG", description: "Vector format, scalable" },
    { value: "pdf", label: "PDF", description: "Document format, printable" },
  ]

  const presetSizes = [
    { name: "Original", width: defaultWidth, height: defaultHeight },
    { name: "HD", width: 1920, height: 1080 },
    { name: "4K", width: 3840, height: 2160 },
    { name: "Square", width: 1080, height: 1080 },
    { name: "A4", width: 2480, height: 3508 },
    { name: "Letter", width: 2550, height: 3300 },
  ]

  const handleExport = () => {
    onExport(options)
    onOpenChange(false)
  }

  const updateOptions = (updates: Partial<ExportOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }))
  }

  const getFileSize = () => {
    const pixels = options.width * options.height
    const bytesPerPixel = options.format === "jpg" ? 3 : 4
    const estimatedBytes = pixels * bytesPerPixel * options.quality
    const mb = estimatedBytes / (1024 * 1024)
    return mb > 1 ? `~${mb.toFixed(1)}MB` : `~${(mb * 1024).toFixed(0)}KB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Sketch
          </DialogTitle>
          <DialogDescription>Choose your export settings and download your sketch</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={options.format} onValueChange={(value: ExportFormat) => updateOptions({ format: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatOptions.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(options.format === "jpg" || options.format === "png") && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Quality: {Math.round(options.quality * 100)}%
                  </Label>
                  <Slider
                    value={[options.quality]}
                    onValueChange={(value: any) => updateOptions({ quality: value[0] })}
                    max={1}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Size Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Width</Label>
                  <Input
                    type="number"
                    value={options.width}
                    onChange={(e: any) => updateOptions({ width: Number.parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Height</Label>
                  <Input
                    type="number"
                    value={options.height}
                    onChange={(e: any) => updateOptions({ height: Number.parseInt(e.target.value) || 0 })}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {presetSizes.map((preset) => (
                  <Button
                    key={preset.name}
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs bg-transparent"
                    onClick={() => updateOptions({ width: preset.width, height: preset.height })}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground">
                Estimated size: <Badge variant="secondary">{getFileSize()}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Background Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeBackground}
                  onChange={(e) => updateOptions({ includeBackground: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Include background</span>
              </label>

              {options.includeBackground && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Color:</Label>
                  <input
                    type="color"
                    value={options.backgroundColor}
                    onChange={(e) => updateOptions({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-border"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
