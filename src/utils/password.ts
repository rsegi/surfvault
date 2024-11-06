import argon2 from "argon2";

export const hashPassword = async(password: string): Promise<string> => {
  try {
    const hash = await argon2.hash(password); // Automatically salts the password
    return hash;
  } catch (err) {
    console.error(err);
    throw new Error("Password hashing failed.");
  }
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    console.error(err);
    throw new Error("Password verification failed.");
  }
}
