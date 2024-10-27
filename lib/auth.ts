import { clerkClient } from "@clerk/nextjs/server";

export async function getUserType(userId: string): Promise<string | null> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return user.publicMetadata.userType as string | null;
}

export const authOptions = {
  // Your auth options configuration
};
