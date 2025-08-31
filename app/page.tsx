import Canvas from "@/components/canvas"

export default function Home() {
  return (
    <section className="py-28">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">Professional Sketch Studio</h1>
          <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Create, collaborate, and bring your ideas to life with our advanced drawing tools and real-time
            collaboration features.
          </p>
        </div>

        <Canvas />
      </div>
    </section>
  )
}
