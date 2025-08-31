"use client"

import { useState } from "react"
import { useCollaboration } from "@/lib/collaboration"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Copy, Plus, Users, Lock, Globe } from "lucide-react"
import {toast} from "sonner"

export default function RoomManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [joinRoomId, setJoinRoomId] = useState("")
  const { currentRoom, createRoom, joinRoom, leaveRoom, connectedUsers } = useCollaboration()

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return

    setIsCreating(true)
    try {
      const roomId = await createRoom(roomName, isPrivate)
      joinRoom(roomId)
      setIsCreateDialogOpen(false)
      setRoomName("")
      setIsPrivate(false)
      toast.success(`Successfully created room "${roomName}"`)
    } catch (error) {
      toast.error("Failed to create room. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) return
    joinRoom(joinRoomId)
    setJoinRoomId("")
  }

  const handleLeaveRoom = () => {
    leaveRoom()
    toast.success("You have left the collaboration room")
  }

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id)
      toast.success("Room ID copied to clipboard")
    }
  }

  if (currentRoom) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentRoom.isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                {currentRoom.name}
              </CardTitle>
              <CardDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="h-3 w-3" />
                  {connectedUsers.length} collaborator{connectedUsers.length !== 1 ? "s" : ""}
                </div>
              </CardDescription>
            </div>
            <Badge variant={currentRoom.isPrivate ? "secondary" : "default"}>
              {currentRoom.isPrivate ? "Private" : "Public"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Room ID</Label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">{currentRoom.id}</code>
              <Button size="sm" variant="outline" onClick={copyRoomId}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button variant="destructive" onClick={handleLeaveRoom} className="w-full">
            Leave Room
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Collaboration</CardTitle>
        <CardDescription>Create or join a room to collaborate with others</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collaboration Room</DialogTitle>
              <DialogDescription>Set up a new room for collaborative sketching</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="Enter room name"
                  value={roomName}
                  onChange={(e: any) => setRoomName(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} />
                <Label htmlFor="private">Private room</Label>
              </div>
              <Button onClick={handleCreateRoom} disabled={isCreating || !roomName.trim()} className="w-full">
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="joinRoom">Join Existing Room</Label>
          <div className="flex gap-2">
            <Input
              id="joinRoom"
              placeholder="Enter room ID"
              value={joinRoomId}
              onChange={(e: any) => setJoinRoomId(e.target.value)}
            />
            <Button onClick={handleJoinRoom} disabled={!joinRoomId.trim()}>
              Join
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
