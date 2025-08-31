"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "@/lib/auth"

export interface CollaborativeUser {
  id: string
  name: string
  avatar?: string
  color: string
  cursor?: { x: number; y: number }
  isDrawing: boolean
}

export interface DrawingEvent {
  type: "stroke" | "erase" | "clear"
  data: any
  userId: string
  timestamp: number
}

export interface Room {
  id: string
  name: string
  users: CollaborativeUser[]
  isPrivate: boolean
  createdBy: string
}

interface CollaborationContextType {
  socket: Socket | null
  currentRoom: Room | null
  connectedUsers: CollaborativeUser[]
  isConnected: boolean
  joinRoom: (roomId: string) => void
  leaveRoom: () => void
  createRoom: (name: string, isPrivate?: boolean) => Promise<string>
  sendDrawingEvent: (event: DrawingEvent) => void
  sendCursorPosition: (x: number, y: number) => void
  onDrawingEvent: (callback: (event: DrawingEvent) => void) => void
  onUserJoined: (callback: (user: CollaborativeUser) => void) => void
  onUserLeft: (callback: (userId: string) => void) => void
  onCursorMove: (callback: (userId: string, x: number, y: number) => void) => void
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined)

const USER_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
]

export function CollaborationProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [connectedUsers, setConnectedUsers] = useState<CollaborativeUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()
  const drawingEventCallbacks = useRef<((event: DrawingEvent) => void)[]>([])
  const userJoinedCallbacks = useRef<((user: CollaborativeUser) => void)[]>([])
  const userLeftCallbacks = useRef<((userId: string) => void)[]>([])
  const cursorMoveCallbacks = useRef<((userId: string, x: number, y: number) => void)[]>([])

  useEffect(() => {
    if (!user) return

    // Initialize Socket.IO connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      auth: {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
      },
    })

    newSocket.on("connect", () => {
      console.log("[v0] Connected to collaboration server")
      setIsConnected(true)
    })

    newSocket.on("disconnect", () => {
      console.log("[v0] Disconnected from collaboration server")
      setIsConnected(false)
    })

    newSocket.on("room-joined", (room: Room) => {
      console.log("[v0] Joined room:", room)
      setCurrentRoom(room)
      setConnectedUsers(room.users)
    })

    newSocket.on("room-left", () => {
      console.log("[v0] Left room")
      setCurrentRoom(null)
      setConnectedUsers([])
    })

    newSocket.on("user-joined", (user: CollaborativeUser) => {
      console.log("[v0] User joined:", user)
      setConnectedUsers((prev) => [...prev.filter((u) => u.id !== user.id), user])
      userJoinedCallbacks.current.forEach((callback) => callback(user))
    })

    newSocket.on("user-left", (userId: string) => {
      console.log("[v0] User left:", userId)
      setConnectedUsers((prev) => prev.filter((u) => u.id !== userId))
      userLeftCallbacks.current.forEach((callback) => callback(userId))
    })

    newSocket.on("drawing-event", (event: DrawingEvent) => {
      console.log("[v0] Received drawing event:", event.type)
      drawingEventCallbacks.current.forEach((callback) => callback(event))
    })

    newSocket.on("cursor-move", ({ userId, x, y }: { userId: string; x: number; y: number }) => {
      setConnectedUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, cursor: { x, y } } : user)))
      cursorMoveCallbacks.current.forEach((callback) => callback(userId, x, y))
    })

    newSocket.on("users-updated", (users: CollaborativeUser[]) => {
      setConnectedUsers(users)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [user])

  const joinRoom = (roomId: string) => {
    if (socket && user) {
      const userColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]
      socket.emit("join-room", {
        roomId,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          color: userColor,
          isDrawing: false,
        },
      })
    }
  }

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit("leave-room", currentRoom.id)
    }
  }

  const createRoom = async (name: string, isPrivate = false): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (socket && user) {
        socket.emit("create-room", { name, isPrivate, createdBy: user.id }, (response: any) => {
          if (response.success) {
            resolve(response.roomId)
          } else {
            reject(new Error(response.error))
          }
        })
      } else {
        reject(new Error("Not connected"))
      }
    })
  }

  const sendDrawingEvent = (event: DrawingEvent) => {
    if (socket && currentRoom) {
      socket.emit("drawing-event", {
        roomId: currentRoom.id,
        event,
      })
    }
  }

  const sendCursorPosition = (x: number, y: number) => {
    if (socket && currentRoom) {
      socket.emit("cursor-move", {
        roomId: currentRoom.id,
        x,
        y,
      })
    }
  }

  const onDrawingEvent = (callback: (event: DrawingEvent) => void) => {
    drawingEventCallbacks.current.push(callback)
    return () => {
      drawingEventCallbacks.current = drawingEventCallbacks.current.filter((cb) => cb !== callback)
    }
  }

  const onUserJoined = (callback: (user: CollaborativeUser) => void) => {
    userJoinedCallbacks.current.push(callback)
    return () => {
      userJoinedCallbacks.current = userJoinedCallbacks.current.filter((cb) => cb !== callback)
    }
  }

  const onUserLeft = (callback: (userId: string) => void) => {
    userLeftCallbacks.current.push(callback)
    return () => {
      userLeftCallbacks.current = userLeftCallbacks.current.filter((cb) => cb !== callback)
    }
  }

  const onCursorMove = (callback: (userId: string, x: number, y: number) => void) => {
    cursorMoveCallbacks.current.push(callback)
    return () => {
      cursorMoveCallbacks.current = cursorMoveCallbacks.current.filter((cb) => cb !== callback)
    }
  }

  return (
    <CollaborationContext.Provider
      value={{
        socket,
        currentRoom,
        connectedUsers,
        isConnected,
        joinRoom,
        leaveRoom,
        createRoom,
        sendDrawingEvent,
        sendCursorPosition,
        onDrawingEvent,
        onUserJoined,
        onUserLeft,
        onCursorMove,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  )
}

export function useCollaboration() {
  const context = useContext(CollaborationContext)
  if (context === undefined) {
    throw new Error("useCollaboration must be used within a CollaborationProvider")
  }
  return context
}
