import type { FC } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

import Card from "./Card";

import { colors } from "../theme/colors";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface VehicleCardProps {
  model: string;
  year: string | number;
  fuel?: string;
  imageUri?: string;
}

const VehicleCard: FC<VehicleCardProps> = ({
  model,
  year,
  fuel,
  imageUri,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>🚙</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.model}>{model}</Text>

          <Text style={styles.details}>
            {year}
            {fuel ? ` • ${fuel}` : ""}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={[styles.action, styles.activeAction]}>
          <Text style={styles.activeActionText}>Resumo</Text>
        </View>

        <View style={styles.action}>
          <Text style={styles.actionText}>Meu Veículo</Text>
        </View>

        <View style={styles.action}>
          <Text style={styles.actionText}>Meu Histórico</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },

  image: {
    width: 110,
    height: 75,
  },

  imagePlaceholder: {
    width: 110,
    height: 75,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },

  placeholderIcon: {
    fontSize: 40,
  },

  info: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  model: {
    ...typography.title,
    color: colors.text,
  },

  details: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  action: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },

  activeAction: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  activeActionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "600",
  },
});

export default VehicleCard;