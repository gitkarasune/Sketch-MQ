"use client"

import { useRef, useState, useEffect } from "react"
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas"
import { Button } from "@/components/ui/button"
import { Eraser, Pen, Plus, X, Redo, RotateCcw, Save, Undo, Download, Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCollaboration, type DrawingEvent } from "@/lib/collaboration"
import { useAuth } from "@/lib/auth"
import AdvancedToolbar, { type DrawingTool } from "@/components/drawing/advanced-toolbar"
import LayerPanel, { type Layer } from "@/components/drawing/layer-panel"
import ExportDialog, { type ExportOptions } from "@/components/drawing/export-dialog"
import {toast} from "sonner"
import { useTheme } from "next-themes"

export default function Canvas() {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<ReactSketchCanvasRef>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  const [selectedTool, setSelectedTool] = useState<DrawingTool>("pen")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [opacity, setOpacity] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [showActions, setShowActions] = useState(false)
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const { theme } = useTheme()

  // Layer management
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: "layer-1",
      name: "Background",
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
    },
  ])
  const [activeLayerId, setActiveLayerId] = useState("layer-1")

  const { sendDrawingEvent, sendCursorPosition, onDrawingEvent, currentRoom } = useCollaboration()
  const { user } = useAuth()

  useEffect(() => {
    if (!currentRoom) return

    const unsubscribe = onDrawingEvent((event: DrawingEvent) => {
      if (event.userId === user?.id) return

      console.log("[v0] Applying remote drawing event:", event.type)

      switch (event.type) {
        case "stroke":
          if (canvasRef.current) {
            canvasRef.current.loadPaths(event.data.paths)
          }
          break
        case "erase":
          if (canvasRef.current) {
            canvasRef.current.loadPaths(event.data.paths)
          }
          break
        case "clear":
          if (canvasRef.current) {
            canvasRef.current.clearCanvas()
          }
          break
      }
    })

    return unsubscribe
  }, [currentRoom, onDrawingEvent, user?.id])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (currentRoom && canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        sendCursorPosition(x, y)
      }
    }

    const container = canvasContainerRef.current
    if (container) {
      container.addEventListener("mousemove", handleMouseMove)
      return () => container.removeEventListener("mousemove", handleMouseMove)
    }
  }, [currentRoom, sendCursorPosition])

  const handleToolChange = (tool: DrawingTool) => {
    setSelectedTool(tool)
    if (tool === "eraser") {
      canvasRef.current?.eraseMode(true)
    } else if (tool === "pen") {
      canvasRef.current?.eraseMode(false)
    }
  }

  function handleStrokeColorChange(color: string) {
    setStrokeColor(color)
  }

  function handleEraserClick() {
    setSelectedTool("eraser")
    canvasRef.current?.eraseMode(true)
  }

  function handlePenClick() {
    setSelectedTool("pen")
    canvasRef.current?.eraseMode(false)
  }

  async function handleUndoClick() {
    canvasRef.current?.undo()

    if (currentRoom && user) {
      const paths = await canvasRef.current?.exportPaths()
      sendDrawingEvent({
        type: "stroke",
        data: { paths },
        userId: user.id,
        timestamp: Date.now(),
      })
    }
  }

  async function handleRedoClick() {
    canvasRef.current?.redo()

    if (currentRoom && user) {
      const paths = await canvasRef.current?.exportPaths()
      sendDrawingEvent({
        type: "stroke",
        data: { paths },
        userId: user.id,
        timestamp: Date.now(),
      })
    }
  }

  async function handleClearClick() {
    canvasRef.current?.clearCanvas()

    if (currentRoom && user) {
      sendDrawingEvent({
        type: "clear",
        data: {},
        userId: user.id,
        timestamp: Date.now(),
      })
    }
  }

  async function handleSave() {
    const dataURL = await canvasRef.current?.exportImage("png")
    if (dataURL) {
      const link = Object.assign(document.createElement("a"), {
        href: dataURL,
        style: { display: "none" },
        download: "sketch.png",
      })

      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success("Your sketch has been downloaded successfully")
    }
  }

  const handleStrokeEnd = async () => {
    if (currentRoom && user) {
      const paths = await canvasRef.current?.exportPaths()
      sendDrawingEvent({
        type: selectedTool === "eraser" ? "erase" : "stroke",
        data: { paths },
        userId: user.id,
        timestamp: Date.now(),
      })
    }
  }

  const handleLayerAdd = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 1,
      blendMode: "normal",
    }
    setLayers([...layers, newLayer])
    setActiveLayerId(newLayer.id)
    toast.success(`Created ${newLayer.name}`)
  }

  const handleLayerDelete = (layerId: string) => {
    if (layers.length <= 1) return
    setLayers(layers.filter((l) => l.id !== layerId))
    if (activeLayerId === layerId) {
      setActiveLayerId(layers.find((l) => l.id !== layerId)?.id || layers[0].id)
    }
    toast.success("Layer deleted")
  }

  const handleLayerDuplicate = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId)
    if (!layer) return

    const newLayer: Layer = {
      ...layer,
      id: `layer-${Date.now()}`,
      name: `${layer.name} Copy`,
    }
    const index = layers.findIndex((l) => l.id === layerId)
    const newLayers = [...layers]
    newLayers.splice(index + 1, 0, newLayer)
    setLayers(newLayers)
    setActiveLayerId(newLayer.id)
  }

  const handleLayerRename = (layerId: string, name: string) => {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, name } : l)))
  }

  const handleLayerVisibilityToggle = (layerId: string) => {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)))
  }

  const handleLayerLockToggle = (layerId: string) => {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l)))
  }

  const handleLayerOpacityChange = (layerId: string, opacity: number) => {
    setLayers(layers.map((l) => (l.id === layerId ? { ...l, opacity } : l)))
  }

  const handleLayerReorder = (layerId: string, direction: "up" | "down") => {
    const index = layers.findIndex((l) => l.id === layerId)
    if (index === -1) return

    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= layers.length) return

    const newLayers = [...layers]
    const [movedLayer] = newLayers.splice(index, 1)
    newLayers.splice(newIndex, 0, movedLayer)
    setLayers(newLayers)
  }

  const handleExport = async (options: ExportOptions) => {
    // Validate options
    if (!options.format) {
      toast.error("Invalid export format")
      return
    }

    try {
      let dataURL: string | undefined

      switch (options.format) {
        case "png":
        case "jpg":
          // dataURL = await canvasRef.current?.exportImage(options.format) 
          dataURL = dataURL?.replace("data:image/png", `data:image/${options.format}`) // adjust MIME type if needed
          break
        case "svg":
          dataURL = await canvasRef.current?.exportSvg()
          break
        default:
          dataURL = await canvasRef.current?.exportImage("png")
      }

      if (dataURL) {
        const link = Object.assign(document.createElement("a"), {
          href: dataURL,
          style: { display: "none" },
          download: `sketch.${options.format}`,
        })

        document.body.appendChild(link)
        link.click()
        link.remove()
          toast.success(`Your sketch has been exported as ${options.format.toUpperCase()}`)
        
      }
    } catch (error) {
      toast.error("Failed to export the sketch. Please try again.")
    }
  }

  const actionButtons = [
    { icon: <Undo size={20} />, onClick: handleUndoClick, label: "Undo" },
    { icon: <Redo size={20} />, onClick: handleRedoClick, label: "Redo" },
    { icon: <RotateCcw size={20} />, onClick: handleClearClick, label: "Clear" },
    { icon: <Save size={20} />, onClick: handleSave, label: "Save" },
    { icon: <Download size={20} />, onClick: () => setShowExportDialog(true), label: "Export" },
    { icon: <Layers size={20} />, onClick: () => setShowLayerPanel(!showLayerPanel), label: "Layers" },
  ]

  return (
    <div className="mt-6 flex flex-col lg:flex-row max-w-full gap-4" ref={canvasContainerRef}>
      {/* Advanced Toolbar */}
      <div className="hidden lg:block">
        <AdvancedToolbar
          selectedTool={selectedTool}
          onToolChange={handleToolChange}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          opacity={opacity}
          onOpacityChange={setOpacity}
          strokeColor={strokeColor}
          onStrokeColorChange={handleStrokeColorChange}
          showGrid={showGrid}
          onGridToggle={() => setShowGrid(!showGrid)}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative">
        {/* Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />
        )}

        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
          <ReactSketchCanvas
            width="100%"
            height="530px"
            ref={canvasRef}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
           canvasColor={theme === "dark" ? "#222" : "transparent"}
            className="!rounded-none !border-border"
            onStroke={handleStrokeEnd}
          />
        </div>
      </div>

      {/* Layer Panel */}
      <AnimatePresence>
        {showLayerPanel && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="hidden lg:block"
          >
            <LayerPanel
              layers={layers}
              activeLayerId={activeLayerId}
              onLayerSelect={setActiveLayerId}
              onLayerAdd={handleLayerAdd}
              onLayerDelete={handleLayerDelete}
              onLayerDuplicate={handleLayerDuplicate}
              onLayerRename={handleLayerRename}
              onLayerVisibilityToggle={handleLayerVisibilityToggle}
              onLayerLockToggle={handleLayerLockToggle}
              onLayerOpacityChange={handleLayerOpacityChange}
              onLayerReorder={handleLayerReorder}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Toolbar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3 flex items-center justify-center gap-4">
        {/* Color Picker */}
        <Button size="icon" onClick={() => colorInputRef.current?.click()} style={{ backgroundColor: strokeColor }}>
          <input
            type="color"
            ref={colorInputRef}
            className="sr-only"
            value={strokeColor}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
          />
        </Button>

        {/* Pen/Eraser */}
        <Button size="icon" variant="outline" disabled={selectedTool !== "eraser"} onClick={handlePenClick}>
          <Pen size={22} />
        </Button>
        <Button size="icon" variant="outline" disabled={selectedTool !== "pen"} onClick={handleEraserClick}>
          <Eraser size={22} />
        </Button>

        {/* Actions Toggle */}
        <div className="relative">
          <Button size="icon" variant="outline" onClick={() => setShowActions(!showActions)}>
            {showActions ? <X size={22} /> : <Plus size={22} />}
          </Button>

          {/* Popup Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg p-3 flex gap-3 border border-border"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {actionButtons.map((btn, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Button size="icon" variant="outline" onClick={btn.onClick} title={btn.label}>
                      {btn.icon}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExport}
        defaultWidth={800}
        defaultHeight={530}
      />
    </div>
  )
}
