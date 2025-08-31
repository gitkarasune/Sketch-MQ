"use client"

import { useState } from "react"
import { useProjects, type Project } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {toast} from "sonner"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MoreVertical, Edit, Copy, Trash2, Eye, Users, Calendar, Folder, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ProjectGridProps {
  projects: Project[]
  showFolder?: boolean
}

export default function ProjectGrid({ projects, showFolder = false }: ProjectGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", description: "", tags: "" })
  const { updateProject, deleteProject, duplicateProject } = useProjects()
  const router = useRouter()

  const handleEdit = (project: Project) => {
    setSelectedProject(project)
    setEditForm({
      name: project.name,
      description: project.description || "",
      tags: project.tags.join(", "),
    })
    setShowEditDialog(true)
  }

  const handleEditSubmit = async () => {
    if (!selectedProject) return

    try {
      await updateProject(selectedProject.id, {
        name: editForm.name,
        description: editForm.description,
        tags: editForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      })
      setShowEditDialog(false)
      toast.success("Your project has been updated successfully")
    } catch (error) {
      toast.error("Failed to update project")
    }
  }

  const handleDuplicate = async (project: Project) => {
    try {
      const duplicated = await duplicateProject(project.id)
      toast.success(`Created "${duplicated.name}"`)
    } catch (error) {
      toast.error("Failed to duplicate project")
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return

    try {
      await deleteProject(selectedProject.id)
      setShowDeleteDialog(false)
      toast.success("Your project has been deleted")
    } catch (error) {
      toast.error("Failed to delete project")
    }
  }

  const openProject = (project: Project) => {
    router.push(`/project/${project.id}`)
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">No projects found</div>
        <Button onClick={() => router.push("/project/new")}>Create your first project</Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="text-sm mt-1 line-clamp-2">{project.description}</CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openProject(project)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(project)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedProject(project)
                            setShowDeleteDialog(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent onClick={() => openProject(project)}>
                  {/* Thumbnail */}
                  <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail || "/placeholder.svg"}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">No preview</div>
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="space-y-3">
                    {/* Tags */}
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Collaborators */}
                    {project.collaborators.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <div className="flex -space-x-1">
                          {project.collaborators.slice(0, 3).map((collaborator) => (
                            <Avatar key={collaborator.userId} className="h-5 w-5 border border-background">
                              <AvatarImage src={collaborator.userAvatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {collaborator.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.collaborators.length > 3 && (
                            <div className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">+{project.collaborators.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-2">
                        {project.isPublic && <Eye className="h-3 w-3" />}
                        {showFolder && project.folderId && <Folder className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update your project details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e: any) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e: any) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e: any) => setEditForm({ ...editForm, tags: e.target.value })}
                placeholder="design, sketch, wireframe"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
