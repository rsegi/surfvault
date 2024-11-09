import { redirect } from "next/navigation";
import SignInPage from "./signIn";

export default function SignIn() {
  const isAuthenticated = false;

  if (isAuthenticated) {
    redirect("/sessions");
  } else {
    return <SignInPage />;
  }
}
