import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/user";
import connectSketchMQDatabase from "@/lib/mongodb";
import type { JwtPayload } from "@/lib/get-users-from-token";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: NextRequest) {
  await connectSketchMQDatabase();
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ user: null });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(payload.userId).select("-password");
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}