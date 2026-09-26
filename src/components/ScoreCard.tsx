import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

import Card from "./Card";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  description?: string;
  variant?: "good" | "medium" | "bad";
}

const ScoreCard: FC<ScoreCardProps> = ({
  title,
  score,
  maxScore,
  description,
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.scoreContainer}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.maxScore}>/{maxScore}</Text>
      </View>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progress,
            { width: `${percentage}%` },
          ]}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },

  title: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },

  score: {
    ...typography.score,
    color: colors.text,
  },

  maxScore: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  description: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.xs,
  },

  progressBackground: {
    height: 6,
    backgroundColor: colors.divider,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 3,
  },
});

export default ScoreCard;