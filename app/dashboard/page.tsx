import ProtectedRoute from "@/components/auth/protected-route"
import Canvas from "@/components/canvas"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <section className="py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Your Creative Workspace</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Start sketching, collaborate with others, and bring your ideas to life.
            </p>
          </div>

          <Canvas />
        </div>
      </section>
    </ProtectedRoute>
  )
}
