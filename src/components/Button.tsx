import type { FC } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import { useTheme } from "../contexts/ThemeContext";
import { borderRadius, sizes, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
}

const Button: FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}) => {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyles: Record<string, { backgroundColor: string; borderColor?: string; borderWidth?: number }> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.primaryLight },
    outline: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    danger: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.danger,
    },
  };

  const textColors: Record<string, string> = {
    primary: colors.textWhite,
    secondary: colors.primary,
    outline: colors.primary,
    danger: colors.danger,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.textWhite : colors.primary}
        />
      ) : (
        <Text style={[styles.text, { color: textColors[variant] }]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: sizes.buttonHeight,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },

  text: {
    ...typography.button,
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },
});

export default Button;