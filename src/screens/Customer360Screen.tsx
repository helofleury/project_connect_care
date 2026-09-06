import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Card from "../components/Card";
import ScoreCard from "../components/ScoreCard";
import VehicleCard from "../components/VehicleCard";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function Customer360Screen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, João!</Text>

          <Text style={styles.headerDescription}>
            Aqui você é novamente conectado
            ao seu relacionamento com a Ford.
          </Text>
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>J</Text>
        </View>
      </View>

      <VehicleCard
        model="Ranger XLT 2.2 4x4"
        year="2022"
        fuel="Diesel"
      />

      <Text style={styles.sectionTitle}>
        Resumo do seu relacionamento
      </Text>

      <Card>
        <InfoRow
          label="Cliente desde"
          value="16/03/2022"
        />

        <InfoRow
          label="Concessionário principal"
          value="Ford Nova América"
        />

        <InfoRow
          label="Garantia"
          value="Válida até 16/03/2027"
        />

        <InfoRow
          label="Quilometragem atual"
          value="13.000 km"
        />

        <InfoRow
          label="Próxima revisão"
          value="5.200 km"
        />
      </Card>

      <View style={styles.scoreRow}>
        <ScoreCard
          title="Relacionamento"
          score={820}
          maxScore={1500}
          description="Muito bom"
        />

        <ScoreCard
          title="Fidelidade"
          score={620}
          maxScore={1900}
          description="Bom"
        />
      </View>
    </ScrollView>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },

  greeting: {
    ...typography.h2,
    color: colors.text,
  },

  headerDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    maxWidth: 280,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    ...typography.title,
    color: colors.textWhite,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },

  infoValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },

  scoreRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});