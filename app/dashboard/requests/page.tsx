import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import RequestsClient from "./requests-client";

export default async function RequestsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <RequestsClient userId={userId} />;
}
