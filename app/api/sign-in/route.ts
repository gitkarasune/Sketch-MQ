import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import { User } from "@/models/user";
import connectSketchMQDatabase from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
  await connectSketchMQDatabase();
  const { email, password } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Password didn't match" }, { status: 401 });
  }

  // Create JWT
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set cookie
  const res = NextResponse.json({
    message: "Signed in",
    user: {
      email: user.email,
      name: user.name,
    }
  });
  res.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return res;
}