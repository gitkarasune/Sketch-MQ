import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/models/user";
import connectSketchMQDatabase from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  await connectSketchMQDatabase();
  const { name, email, password } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashed })

  return NextResponse.json({ message: "Account created", user: { email: user.email, name: user.name } });
  
}