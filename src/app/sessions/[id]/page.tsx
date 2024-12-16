import { getSessionById } from "api/session/session";
import SessionDetailPage from "./sessionDetail";
import { notFound } from "next/navigation";

export default async function SessionDetail({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionById(params.id);

  if (!session) {
    notFound();
  }

  return <SessionDetailPage session={session} />;
}
