import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Card from "../components/Card";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

import { useAuth } from "../hooks/useAuth";
import { useVehicle } from "../hooks/useVehicle";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function VehicleScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const {
    vehicle,
    loading,
    error,
    refreshVehicle,
  } = useVehicle(user?.uid);

  if (
    loading &&
    !vehicle
  ) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
        <Loading message="Carregando seu veículo..." />
      </SafeAreaView>
    );
  }

  if (error && !vehicle) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
        <View style={styles.errorContainer}>
          <ErrorMessage
            message={error}
            onRetry={refreshVehicle}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["top"]}
      >
        <View style={styles.errorContainer}>
          <ErrorMessage
            message="Não foi possível carregar os dados do veículo."
            onRetry={refreshVehicle}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshVehicle}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Meu Veículo
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>
          Informações do seu veículo
        </Text>

        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleIconContainer}>
            <Text style={styles.vehicleIcon}>
              🚙
            </Text>
          </View>

          <Text style={styles.vehicleModel}>
            {vehicle.model}
          </Text>

          <Text style={styles.vehicleDetails}>
            {vehicle.year}
            {vehicle.fuel
              ? ` • ${vehicle.fuel}`
              : ""}
          </Text>

         
        </Card>

        <Text style={styles.sectionTitle}>
          Informações do veículo
        </Text>

        <Card>
          <InfoRow
            icon="car-outline"
            label="Modelo"
            value={vehicle.model}
          />

          <InfoRow
            icon="calendar-outline"
            label="Ano"
            value={String(vehicle.year)}
          />

          <InfoRow
            icon="speedometer-outline"
            label="Quilometragem"
            value={formatMileage(
              vehicle.mileage
            )}
          />

          

          <InfoRow
            icon="shield-checkmark-outline"
            label="Garantia"
            value={
              vehicle.warranty ??
              "Não informado"
            }
          />

          
        </Card>

        <Text style={styles.sectionTitle}>
          Status
        </Text>

        <Card>
          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.success}
              />
            </View>

            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                Veículo cadastrado
              </Text>

              <Text style={styles.statusText}>
                Os dados do seu veículo estão
                vinculados ao seu perfil ConnectCare 360.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}

function InfoRow({
  icon,
  label,
  value,
  isLast,
}: InfoRowProps) {
  return (
    <View
      style={[
        styles.infoRow,
        isLast && styles.infoRowLast,
      ]}
    >
      <View style={styles.infoLabelContainer}>
        <Ionicons
          name={icon}
          size={17}
          color={colors.textSecondary}
        />

        <Text style={styles.infoLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

function formatMileage(
  mileage: number
): string {
  return `${Math.max(
    0,
    mileage
  ).toLocaleString("pt-BR")} km`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: colors.surface,
  },

  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },

  headerSpacer: {
    width: 42,
  },

  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  vehicleCard: {
    alignItems: "center",
    marginTop: spacing.lg,
  },

  vehicleIconContainer: {
    width: 110,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 16,
  },

  vehicleIcon: {
    fontSize: 52,
  },

  vehicleModel: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },

  vehicleDetails: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  vehicleMileage: {
    ...typography.title,
    color: colors.primary,
    marginTop: spacing.xs,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  infoRowLast: {
    borderBottomWidth: 0,
  },

  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm,
  },

  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },

  infoValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
    textAlign: "right",
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusIcon: {
    marginRight: spacing.sm,
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    ...typography.title,
    color: colors.text,
  },

  statusText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
});