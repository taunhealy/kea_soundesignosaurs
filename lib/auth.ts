import { clerkClient } from "@clerk/nextjs/server";

export async function getUserType(userId: string): Promise<string | null> {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  return user.publicMetadata.userType as string | null;
}

const ADMIN_USER_IDS = ['user_2o273MutOJtstomrgIHl3q1pex6']; // Add your admin user IDs here

export async function isAdmin(userId: string) {
  return ADMIN_USER_IDS.includes(userId);
}

export const authOptions = {
  // Your auth options configuration
  
};
