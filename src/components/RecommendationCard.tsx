import type { FC } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { colors } from "../theme/colors";
import {
  borderRadius,
  spacing,
} from "../theme/spacing";
import { typography } from "../theme/typography";

interface RecommendationCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: string;
  onPress?: () => void;
  highlighted?: boolean;
}

const RecommendationCard: FC<
  RecommendationCardProps
> = ({
  title,
  description,
  actionLabel = "Ver detalhes",
  icon = "bulb-outline",
  onPress,
  highlighted = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        highlighted && styles.highlighted,
      ]}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            highlighted &&
              styles.highlightedIconContainer,
          ]}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={
              highlighted
                ? colors.primaryDark
                : colors.primary
            }
          />
        </View>

        <Text
          style={[
            styles.label,
            highlighted &&
              styles.highlightedLabel,
          ]}
        >
          {highlighted
            ? "SUA PRÓXIMA MELHOR AÇÃO"
            : "RECOMENDAÇÃO"}
        </Text>
      </View>

      {/* Título */}
      <Text
        style={[
          styles.title,
          highlighted && styles.highlightedText,
        ]}
      >
        {title}
      </Text>

      {/* Descrição */}
      <Text
        style={[
          styles.description,
          highlighted &&
            styles.highlightedDescription,
        ]}
      >
        {description}
      </Text>

      {/* Ação */}
      {onPress && (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.pressedAction,
            highlighted &&
              styles.highlightedAction,
          ]}
        >
          <Text
            style={[
              styles.actionText,
              highlighted &&
                styles.highlightedActionText,
            ]}
          >
            {actionLabel}
          </Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color={
              highlighted
                ? colors.textWhite
                : colors.primary
            }
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },

  highlighted: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  highlightedIconContainer: {
    backgroundColor: colors.surface,
  },

  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    fontWeight: "700",
    flex: 1,
  },

  highlightedLabel: {
    color: colors.textWhite,
  },

  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
    fontWeight: "700",
  },

  highlightedText: {
    color: colors.textWhite,
  },

  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  highlightedDescription: {
    color: "#D8E4F5",
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  highlightedAction: {
    borderTopColor: "rgba(255,255,255,0.2)",
  },

  actionText: {
    ...typography.button,
    color: colors.primary,
  },

  highlightedActionText: {
    color: colors.textWhite,
  },

  pressedAction: {
    opacity: 0.6,
  },
});

export default RecommendationCard;