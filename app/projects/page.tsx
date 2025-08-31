"use client"

import { useState } from "react"
import { useProjects } from "@/lib/projects"
import ProtectedRoute from "@/components/auth/protected-route"
import ProjectGrid from "@/components/projects/project-grid"
import CreateProjectDialog from "@/components/projects/create-project-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Plus, Search, Clock, Star, Users, Folder } from "lucide-react"

export default function ProjectsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { projects, folders, searchProjects, getRecentProjects, isLoading } = useProjects()

  const recentProjects = getRecentProjects(6)
  const searchResults = searchQuery ? searchProjects(searchQuery) : []
  const publicProjects = projects.filter((p) => p.isPublic)
  const collaborativeProjects = projects.filter((p) => p.collaborators.length > 1)

  const stats = [
    { label: "Total Projects", value: projects.length, icon: Folder },
    { label: "Recent", value: recentProjects.length, icon: Clock },
    { label: "Collaborative", value: collaborativeProjects.length, icon: Users },
    { label: "Public", value: publicProjects.length, icon: Star },
  ]

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Projects</h1>
            <p className="text-muted-foreground">Manage and organize your creative work</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Results ({searchResults.length})</h2>
            <ProjectGrid projects={searchResults} showFolder />
            <Separator className="mt-8" />
          </div>
        )}

        {/* Project Tabs */}
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Recently Updated</h2>
              <p className="text-muted-foreground">Projects you've worked on recently</p>
            </div>
            <ProjectGrid projects={recentProjects} />
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">All Projects</h2>
              <p className="text-muted-foreground">All your projects in one place</p>
            </div>
            <ProjectGrid projects={projects} showFolder />
          </TabsContent>

          <TabsContent value="collaborative" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Collaborative Projects</h2>
              <p className="text-muted-foreground">Projects you're working on with others</p>
            </div>
            <ProjectGrid projects={collaborativeProjects} />
          </TabsContent>

          <TabsContent value="public" className="mt-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Public Projects</h2>
              <p className="text-muted-foreground">Projects visible to everyone</p>
            </div>
            <ProjectGrid projects={publicProjects} />
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {projects.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No projects yet</CardTitle>
              <CardDescription>Create your first project to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </ProtectedRoute>
  )
}
