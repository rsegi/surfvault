import SignUpPage from "@/app/auth/sign-up/signUp";
import { Breadcrumbs } from "@/components/breadcrumbs";

const breadcrumbItems = [{ href: `/auth/sign-up`, label: `Registro` }];

export default function SignUp() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <SignUpPage />
    </>
  );
}
