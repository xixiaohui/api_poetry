import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";
import { UnauthorizedError } from "../errors";

export interface AuthPayload {
  readonly sub: string;
  readonly email: string;
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(config.jwtSecret);
}

export const auth = {
  async signToken(payload: AuthPayload): Promise<string> {
    return new SignJWT({ email: payload.email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(getSecretKey());
  },

  async verifyToken(token: string): Promise<AuthPayload> {
    try {
      const { payload } = await jwtVerify(token, getSecretKey());
      const sub = payload.sub;
      const email = payload.email as string | undefined;
      if (!sub || !email) {
        throw new UnauthorizedError();
      }
      return { sub, email };
    } catch {
      throw new UnauthorizedError();
    }
  },

  extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer") return null;
    return parts[1] ?? null;
  },
};
