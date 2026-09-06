import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

import Card from "./Card";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface PredictionCardProps {
  title: string;
  description: string;
  value?: string;
  icon?: string;
}

const PredictionCard: FC<PredictionCardProps> = ({
  title,
  description,
  value,
  icon = "🔧",
}) => {
  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.description}>
            {description}
          </Text>

          {value && (
            <Text style={styles.value}>{value}</Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 20,
  },

  content: {
    flex: 1,
    marginLeft: spacing.md,
  },

  title: {
    ...typography.title,
    color: colors.text,
  },

  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  value: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginTop: spacing.sm,
  },
});

export default PredictionCard;