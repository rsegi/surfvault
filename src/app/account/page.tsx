import { checkIsAuthenticated } from "@/lib/auth/checkIsAuthenticated";
import { redirect } from "next/navigation";
import AccountPage from "./account";
import { Breadcrumbs } from "@/components/breadcrumbs";

const breadcrumbItems = [{ href: `/account`, label: `Mi cuenta` }];

export default async function Account() {
  const isAuthenticated = await checkIsAuthenticated();
  if (!isAuthenticated) {
    redirect("/auth/sign-in");
  }
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <AccountPage />
    </>
  );
}
