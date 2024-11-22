import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";
import { redirect } from "next/navigation";
import SessionsPage from "@/app/sessions/sessions";

export default async function Sessions() {
  const isAuthenticated = await checkIsAuthenticated();
  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  } else {
    return <SessionsPage />;
  }
}
