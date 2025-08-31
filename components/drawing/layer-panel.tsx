"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, MoreVertical, Copy, ArrowUp, ArrowDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: string
  thumbnail?: string
}

interface LayerPanelProps {
  layers: Layer[]
  activeLayerId: string
  onLayerSelect: (layerId: string) => void
  onLayerAdd: () => void
  onLayerDelete: (layerId: string) => void
  onLayerDuplicate: (layerId: string) => void
  onLayerRename: (layerId: string, name: string) => void
  onLayerVisibilityToggle: (layerId: string) => void
  onLayerLockToggle: (layerId: string) => void
  onLayerOpacityChange: (layerId: string, opacity: number) => void
  onLayerReorder: (layerId: string, direction: "up" | "down") => void
}

export default function LayerPanel({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayerAdd,
  onLayerDelete,
  onLayerDuplicate,
  onLayerRename,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  onLayerOpacityChange,
  onLayerReorder,
}: LayerPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const handleRename = (layerId: string, currentName: string) => {
    setEditingLayerId(layerId)
    setEditingName(currentName)
  }

  const handleRenameSubmit = () => {
    if (editingLayerId && editingName.trim()) {
      onLayerRename(editingLayerId, editingName.trim())
    }
    setEditingLayerId(null)
    setEditingName("")
  }

  const handleRenameCancel = () => {
    setEditingLayerId(null)
    setEditingName("")
  }

  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Layers</CardTitle>
          <Button size="sm" variant="outline" onClick={onLayerAdd}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {layers.map((layer, index) => (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`border rounded-lg p-2 cursor-pointer transition-all ${
                activeLayerId === layer.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onClick={() => onLayerSelect(layer.id)}
            >
              <div className="flex items-center gap-2">
                {/* Thumbnail */}
                <div className="w-8 h-8 bg-muted rounded border flex-shrink-0">
                  {layer.thumbnail ? (
                    <img
                      src={layer.thumbnail || "/placeholder.svg"}
                      alt={layer.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded" />
                  )}
                </div>

                {/* Layer Info */}
                <div className="flex-1 min-w-0">
                  {editingLayerId === layer.id ? (
                    <Input
                      value={editingName}
                      onChange={(e: any) => setEditingName(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e: any) => {
                        if (e.key === "Enter") handleRenameSubmit()
                        if (e.key === "Escape") handleRenameCancel()
                      }}
                      className="h-6 text-xs"
                      autoFocus
                    />
                  ) : (
                    <div className="text-xs font-medium truncate">{layer.name}</div>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {Math.round(layer.opacity * 100)}%
                    </Badge>
                    {!layer.visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                    {layer.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLayerVisibilityToggle(layer.id)
                    }}
                  >
                    {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLayerLockToggle(layer.id)
                    }}
                  >
                    {layer.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleRename(layer.id, layer.name)}>Rename</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onLayerDuplicate(layer.id)}>
                        <Copy className="h-3 w-3 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onLayerReorder(layer.id, "up")} disabled={index === 0}>
                        <ArrowUp className="h-3 w-3 mr-2" />
                        Move Up
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onLayerReorder(layer.id, "down")}
                        disabled={index === layers.length - 1}
                      >
                        <ArrowDown className="h-3 w-3 mr-2" />
                        Move Down
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onLayerDelete(layer.id)}
                        disabled={layers.length <= 1}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Opacity Slider */}
              {activeLayerId === layer.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pt-2 border-t border-border/50"
                >
                  <div className="text-xs text-muted-foreground mb-1">Opacity: {Math.round(layer.opacity * 100)}%</div>
                  <Slider
                    value={[layer.opacity]}
                    onValueChange={(value) => onLayerOpacityChange(layer.id, value[0])}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {layers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">No layers yet</div>
            <Button size="sm" variant="outline" onClick={onLayerAdd} className="mt-2 bg-transparent">
              <Plus className="h-3 w-3 mr-1" />
              Add Layer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
