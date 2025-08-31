"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useProjects } from "@/lib/projects"
import ProtectedRoute from "@/components/auth/protected-route"
import Canvas from "@/components/canvas"
import UserPresence from "@/components/collaborative/user-presence"
import CollaborativeCursors from "@/components/collaborative/collaborative-cursor"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Share, Settings } from "lucide-react"
import { formatDistanceToNow } from "date-fns" 

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const { loadProject, currentProject, saveProject } = useProjects()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const projectId = params.id as string
    if (projectId) {
      loadProjectData(projectId)
    }
  }, [params.id])

  const loadProjectData = async (projectId: string) => {
    setIsLoading(true)
    try {
      await loadProject(projectId)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive",
      })
      router.push("/projects")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentProject) return

    setIsSaving(true)
    try {
      // In a real implementation, you'd get the canvas data from the Canvas component
      await saveProject(currentProject.id, {}, [])
      toast({
        title: "Project saved",
        description: "Your changes have been saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading project...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!currentProject) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Project not found</h1>
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist</p>
            <Button onClick={() => router.push("/projects")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Project Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-16 z-40">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Projects
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">{currentProject.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Last updated {formatDistanceToNow(new Date(currentProject.updatedAt), { addSuffix: true })}
                    </span>
                    {currentProject.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {currentProject.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <Canvas />
        </div>

        {/* Collaboration Components */}
        <UserPresence />
        <CollaborativeCursors />
      </div>
    </ProtectedRoute>
  )
}
