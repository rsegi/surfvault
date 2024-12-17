import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";
import { notFound, redirect } from "next/navigation";
import UpdateSessionPage from "./updateSession";
import { getSessionById } from "api/session/session";
import { Breadcrumbs } from "@/components/breadcrumbs";

export default async function UpdateSession({
  params,
}: {
  params: { id: string };
}) {
  const isAuthenticated = await checkIsAuthenticated();
  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }

  const session = await getSessionById(params.id);

  const breadcrumbItems = [
    { href: `/sessions`, label: "Sesiones" },
    { href: `/sessions/${params.id}`, label: `${session.title}` },
    { label: "Editar" },
  ];

  if (!session) {
    notFound();
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <UpdateSessionPage session={session} />
    </>
  );
}
