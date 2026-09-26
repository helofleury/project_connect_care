import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { authService } from "../services/authService";
import { auth } from "../services/firebase";

interface RegisterData {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  vin_hash: string;
}

interface Customer {
  customer_id: number;
  firebase_uid: string;
  name: string;
  last_name: string;
  email: string;
  phone: string;
  vin_hash: string;
}

interface AuthContextData {
  user: User | null;
  customer: Customer | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    data: RegisterData
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextData | undefined>(
    undefined
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const result =
      await authService.login(
        email,
        password
      );

    setUser(result.user);
    setCustomer(result.customer);
  };

  const register = async (
    data: RegisterData
  ) => {
    const user =
      await authService.register(data);

    setUser(user.user);
    setCustomer(user.customer);
  };

  const logout = async () => {
    await authService.logout();

    setUser(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth deve ser usado dentro de um AuthProvider."
    );
  }

  return context;
}