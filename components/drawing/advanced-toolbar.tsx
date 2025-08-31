"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import {
  Pen,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Type,
  Palette,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer2,
} from "lucide-react"

export type DrawingTool = "pen" | "eraser" | "rectangle" | "circle" | "arrow" | "text" | "select" | "move"

interface AdvancedToolbarProps {
  selectedTool: DrawingTool
  onToolChange: (tool: DrawingTool) => void
  strokeWidth: number
  onStrokeWidthChange: (width: number) => void
  opacity: number
  onOpacityChange: (opacity: number) => void
  strokeColor: string
  onStrokeColorChange: (color: string) => void
  showGrid: boolean
  onGridToggle: () => void
  zoom: number
  onZoomChange: (zoom: number) => void
}

const COLOR_PRESETS = [
  "#000000", // Black
  "#ffffff", // White
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#64748b", // Gray
  "#a855f7", // Purple
]

export default function AdvancedToolbar({
  selectedTool,
  onToolChange,
  strokeWidth,
  onStrokeWidthChange,
  opacity,
  onOpacityChange,
  strokeColor,
  onStrokeColorChange,
  showGrid,
  onGridToggle,
  zoom,
  onZoomChange,
}: AdvancedToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const tools = [
    { id: "select" as DrawingTool, icon: MousePointer2, label: "Select" },
    { id: "pen" as DrawingTool, icon: Pen, label: "Pen" },
    { id: "eraser" as DrawingTool, icon: Eraser, label: "Eraser" },
    { id: "rectangle" as DrawingTool, icon: Square, label: "Rectangle" },
    { id: "circle" as DrawingTool, icon: Circle, label: "Circle" },
    { id: "arrow" as DrawingTool, icon: ArrowRight, label: "Arrow" },
    { id: "text" as DrawingTool, icon: Type, label: "Text" },
    { id: "move" as DrawingTool, icon: Move, label: "Pan" },
  ]

  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Drawing Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tool Selection */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Tools</Label>
          <div className="grid grid-cols-4 gap-1">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Button
                  key={tool.id}
                  size="sm"
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  className="h-10 w-10 p-0"
                  onClick={() => onToolChange(tool.id)}
                  title={tool.label}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Color Selection */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Color</Label>
          <div className="flex items-center gap-2">
            <div className="grid grid-cols-6 gap-1 flex-1">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    strokeColor === color ? "border-primary scale-110" : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onStrokeColorChange(color)}
                />
              ))}
            </div>
            <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                  <Palette className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Custom Color</Label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => onStrokeColorChange(e.target.value)}
                    className="w-full h-10 rounded border border-border"
                  />
                  <div className="text-xs text-muted-foreground">
                    Current: <code className="bg-muted px-1 rounded">{strokeColor}</code>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Separator />

        {/* Brush Settings */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Stroke Width: {strokeWidth}px</Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => onStrokeWidthChange(value[0])}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Opacity: {Math.round(opacity * 100)}%</Label>
            <Slider
              value={[opacity]}
              onValueChange={(value) => onOpacityChange(value[0])}
              max={1}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        {/* View Controls */}
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">View</Label>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={showGrid ? "default" : "outline"} onClick={onGridToggle} className="flex-1">
                <Grid3X3 className="h-3 w-3 mr-1" />
                Grid
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Zoom: {Math.round(zoom * 100)}%</Label>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onZoomChange(Math.max(0.25, zoom - 0.25))}
                disabled={zoom <= 0.25}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <div className="flex-1 text-center">
                <Badge variant="secondary" className="text-xs">
                  {Math.round(zoom * 100)}%
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onZoomChange(Math.min(4, zoom + 0.25))}
                disabled={zoom >= 4}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onZoomChange(1)} className="w-full mt-1 text-xs">
              Reset Zoom
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
