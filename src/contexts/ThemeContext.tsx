import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { darkColors, lightColors, type ThemeColors } from "../theme/colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextData {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "@connectcare360:theme-mode";

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      } catch {
        // se não conseguir ler, mantém o padrão (system)
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);

    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {
      // ignora falha de persistência
    });
  };

  const toggleTheme = () => {
    const resolvedIsDark =
      mode === "dark" || (mode === "system" && systemScheme === "dark");

    setMode(resolvedIsDark ? "light" : "dark");
  };

  const isDark =
    mode === "dark" || (mode === "system" && systemScheme === "dark");

  const value = useMemo<ThemeContextData>(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      mode,
      setMode,
      toggleTheme,
    }),
    [isDark, mode]
  );

  if (!hydrated) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextData {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider.");
  }

  return context;
}