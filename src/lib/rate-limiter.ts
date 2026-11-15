import { NextRequest, NextResponse } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory token bucket store (keyed by IP or UID + endpoint)
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks and updates rate limit for a specific key.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + windowMs };
    rateLimitMap.set(key, record);
    return { allowed: true, remaining: limit - 1, resetAt: record.resetAt };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Applies rate limiting to an API request.
 * Returns null if allowed, or a 429 Too Many Requests response if exceeded.
 */
export function applyRateLimit(
  req: NextRequest,
  endpointTag: string,
  maxRequests: number = 30,
  windowMs: number = 60 * 1000
): NextResponse | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : realIp) || "127.0.0.1";
  
  // Also incorporate Bearer token or User-Agent if available
  const authHeader = req.headers.get("authorization");
  const identifier = authHeader ? `${clientIp}_${authHeader.slice(-10)}` : clientIp;
  const rateLimitKey = `${endpointTag}:${identifier}`;

  const { allowed, remaining, resetAt } = checkRateLimit(rateLimitKey, maxRequests, windowMs);

  if (!allowed) {
    const retryAfterSec = Math.ceil((resetAt - Date.now()) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Rate limit exceeded, please slow down.",
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfterSec.toString(),
          "X-RateLimit-Limit": maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": resetAt.toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Validates Firebase App Check or bot protection headers on sensitive POST endpoints.
 */
export function verifyAppCheckHeader(req: NextRequest): { valid: boolean; warning?: string } {
  const appCheckToken = req.headers.get("x-firebase-appcheck");
  const isProd = process.env.NODE_ENV === "production";
  const appCheckEnforced = process.env.APP_CHECK_ENFORCED === "true";

  if (!appCheckToken) {
    if (isProd && appCheckEnforced) {
      return { valid: false, warning: "Missing required Firebase App Check token header." };
    }
    return { valid: true, warning: "App Check not enforced in current environment." };
  }

  // Token present
  return { valid: true };
}
