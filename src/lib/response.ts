import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly code: string;
  readonly message: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** CORS headers applied to every API response */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

function withCors<T>(response: NextResponse<T>): NextResponse<T> {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return withCors(NextResponse.json({ success: true, data }, { status }));
}

export function errorResponse(
  code: string,
  message: string,
  status = 500
): NextResponse<ApiErrorResponse> {
  return withCors(NextResponse.json({ success: false, code, message }, { status }));
}

/** Handle CORS preflight (OPTIONS) requests — call this for all API routes */
export function corsPreflight(): NextResponse {
  return withCors(NextResponse.json(null, { status: 204 }));
}
