import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      return !!token?.userId;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/user/:path*",
    "/api/presets/:path*",
    "/api/packs/:path*",
    "/api/requests/:path*",
    "/((?!api/uploadthing).*)",
  ],
};
