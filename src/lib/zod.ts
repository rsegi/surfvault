import { string, z } from "zod";

export const signInSchema = z.object({
  username: string({ required_error: "El usuario es obligatorio" })
    .min(4, "El usuario debe tener más de 3 carácteres")
    .max(21, "El usuario debe tener menos de 21 carácteres"),
  password: string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener más de 8 carácteres")
    .max(32, "La contraseña debe tener menos de 32 carácteres"),
});

export type SignIn = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: string({ required_error: "El usuario es obligatorio" })
    .min(3, "El usuario debe tener más de 2 carácteres")
    .max(40, "El usuario debe tener menos de 40 carácteres"),
  username: string({ required_error: "El usuario es obligatorio" })
    .min(4, "El usuario debe tener más de 3 carácteres")
    .max(21, "El usuario debe tener menos de 21 carácteres"),
  password: string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener más de 8 carácteres")
    .max(32, "La contraseña debe tener menos de 32 carácteres"),
});

export type SignUp = z.infer<typeof signUpSchema>;
