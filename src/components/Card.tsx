import type { FC, ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { useTheme } from "../contexts/ThemeContext";
import { borderRadius, spacing } from "../theme/spacing";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

const Card: FC<CardProps> = ({ children, style }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
  },
});

export default Card;