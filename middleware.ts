import { NextFetchEvent, NextResponse } from "next/server";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

// Create a standalone middleware function
export default function middleware(req: NextRequest) {
  // Define public routes that don't need auth
  const publicPaths = [
    "/api/uploadthing",
    "/api/auth",
    "/auth/signin",
    "/auth/error"
  ];

  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  return withAuth(req as NextRequestWithAuth, {} as NextFetchEvent);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
