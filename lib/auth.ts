import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export type AuthPayload = {
  userId: string;
  email: string;
  role: "user" | "admin";
};

const secretText = process.env.JWT_SECRET;

if (!secretText) {
  throw new Error(
    "JWT_SECRET is missing. Add it to your .env.local file."
  );
}

const secret = new TextEncoder().encode(secretText);

export async function createToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(
  token: string
): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as "user" | "admin",
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("novavest_token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}