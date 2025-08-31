import { cookies } from "next/headers";
import { getUserFromToken } from "@/lib/get-users-from-token";

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const user = getUserFromToken(token);
  return user;
}