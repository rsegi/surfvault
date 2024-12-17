import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";
import { redirect } from "next/navigation";
import SessionsPage from "./sessions";
import { Suspense } from "react";
import SessionsSkeleton from "@/components/sessionLoading";
import { getSessionsByUser } from "api/session/session";
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";

const breadcrumbItems = [{ href: "/sessions", label: "Sesiones" }];

export default async function Sessions() {
  const isAuthenticated = await checkIsAuthenticated();
  const session = await auth();
  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }

  const sessions = await getSessionsByUser(session!.user!.id!);

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <Suspense fallback={<SessionsSkeleton />}>
        <SessionsPage sessions={sessions} />
      </Suspense>
    </>
  );
}
