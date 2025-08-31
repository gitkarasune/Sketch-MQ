import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "jwt/secretKEY=987654321??=>[()]():KEY";

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function getUserFromToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}