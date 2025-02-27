import { jwtVerify, SignJWT, } from "jose";


export interface UserJWT {
  userId: string;
  email: string;
  name: string;
}

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY || "");

// Generate a JWT token
export const generateToken = async (payload: Record<string, any>, expiresIn: string = "1h") => {
  return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiresIn).sign(SECRET_KEY);
};

// Verify a JWT token
export const verifyToken = async (token: string) => {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload as Record<string, any>;
};