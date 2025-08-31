"use client"

import { useCollaboration } from "@/lib/collaboration"
import { motion, AnimatePresence } from "framer-motion"
import { MousePointer2 } from "lucide-react"

export default function CollaborativeCursors() {
  const { connectedUsers } = useCollaboration()

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <AnimatePresence>
        {connectedUsers
          .filter((user) => user.cursor)
          .map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              style={{
                left: user.cursor!.x,
                top: user.cursor!.y,
                color: user.color,
              }}
              className="absolute transform -translate-x-1 -translate-y-1"
            >
              <MousePointer2 className="h-5 w-5 drop-shadow-lg" fill="currentColor" />
              <div
                className="absolute top-5 left-2 px-2 py-1 rounded text-xs font-medium text-white shadow-lg whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}
