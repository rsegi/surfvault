import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const useCurrentUser = () => {
  const session = useSession();
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    if (session.data) {
      setUser(session.data.user!);
    }
  }, [session]);

  return user;
};
