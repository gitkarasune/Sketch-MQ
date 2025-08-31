export const runtime = 'nodejs';
import connectSketchMQDatabase from "@/lib/mongodb"; 

export async function GET() {

  try {
    await connectSketchMQDatabase();
    console.log("MongoDB connected!");
    return new Response('MongoDB connected!'); 

  } catch (error) {

    console.error("MongoDB connection error:", error);
    return new Response('MongoDB connection error: ' + error, { status: 500 });

  }
}
