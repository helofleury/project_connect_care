import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Card from "../components/Card";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { useBehavior } from "../hooks/useBehavior";

const DEMO_VIN =
  "7c1878b6f55e26922eb1955d2c1ea5689999868cb58cfb373b6742ce34a45b28";

export default function BehaviorScreen() {
  const {
    segment,
    loading,
    error,
  } = useBehavior(DEMO_VIN);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Analisando seu perfil...
        </Text>
      </View>
    );
  }

  if (error || !segment) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Meu Perfil</Text>

        <Text style={styles.subtitle}>
          Entenda como nos relacionamos com você.
        </Text>

        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            Não foi possível carregar seu perfil
          </Text>

          <Text style={styles.errorText}>
            {error ||
              "Não encontramos informações comportamentais para este veículo."}
          </Text>
        </Card>
      </ScrollView>
    );
  }

  const vehicle = segment.vehicle;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Meu Perfil</Text>

      <Text style={styles.subtitle}>
        Entenda como nos relacionamos com você.
      </Text>

      <Card style={styles.profileCard}>
        <Text style={styles.icon}>👥</Text>

        <Text style={styles.profileTitle}>
          {segment.segment_name}
        </Text>

        <Text style={styles.profileDescription}>
          Esse perfil foi identificado automaticamente a
          partir do histórico de utilização e manutenção
          do seu veículo.
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>
        Características do seu perfil
      </Text>

      <ProfileItem
        label="Frequência de serviços"
        value={formatServiceFrequency(
          vehicle.service_count
        )}
      />

      <ProfileItem
        label="Total de serviços"
        value={formatNumber(vehicle.service_count)}
      />

      <ProfileItem
        label="Tempo desde o último serviço"
        value={formatDays(
          vehicle.days_since_last_service
        )}
      />

      <ProfileItem
        label="Intervalo médio entre serviços"
        value={formatAverageInterval(
          vehicle.avg_days_between_services
        )}
      />

      <ProfileItem
        label="Fidelidade à concessionária"
        value={formatPercentage(
          vehicle.dealer_loyalty_ratio
        )}
      />

      <ProfileItem
        label="Serviços agendados"
        value={formatPercentage(
          vehicle.schedule_rate
        )}
      />

      <Text style={styles.sectionTitle}>
        Análise do modelo
      </Text>

      <Card>
        <Text style={styles.comparisonTitle}>
          Segmentação comportamental
        </Text>

        <Text style={styles.comparisonText}>
          O veículo foi classificado pelo modelo de
          Machine Learning em um dos grupos de
          comportamento identificados no histórico Ford.
        </Text>

        <View style={styles.segmentBox}>
          <Text style={styles.segmentLabel}>
            Segmento identificado
          </Text>

          <Text style={styles.segmentValue}>
            {segment.segment_name}
          </Text>
        </View>

        <View style={styles.modelInfo}>
          <Text style={styles.modelInfoLabel}>
            Modelo utilizado
          </Text>

          <Text style={styles.modelInfoValue}>
            K-Means
          </Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>
        Dados do veículo
      </Text>

      <Card>
        <ProfileItem
          label="Modelo"
          value={vehicle.model || "Não informado"}
          noCard
        />

        <ProfileItem
          label="Ano"
          value={
            vehicle.year
              ? String(vehicle.year)
              : "Não informado"
          }
          noCard
        />

        <ProfileItem
          label="Quilometragem registrada"
          value={formatKilometers(vehicle.last_km)}
          noCard
        />
      </Card>
    </ScrollView>
  );
}

interface ProfileItemProps {
  label: string;
  value: string;
  noCard?: boolean;
}

function ProfileItem({
  label,
  value,
  noCard = false,
}: ProfileItemProps) {
  const content = (
    <View style={styles.itemContent}>
      <Text style={styles.itemLabel}>{label}</Text>

      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );

  if (noCard) {
    return (
      <View style={styles.itemWithoutCard}>
        {content}
      </View>
    );
  }

  return (
    <Card style={styles.item}>
      {content}
    </Card>
  );
}

function formatNumber(
  value: number | null
): string {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return value.toLocaleString("pt-BR");
}

function formatPercentage(
  value: number | null
): string {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return `${Math.round(value * 100)}%`;
}

function formatDays(
  value: number | null
): string {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return `${value} dias`;
}

function formatAverageInterval(
  value: number | null
): string {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return `${Math.round(value)} dias`;
}

function formatKilometers(
  value: number | null
): string {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  return `${Math.round(value).toLocaleString(
    "pt-BR"
  )} km`;
}

function formatServiceFrequency(
  value: number | null
): string {
  if (value === null || value === undefined) {
    return "Não informado";
  }

  if (value >= 7) {
    return "Alta";
  }

  if (value >= 4) {
    return "Moderada";
  }

  return "Baixa";
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

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  title: {
    ...typography.h1,
    color: colors.text,
  },

  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  profileCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.primaryLight,
  },

  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },

  profileTitle: {
    ...typography.title,
    color: colors.primaryDark,
  },

  profileDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  item: {
    marginBottom: spacing.sm,
  },

  itemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemWithoutCard: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  itemLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },

  itemValue: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: "right",
  },

  comparisonTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  comparisonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 20,
  },

  segmentBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },

  segmentLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  segmentValue: {
    ...typography.title,
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },

  modelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },

  modelInfoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  modelInfoValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  errorCard: {
    marginTop: spacing.lg,
  },

  errorTitle: {
    ...typography.title,
    color: colors.text,
  },

  errorText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});