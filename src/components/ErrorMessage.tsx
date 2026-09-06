import type { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: FC<ErrorMessageProps> = ({
  message,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>!</Text>

      <View style={styles.content}>
        <Text style={styles.title}>
          Ocorreu um erro
        </Text>

        <Text style={styles.message}>
          {message}
        </Text>

        {onRetry && (
          <Text
            onPress={onRetry}
            style={styles.retry}
          >
            Tentar novamente
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.dangerLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
  },

  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger,
    color: colors.textWhite,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "700",
  },

  content: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  title: {
    ...typography.bodyMedium,
    color: colors.danger,
  },

  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  retry: {
    ...typography.button,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});

export default ErrorMessage;