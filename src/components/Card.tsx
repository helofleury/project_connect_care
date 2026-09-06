import type { FC, ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

import { colors } from "../theme/colors";
import { borderRadius, spacing } from "../theme/spacing";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

const Card: FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

export default Card;