import type { FC } from "react";

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Card from "./Card";

import type { Vehicle } from "../types/vehicle";

import { colors } from "../theme/colors";
import {
  borderRadius,
  spacing,
} from "../theme/spacing";
import { typography } from "../theme/typography";

interface VehicleCardProps {
  vehicle: Vehicle;
  imageUri?: string;
  onVehiclePress?: () => void;
  onHistoryPress?: () => void;
}

const VehicleCard: FC<VehicleCardProps> = ({
  vehicle,
  imageUri,
  onVehiclePress,
  onHistoryPress,
}) => {
  return (
    <Card style={styles.card}>
      {/* Cabeçalho do veículo */}
      <View style={styles.content}>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="car-sport-outline"
              size={42}
              color={colors.primary}
            />
          </View>
        )}

        <View style={styles.info}>
          <Text
            style={styles.model}
            numberOfLines={1}
          >
            {vehicle.model}
          </Text>

          <Text style={styles.details}>
            {vehicle.year}

            {vehicle.fuel
              ? ` • ${vehicle.fuel}`
              : ""}
          </Text>

          <View style={styles.mileageContainer}>
            <Ionicons
              name="speedometer-outline"
              size={16}
              color={colors.primary}
            />

            <Text style={styles.mileage}>
              {formatMileage(vehicle.mileage)}
            </Text>
          </View>
        </View>
      </View>


      {/* Ações */}
      <View style={styles.actions}>
        <View
          style={[
            styles.action,
            styles.activeAction,
          ]}
        >
          <Ionicons
            name="grid-outline"
            size={16}
            color={colors.primary}
          />

          <Text style={styles.activeActionText}>
            Resumo
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.action,
            pressed && styles.pressedAction,
          ]}
          onPress={onVehiclePress}
          disabled={!onVehiclePress}
        >
          <Ionicons
            name="car-outline"
            size={16}
            color={colors.textSecondary}
          />

          <Text style={styles.actionText}>
            Meu veículo
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.action,
            pressed && styles.pressedAction,
          ]}
          onPress={onHistoryPress}
          disabled={!onHistoryPress}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={colors.textSecondary}
          />

          <Text style={styles.actionText}>
            Histórico
          </Text>
        </Pressable>
      </View>
    </Card>
  );
};

function formatMileage(mileage: number): string {
  return `${mileage.toLocaleString("pt-BR")} km`;
}

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

  imageContainer: {
    width: 110,
    height: 85,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: 110,
    height: 85,
  },

  imagePlaceholder: {
    width: 110,
    height: 85,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },

  info: {
    flex: 1,
    marginLeft: spacing.md,
  },

  model: {
    ...typography.title,
    color: colors.text,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  details: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  mileageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },

  mileage: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "700",
    marginLeft: spacing.xs,
  },

  metrics: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  metric: {
    flex: 1,
  },

  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  metricValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },

  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    gap: 5,
  },

  activeAction: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  pressedAction: {
    opacity: 0.6,
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