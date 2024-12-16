import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";
import { redirect } from "next/navigation";
import SessionsPage from "./sessions";
import { Suspense } from "react";
import SessionsSkeleton from "@/components/sessionLoading";
import { getSessionsByUser } from "api/session/session";
import { auth } from "@/auth";

export default async function Sessions() {
  const isAuthenticated = await checkIsAuthenticated();
  const session = await auth();
  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }

  const sessions = await getSessionsByUser(session!.user!.id!);

  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <SessionsPage sessions={sessions} />
    </Suspense>
  );
}
