"use server";

import SignInPage from "@/app/auth/sign-in/signIn";
import { Breadcrumbs } from "@/components/breadcrumbs";

const breadcrumbItems = [{ href: `/auth/sign-in`, label: `Inicio Sesión` }];

export default async function SignIn() {
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} />
      <SignInPage />
    </>
  );
}
