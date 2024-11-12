import argon2 from "argon2";

export const hashPassword = async (password: string): Promise<string> => {
  const hash = await argon2.hash(password);
  return hash;
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  try {
    const argonResponse = await argon2.verify(hash, password);
    return argonResponse;
  } catch (err) {
    console.error(`Error during password check: ${err}`);
    throw new Error("Password verification failed.");
  }
};
