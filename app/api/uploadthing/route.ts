import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Add this line at the top of your route file
export const runtime = "nodejs";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    // webhookSecret: process.env.UPLOADTHING_WEBHOOK_SECRET,
    uploadthingSecret: process.env.UPLOADTHING_SECRET,
  },
});
