import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { AppError, ValidationError } from "@/lib/errors";

export type IdRouteContext = { params: Promise<{ id: string }> };

type ErrorBody = {
  error: { code: string; message: string; details?: { field: string; message: string }[] };
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

function errorResponse(status: number, error: ErrorBody["error"]) {
  return NextResponse.json<ErrorBody>({ error }, { status });
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return errorResponse(error.status, {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return errorResponse(409, { code: "CONFLICT", message: "Zasób już istnieje" });
  }
  console.error(error);
  return errorResponse(500, { code: "INTERNAL_ERROR", message: "Wewnętrzny błąd serwera" });
}

export function withErrorHandling<A extends unknown[]>(handler: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError([
      { field: "body", message: "Treść żądania musi być poprawnym obiektem JSON" },
    ]);
  }
}

export async function readId({ params }: IdRouteContext): Promise<number> {
  const { id } = await params;
  const value = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(value) || value < 1) {
    throw new ValidationError([
      { field: "id", message: "Identyfikator musi być dodatnią liczbą całkowitą" },
    ]);
  }
  return value;
}
