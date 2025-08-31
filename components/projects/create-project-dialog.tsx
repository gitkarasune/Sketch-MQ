"use client"

import { useState } from "react"
import { useProjects } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {toast} from "sonner"
import { useRouter } from "next/navigation"
import { FileText, Palette, Layout, Smartphone, Monitor } from "lucide-react"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PROJECT_TEMPLATES = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start with a clean slate",
    icon: FileText,
    settings: {
      canvasWidth: 800,
      canvasHeight: 600,
      backgroundColor: "#ffffff",
    },
  },
  {
    id: "mobile",
    name: "Mobile App",
    description: "Mobile app design template",
    icon: Smartphone,
    settings: {
      canvasWidth: 375,
      canvasHeight: 812,
      backgroundColor: "#f8f9fa",
    },
  },
  {
    id: "desktop",
    name: "Desktop App",
    description: "Desktop application template",
    icon: Monitor,
    settings: {
      canvasWidth: 1440,
      canvasHeight: 900,
      backgroundColor: "#ffffff",
    },
  },
  {
    id: "wireframe",
    name: "Wireframe",
    description: "Low-fidelity wireframe template",
    icon: Layout,
    settings: {
      canvasWidth: 1200,
      canvasHeight: 800,
      backgroundColor: "#f5f5f5",
    },
  },
  {
    id: "artwork",
    name: "Digital Art",
    description: "High-resolution canvas for artwork",
    icon: Palette,
    settings: {
      canvasWidth: 2048,
      canvasHeight: 2048,
      backgroundColor: "#ffffff",
    },
  },
]

export default function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [step, setStep] = useState<"template" | "details">("template")
  const [selectedTemplate, setSelectedTemplate] = useState(PROJECT_TEMPLATES[0])
  const [projectDetails, setProjectDetails] = useState({
    name: "",
    description: "",
    tags: "",
    folderId: "",
  })
  const [isCreating, setIsCreating] = useState(false)
  const { createProject, folders } = useProjects()
  const router = useRouter()

  const handleTemplateSelect = (template: (typeof PROJECT_TEMPLATES)[0]) => {
    setSelectedTemplate(template)
    setStep("details")
  }

  const handleCreate = async () => {
    if (!projectDetails.name.trim()) {
      toast.error("Project name is required")
      return
    }

    setIsCreating(true)
    try {
      const project = await createProject(
        projectDetails.name,
        projectDetails.description,
        projectDetails.folderId || undefined,
      )

      // Update project with template settings and tags
      const tags = projectDetails.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)

      await project // This would be an updateProject call in real implementation

      toast.success(`"${project.name}" has been created successfully`)

      onOpenChange(false)
      router.push(`/project/${project.id}`)
    } catch (error) {
      toast.error("Failed to create project")
    } finally {
      setIsCreating(false)
    }
  }

  const resetDialog = () => {
    setStep("template")
    setSelectedTemplate(PROJECT_TEMPLATES[0])
    setProjectDetails({
      name: "",
      description: "",
      tags: "",
      folderId: "",
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open: any) => {
        onOpenChange(open)
        if (!open) resetDialog()
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            {step === "template" ? "Choose a template to get started" : "Add project details"}
          </DialogDescription>
        </DialogHeader>

        {step === "template" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROJECT_TEMPLATES.map((template) => {
              const Icon = template.icon
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <CardDescription className="text-xs">{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      {template.settings.canvasWidth} × {template.settings.canvasHeight}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {step === "details" && (
          <div className="space-y-6">
            {/* Selected Template */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <selectedTemplate.icon className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-sm">{selectedTemplate.name}</CardTitle>
                      <CardDescription className="text-xs">{selectedTemplate.description}</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep("template")}>
                    Change
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Project Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="My awesome project"
                    value={projectDetails.name}
                    onChange={(e: any) => setProjectDetails({ ...projectDetails, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="projectDescription">Description</Label>
                  <Textarea
                    id="projectDescription"
                    placeholder="Describe your project..."
                    rows={3}
                    value={projectDetails.description}
                    onChange={(e: any) => setProjectDetails({ ...projectDetails, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectTags">Tags</Label>
                  <Input
                    id="projectTags"
                    placeholder="design, wireframe, mobile"
                    value={projectDetails.tags}
                    onChange={(e: any) => setProjectDetails({ ...projectDetails, tags: e.target.value })}
                  />
                  <div className="text-xs text-muted-foreground mt-1">Separate tags with commas</div>
                </div>

                {folders.length > 0 && (
                  <div>
                    <Label htmlFor="projectFolder">Folder (Optional)</Label>
                    <Select
                      value={projectDetails.folderId}
                      onValueChange={(value: any) => setProjectDetails({ ...projectDetails, folderId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No folder</SelectItem>
                        {folders.map((folder) => (
                          <SelectItem key={folder.id} value={folder.id}>
                            {folder.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Settings Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Canvas Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="outline">
                    {selectedTemplate.settings.canvasWidth} {"×"} {selectedTemplate.settings.canvasHeight}
                  </Badge>
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: selectedTemplate.settings.backgroundColor }}
                  />
                  <span className="text-muted-foreground">{selectedTemplate.settings.backgroundColor}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("template")}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
