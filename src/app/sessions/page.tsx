import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";
import { redirect } from "next/navigation";
import SessionsPage from "./sessions";
import { Suspense } from "react";
import SessionsSkeleton from "@/components/sessionLoading";

export default async function Sessions() {
  const isAuthenticated = await checkIsAuthenticated();

  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }

  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <SessionsPage />
    </Suspense>
  );
}
