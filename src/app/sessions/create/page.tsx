import CreateSessionPage from "./createSession";
import { Breadcrumbs } from "@/components/breadcrumbs";

const breadcrumbItems = [
  { href: "/sessions", label: "Sesiones" },
  { label: "Crear Sesión" },
];

export default async function CreateSession() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <CreateSessionPage />
    </>
  );
}
