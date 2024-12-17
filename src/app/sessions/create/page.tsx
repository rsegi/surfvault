import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";
import { redirect } from "next/navigation";
import CreateSessionPage from "./createSession";
import { Breadcrumbs } from "@/components/breadcrumbs";

const breadcrumbItems = [
  { href: "/sessions", label: "Sesiones" },
  { label: "Crear Sesión" },
];

export default async function CreateSession() {
  const isAuthenticated = await checkIsAuthenticated();
  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <CreateSessionPage />
    </>
  );
}
