import type { FC } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface RecommendationCardProps {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: string;
  onPress?: () => void;
  highlighted?: boolean;
}

const RecommendationCard: FC<RecommendationCardProps> = ({
  title,
  description,
  actionLabel = "Ver detalhes",
  icon = "🎯",
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
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <Text style={styles.label}>
          {highlighted
            ? "SUA PRÓXIMA MELHOR AÇÃO"
            : "RECOMENDAÇÃO"}
        </Text>
      </View>

      <Text
        style={[
          styles.title,
          highlighted && styles.highlightedText,
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          highlighted && styles.highlightedDescription,
        ]}
      >
        {description}
      </Text>

      {onPress && (
        <Pressable
          onPress={onPress}
          style={styles.action}
        >
          <Text style={styles.actionText}>
            {actionLabel}
          </Text>

          <Text style={styles.arrow}>→</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 18,
  },

  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    fontWeight: "600",
  },

  title: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
  },

  highlightedText: {
    color: colors.textWhite,
  },

  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  },

  actionText: {
    ...typography.button,
    color: colors.primary,
  },

  arrow: {
    fontSize: 20,
    color: colors.primary,
  },
});

export default RecommendationCard;