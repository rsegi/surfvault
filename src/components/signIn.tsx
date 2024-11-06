import { signIn } from "@/auth";

export const SignIn = () => {
  return (
    <form
      action={async (formData) => {
        "use server";
        await signIn("credentials", formData);
      }}
    >
      <label>
        Usuario
        <input name="user" type="text" />
      </label>
      <label>
        Contrase&ntilde;a
        <input name="password" type="password" />
      </label>
      <button>Iniciar Sesi&oacute;n</button>
    </form>
  );
};
