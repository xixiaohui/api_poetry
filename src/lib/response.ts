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

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 500
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, code, message }, { status });
}
