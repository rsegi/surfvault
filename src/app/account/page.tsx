import AccountPage from "./account";
import { Breadcrumbs } from "@/components/breadcrumbs";

const breadcrumbItems = [{ href: `/account`, label: `Mi cuenta` }];

export default async function Account() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <AccountPage />
    </>
  );
}
