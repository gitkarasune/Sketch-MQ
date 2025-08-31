import ProtectedRoute from "@/components/auth/protected-route"
import RoomManager from "@/components/collaborative/room-manager"
import UserPresence from "@/components/collaborative/user-presence"
import CollaborativeCursors from "@/components/collaborative/collaborative-cursor"
import Canvas from "@/components/canvas"

export default function CollaboratePage() {
  return (
    <ProtectedRoute>
      <section className="py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Collaborative Sketching</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Create together in real-time. See live cursors, share ideas, and build amazing sketches with your team.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <RoomManager />
            </div>
            <div className="lg:col-span-3">
              <Canvas />
            </div>
          </div>
        </div>
      </section>

      <UserPresence />
      <CollaborativeCursors />
    </ProtectedRoute>
  )
}
