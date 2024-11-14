import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

const auth = async (req: Request) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;
    return { userId: session.user.id };
  } catch (error) {
    console.error("Auth error in uploadthing:", error);
    return null;
  }
};

export const ourFileRouter = {
  audioUploader: f({
    audio: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return user;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Audio upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),

  presetUploader: f({
    blob: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new Error("Unauthorized");
      return user;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Preset upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
