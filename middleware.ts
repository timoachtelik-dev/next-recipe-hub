import { NextRequest, NextResponse } from "next/server";
import { MAX_API_BODY_BYTES, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from "@/lib/limits";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientKey(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.ip ?? "unknown";
}

function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      ok: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt,
    };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;

  return {
    ok: true,
    remaining: Math.max(RATE_LIMIT_MAX - entry.count, 0),
    resetAt: entry.resetAt,
  };
}

function withRateLimitHeaders(response: NextResponse, limit: number, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", Math.max(remaining, 0).toString());
  response.headers.set("X-RateLimit-Reset", Math.ceil(resetAt / 1000).toString());
  return response;
}

export function middleware(request: NextRequest) {
  const method = request.method.toUpperCase();

  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentLength = request.headers.get("content-length");
    const size = contentLength ? Number(contentLength) : 0;

    if (Number.isFinite(size) && size > MAX_API_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body too large." },
        { status: 413 }
      );
    }
  }

  const clientKey = getClientKey(request);
  const rateLimit = checkRateLimit(clientKey);

  if (!rateLimit.ok) {
    const response = NextResponse.json(
      { error: "Too many requests." },
      { status: 429 }
    );
    response.headers.set("Retry-After", Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString());
    return withRateLimitHeaders(response, RATE_LIMIT_MAX, rateLimit.remaining, rateLimit.resetAt);
  }

  const response = NextResponse.next();
  return withRateLimitHeaders(response, RATE_LIMIT_MAX, rateLimit.remaining, rateLimit.resetAt);
}

export const config = {
  matcher: ["/api/:path*"],
};
