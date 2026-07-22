import { NextRequest } from "next/server";
import { auth } from "@/shared/auth";
import type { AuthPayload } from "@/shared/auth";
import { UnauthorizedError } from "@/shared/errors";

export async function getAuthPayload(request: NextRequest): Promise<AuthPayload> {
  const authHeader = request.headers.get("authorization");
  const token = auth.extractBearerToken(authHeader);
  if (!token) {
    throw new UnauthorizedError();
  }
  return auth.verifyToken(token);
}
