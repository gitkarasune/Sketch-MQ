"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/lib/auth"

export interface Project {
  id: string
  name: string
  description?: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
  ownerId: string
  isPublic: boolean
  tags: string[]
  folderId?: string
  collaborators: ProjectCollaborator[]
  canvasData?: any
  layers?: any[]
  settings: ProjectSettings
}

export interface ProjectCollaborator {
  userId: string
  userName: string
  userAvatar?: string
  role: "owner" | "editor" | "viewer"
  addedAt: string
}

export interface ProjectSettings {
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  gridEnabled: boolean
  snapToGrid: boolean
  autoSave: boolean
}

export interface ProjectFolder {
  id: string
  name: string
  parentId?: string
  createdAt: string
  projectCount: number
}

interface ProjectContextType {
  projects: Project[]
  folders: ProjectFolder[]
  currentProject: Project | null
  isLoading: boolean
  createProject: (name: string, description?: string, folderId?: string) => Promise<Project>
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  duplicateProject: (projectId: string) => Promise<Project>
  loadProject: (projectId: string) => Promise<Project>
  saveProject: (projectId: string, canvasData: any, layers?: any[]) => Promise<void>
  shareProject: (projectId: string, userId: string, role: ProjectCollaborator["role"]) => Promise<void>
  createFolder: (name: string, parentId?: string) => Promise<ProjectFolder>
  deleteFolder: (folderId: string) => Promise<void>
  moveProject: (projectId: string, folderId?: string) => Promise<void>
  searchProjects: (query: string) => Project[]
  getRecentProjects: (limit?: number) => Project[]
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [folders, setFolders] = useState<ProjectFolder[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadUserProjects()
    }
  }, [user])

  const loadUserProjects = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - replace with actual API
      const response = await fetch(`/api/projects?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
        setFolders(data.folders || [])
      }
    } catch (error) {
      console.error("Failed to load projects:", error)
      // Load from localStorage as fallback
      const savedProjects = localStorage.getItem(`projects_${user?.id}`)
      const savedFolders = localStorage.getItem(`folders_${user?.id}`)
      if (savedProjects) setProjects(JSON.parse(savedProjects))
      if (savedFolders) setFolders(JSON.parse(savedFolders))
    } finally {
      setIsLoading(false)
    }
  }

  const saveToStorage = (newProjects: Project[], newFolders?: ProjectFolder[]) => {
    if (user) {
      localStorage.setItem(`projects_${user.id}`, JSON.stringify(newProjects))
      if (newFolders) {
        localStorage.setItem(`folders_${user.id}`, JSON.stringify(newFolders))
      }
    }
  }

  const createProject = async (name: string, description?: string, folderId?: string): Promise<Project> => {
    if (!user) throw new Error("User not authenticated")

    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: user.id,
      isPublic: false,
      tags: [],
      folderId,
      collaborators: [
        {
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          role: "owner",
          addedAt: new Date().toISOString(),
        },
      ],
      settings: {
        canvasWidth: 800,
        canvasHeight: 600,
        backgroundColor: "#ffffff",
        gridEnabled: false,
        snapToGrid: false,
        autoSave: true,
      },
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      })

      if (!response.ok) throw new Error("Failed to create project")

      const updatedProjects = [...projects, newProject]
      setProjects(updatedProjects)
      saveToStorage(updatedProjects)
      return newProject
    } catch (error) {
      // Fallback to local storage
      const updatedProjects = [...projects, newProject]
      setProjects(updatedProjects)
      saveToStorage(updatedProjects)
      return newProject
    }
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update project")
    } catch (error) {
      console.error("API update failed, using local storage")
    }

    const updatedProjects = projects.map((p) =>
      p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
    )
    setProjects(updatedProjects)
    saveToStorage(updatedProjects)

    if (currentProject?.id === projectId) {
      setCurrentProject({ ...currentProject, ...updates })
    }
  }

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete project")
    } catch (error) {
      console.error("API delete failed, using local storage")
    }

    const updatedProjects = projects.filter((p) => p.id !== projectId)
    setProjects(updatedProjects)
    saveToStorage(updatedProjects)

    if (currentProject?.id === projectId) {
      setCurrentProject(null)
    }
  }

  const duplicateProject = async (projectId: string): Promise<Project> => {
    const originalProject = projects.find((p) => p.id === projectId)
    if (!originalProject || !user) throw new Error("Project not found or user not authenticated")

    const duplicatedProject: Project = {
      ...originalProject,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${originalProject.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      collaborators: [
        {
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          role: "owner",
          addedAt: new Date().toISOString(),
        },
      ],
    }

    const updatedProjects = [...projects, duplicatedProject]
    setProjects(updatedProjects)
    saveToStorage(updatedProjects)
    return duplicatedProject
  }

  const loadProject = async (projectId: string): Promise<Project> => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) throw new Error("Project not found")

    setCurrentProject(project)
    return project
  }

  const saveProject = async (projectId: string, canvasData: any, layers?: any[]) => {
    await updateProject(projectId, {
      canvasData,
      layers,
      updatedAt: new Date().toISOString(),
    })
  }

  const shareProject = async (projectId: string, userId: string, role: ProjectCollaborator["role"]) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) throw new Error("Project not found")

    const newCollaborator: ProjectCollaborator = {
      userId,
      userName: "Unknown User", // Would be fetched from user API
      role,
      addedAt: new Date().toISOString(),
    }

    const updatedCollaborators = [...project.collaborators, newCollaborator]
    await updateProject(projectId, { collaborators: updatedCollaborators })
  }

  const createFolder = async (name: string, parentId?: string): Promise<ProjectFolder> => {
    const newFolder: ProjectFolder = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      parentId,
      createdAt: new Date().toISOString(),
      projectCount: 0,
    }

    const updatedFolders = [...folders, newFolder]
    setFolders(updatedFolders)
    saveToStorage(projects, updatedFolders)
    return newFolder
  }

  const deleteFolder = async (folderId: string) => {
    // Move projects out of folder before deleting
    const projectsInFolder = projects.filter((p) => p.folderId === folderId)
    for (const project of projectsInFolder) {
      await updateProject(project.id, { folderId: undefined })
    }

    const updatedFolders = folders.filter((f) => f.id !== folderId)
    setFolders(updatedFolders)
    saveToStorage(projects, updatedFolders)
  }

  const moveProject = async (projectId: string, folderId?: string) => {
    await updateProject(projectId, { folderId })
  }

  const searchProjects = (query: string): Project[] => {
    const lowercaseQuery = query.toLowerCase()
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowercaseQuery) ||
        project.description?.toLowerCase().includes(lowercaseQuery) ||
        project.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
    )
  }

  const getRecentProjects = (limit = 10): Project[] => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        folders,
        currentProject,
        isLoading,
        createProject,
        updateProject,
        deleteProject,
        duplicateProject,
        loadProject,
        saveProject,
        shareProject,
        createFolder,
        deleteFolder,
        moveProject,
        searchProjects,
        getRecentProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider")
  }
  return context
}
