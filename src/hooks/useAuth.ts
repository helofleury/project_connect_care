import { useCallback, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(
    async (email: string, _password: string) => {
      setLoading(true);

      try {
        // Authentication service will be connected here.
        setUser({
          id: "1",
          name: "João",
          email,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      _password: string
    ) => {
      setLoading(true);

      try {
        // Registration service will be connected here.
        setUser({
          id: "1",
          name,
          email,
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      // Authentication service will be connected here.
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}