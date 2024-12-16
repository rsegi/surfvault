import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";
import { notFound, redirect } from "next/navigation";
import UpdateSessionPage from "./updateSession";
import { getSessionById } from "api/session/session";

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

  if (!session) {
    notFound();
  }

  return <UpdateSessionPage session={session} />;
}
