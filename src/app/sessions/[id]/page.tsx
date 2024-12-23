import { getSessionById } from "api/session/session";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import dynamic from "next/dynamic";

const SessionDetailPage = dynamic(() => import("./sessionDetail"), {
  ssr: false,
});

export default async function SessionDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionById(params.id);

  const breadcrumbItems = [
    { href: `/sessions`, label: "Sesiones" },
    { href: `/sessions/${params.id}`, label: `${session.title}` },
  ];

  if (!session) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <SessionDetailPage session={session} />
    </>
  );
}
