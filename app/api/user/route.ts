import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/user";
import connectSketchMQDatabase from "@/lib/mongodb";
import { getUserFromToken } from "@/lib/get-users-from-token";

export async function GET(req: NextRequest) {
  await connectSketchMQDatabase();
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ user: null });

  const payload = getUserFromToken(token);
  if (!payload) return NextResponse.json({ user: null });

  const user = await User.findById(payload.userId).select("-password");
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user });
}