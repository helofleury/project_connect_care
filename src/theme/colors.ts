export const lightColors = {
  // Brand
  primary: "#0057B8",
  primaryDark: "#071A3D",
  primaryLight: "#E8F1FF",

  // Backgrounds
  background: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8FAFC",

  // Text
  text: "#172033",
  textSecondary: "#667085",
  textLight: "#98A2B3",
  textWhite: "#FFFFFF",

  // Status
  success: "#2E9B5B",
  successLight: "#E8F6EE",

  warning: "#F2A900",
  warningLight: "#FFF5D6",

  danger: "#D64545",
  dangerLight: "#FDECEC",

  info: "#3B82F6",
  infoLight: "#EAF2FF",

  // UI
  border: "#E4E7EC",
  divider: "#EAECF0",

  // Scores
  scoreGood: "#2E9B5B",
  scoreMedium: "#F2A900",
  scoreLow: "#D64545",

  // Transparent / overlay
  overlay: "rgba(0, 0, 0, 0.4)",
};

export const darkColors: typeof lightColors = {
  // Brand
  primary: "#3D8BFF",
  primaryDark: "#0A1A33",
  primaryLight: "#152A4A",

  // Backgrounds
  background: "#0B1120",
  surface: "#151B2C",
  surfaceSecondary: "#1B2338",

  // Text
  text: "#F2F4F8",
  textSecondary: "#9AA5B8",
  textLight: "#6C7689",
  textWhite: "#FFFFFF",

  // Status
  success: "#4ADE80",
  successLight: "#173824",

  warning: "#FBBF24",
  warningLight: "#3A2E0F",

  danger: "#F87171",
  dangerLight: "#3B1616",

  info: "#60A5FA",
  infoLight: "#132238",

  // UI
  border: "#26304A",
  divider: "#20283F",

  // Scores
  scoreGood: "#4ADE80",
  scoreMedium: "#FBBF24",
  scoreLow: "#F87171",

  // Transparent / overlay
  overlay: "rgba(0, 0, 0, 0.6)",
};

export type ThemeColors = typeof lightColors;

// Mantido para compatibilidade com telas que ainda importam `colors`
// diretamente (tema claro fixo). Novas telas devem usar `useTheme()`.
export const colors = lightColors;