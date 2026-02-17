import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// --- Rate Limiter Logic (Inlined for Edge Runtime Compatibility) ---

interface RateLimitEntry {
  count: number;
  windowStart: number;
  violations: number;
  lastViolation: number;
}

// IP → rate limit state
const ipStore = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - 10 * 60 * 1000;
  for (const [ip, entry] of ipStore) {
    if (entry.windowStart < cutoff) {
      ipStore.delete(ip);
    }
  }
}

interface RouteLimit {
  windowMs: number;
  maxRequests: number;
}

const ROUTE_LIMITS: Record<string, RouteLimit> = {
  "/login":  { windowMs: 60_000, maxRequests: 120 },
  "/signup": { windowMs: 60_000, maxRequests: 120 },
  "/admin":  { windowMs: 60_000, maxRequests: 120 },
  default:   { windowMs: 60_000, maxRequests: 120 },
};

function getRouteLimit(pathname: string): RouteLimit {
  for (const [route, limit] of Object.entries(ROUTE_LIMITS)) {
    if (route !== "default" && pathname.startsWith(route)) {
      return limit;
    }
  }
  return ROUTE_LIMITS.default;
}

const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scraper/i, /curl/i, /wget/i,
  /python-requests/i, /httpie/i, /postman/i, /insomnia/i,
  /axios/i, /node-fetch/i, /go-http-client/i, /java\//i,
  /phantomjs/i, /headless/i, /selenium/i, /puppeteer/i,
  /playwright/i,
];

const GOOD_BOT_PATTERNS = [
  /googlebot/i, /bingbot/i, /yandexbot/i, /duckduckbot/i,
  /slurp/i, /baiduspider/i, /facebookexternalhit/i,
  /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegrambot/i,
  /discordbot/i,
];

function isBot(userAgent: string): "bad_bot" | "good_bot" | "human" {
  if (!userAgent) return "bad_bot";
  if (GOOD_BOT_PATTERNS.some(p => p.test(userAgent))) return "good_bot";
  if (BOT_PATTERNS.some(p => p.test(userAgent))) return "bad_bot";
  return "human";
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterMs: number;
  isBotDetected: boolean;
}

function checkRateLimit(
  ip: string,
  pathname: string,
  userAgent: string
): RateLimitResult {
  cleanup();

  const botStatus = isBot(userAgent);
  const routeLimit = getRouteLimit(pathname);

  // Bad bots get 1/4 the rate limit, Good bots get 1/2
  const effectiveLimit = botStatus === "bad_bot"
    ? Math.ceil(routeLimit.maxRequests / 4)
    : botStatus === "good_bot"
      ? Math.ceil(routeLimit.maxRequests / 2)
      : routeLimit.maxRequests;

  const now = Date.now();
  const entry = ipStore.get(ip);

  if (!entry || now - entry.windowStart > routeLimit.windowMs) {
    ipStore.set(ip, {
      count: 1,
      windowStart: now,
      violations: entry?.violations || 0,
      lastViolation: entry?.lastViolation || 0,
    });

    return {
      allowed: true,
      remaining: effectiveLimit - 1,
      limit: effectiveLimit,
      retryAfterMs: 0,
      isBotDetected: botStatus === "bad_bot",
    };
  }

  entry.count++;

  if (entry.count > effectiveLimit) {
    entry.violations++;
    entry.lastViolation = now;
    const retryAfterMs = routeLimit.windowMs - (now - entry.windowStart);
    const penaltyMs = Math.min(
      retryAfterMs * Math.pow(2, Math.min(entry.violations - 1, 4)),
      10 * 60 * 1000
    );

    return {
      allowed: false,
      remaining: 0,
      limit: effectiveLimit,
      retryAfterMs: penaltyMs,
      isBotDetected: botStatus === "bad_bot",
    };
  }

  return {
    allowed: true,
    remaining: effectiveLimit - entry.count,
    limit: effectiveLimit,
    retryAfterMs: 0,
    isBotDetected: botStatus === "bad_bot",
  };
}

// --- Proxy Function (Next.js 16: renamed from middleware → proxy) ---

export async function proxy(request: NextRequest) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  // Rate Limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  const pathname = request.nextUrl.pathname;

  const rateLimit = checkRateLimit(ip, pathname, userAgent);

  if (!rateLimit.allowed) {
    const retryAfterSeconds = Math.ceil(rateLimit.retryAfterMs / 1000);
    return new NextResponse(
      JSON.stringify({
        error: "Too Many Requests",
        message: "You are being rate limited. Please slow down.",
        retryAfter: retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": retryAfterSeconds.toString(),
          "X-RateLimit-Limit": rateLimit.limit.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Supabase Auth
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Headers
  supabaseResponse.headers.set("X-RateLimit-Limit", rateLimit.limit.toString());
  supabaseResponse.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());

  // Redirect auth pages
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const isAdmin = user?.app_metadata?.role === "admin";
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/__not_found__";
      return NextResponse.rewrite(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
