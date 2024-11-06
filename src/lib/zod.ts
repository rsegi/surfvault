import { object, string } from "zod";

export const signInSchema = object({
  username: string({ required_error: "El usuario es obligatorio" })
    .min(4, "El usuario debe tener más de 3 carácteres")
    .max(21, "El usuario debe tener menos de 21 carácteres"),
  password: string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria")
    .min(
      8,
      "La contraseña debe tener más de 8 carácteresmust be more than 8 characters"
    )
    .max(32, "La contraseña debe tener menos de 32 carácteres"),
});
