import type { FC } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Card from "./Card";

import { colors } from "../theme/colors";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface DealerShipCardProps {
  name: string;
  address: string;
  distance?: string;
  imageUri?: string;
  available?: boolean;
  onPress?: () => void;
}

const DealerShipCard: FC<DealerShipCardProps> = ({
  name,
  address,
  distance,
  imageUri,
  available = true,
  onPress,
}) => {
  const content = (
    <Card style={styles.card}>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>

          <View
            style={[
              styles.status,
              !available && styles.unavailable,
            ]}
          >
            <Text style={styles.statusText}>
              {available ? "Aberta" : "Indisponível"}
            </Text>
          </View>
        </View>

        <Text style={styles.address}>{address}</Text>

        {distance && (
          <Text style={styles.distance}>
            📍 {distance}
          </Text>
        )}
      </View>
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!available}
      style={({ pressed }) => [
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 150,
  },

  content: {
    padding: spacing.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  name: {
    ...typography.title,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },

  status: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },

  unavailable: {
    backgroundColor: colors.dangerLight,
  },

  statusText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: "600",
  },

  address: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  distance: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.sm,
  },

  pressed: {
    opacity: 0.8,
  },
});

export default DealerShipCard;