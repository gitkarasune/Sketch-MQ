"use client"

import { useCollaboration } from "@/lib/collaboration"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Wifi, WifiOff } from "lucide-react"

export default function UserPresence() {
  const { connectedUsers, isConnected, currentRoom } = useCollaboration()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!currentRoom) return null

  return (
    <div className="fixed top-20 right-4 z-40">
      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">{connectedUsers.length} online</span>
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {connectedUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="relative">
                        <Avatar className="h-8 w-8 border-2" style={{ borderColor: user.color }}>
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback
                            className="text-xs font-medium text-white"
                            style={{ backgroundColor: user.color }}
                          >
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        {user.isDrawing && (
                          <div
                            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                            style={{ backgroundColor: user.color }}
                          />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user.name}</p>
                      {user.isDrawing && <p className="text-xs text-muted-foreground">Drawing...</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  {user.isDrawing && (
                    <Badge variant="secondary" className="text-xs">
                      Drawing
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
