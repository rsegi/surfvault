import SessionsPage from "./sessions";
import { Suspense } from "react";
import SessionsSkeleton from "@/components/sessionLoading";
import { getSessionsByUser, getTotalSessionsCount } from "api/session/session";
import { auth } from "@/auth";
import { Breadcrumbs } from "@/components/breadcrumbs";

const breadcrumbItems = [{ href: "/sessions", label: "Sesiones" }];

export default async function Sessions() {
  const session = await auth();

  const initialSessions = await getSessionsByUser(session!.user!.id!, 1, 5);
  const totalSessions = await getTotalSessionsCount(session!.user!.id!);

  const fetchSessions = async (page: number) => {
    "use server";
    return await getSessionsByUser(session!.user!.id!, page, 5);
  };

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <Suspense fallback={<SessionsSkeleton />}>
        <SessionsPage
          initialSessions={initialSessions}
          totalSessions={totalSessions}
          fetchSessions={fetchSessions}
        />
      </Suspense>
    </>
  );
}
