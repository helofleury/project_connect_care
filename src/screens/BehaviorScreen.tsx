import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Card from "../components/Card";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function BehaviorScreen() {
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
          Você valoriza custo-benefício
        </Text>

        <Text style={styles.profileDescription}>
          Você prioriza soluções eficientes e serviços
          essenciais para o seu veículo.
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>
        Características do seu perfil
      </Text>

      <ProfileItem
        label="Frequência de serviços"
        value="Moderada"
      />

      <ProfileItem
        label="Preferência de canal"
        value="WhatsApp"
      />

      <ProfileItem
        label="Sensibilidade a preço"
        value="Alta"
      />

      <ProfileItem
        label="Uso do veículo"
        value="Urbano"
      />

      <ProfileItem
        label="Engajamento com ofertas"
        value="Médio"
      />

      <Text style={styles.sectionTitle}>
        Seus padrões
      </Text>

      <Card>
        <Text style={styles.comparisonTitle}>
          Comparativo com outros clientes
        </Text>

        <Text style={styles.comparisonText}>
          Você está entre os 65% dos clientes com
          perfil semelhante.
        </Text>

        <View style={styles.progressBackground}>
          <View style={styles.progress} />
        </View>

        <View style={styles.progressLabels}>
          <Text style={styles.label}>0%</Text>
          <Text style={styles.label}>65%</Text>
          <Text style={styles.label}>100%</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

interface ProfileItemProps {
  label: string;
  value: string;
}

function ProfileItem({ label, value }: ProfileItemProps) {
  return (
    <Card style={styles.item}>
      <View style={styles.itemContent}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value}</Text>
      </View>
    </Card>
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
  },

  itemLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  itemValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  comparisonTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  comparisonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  progressBackground: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: spacing.md,
  },

  progress: {
    width: "65%",
    height: "100%",
    backgroundColor: colors.primary,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },

  label: {
    ...typography.caption,
    color: colors.textLight,
  },
});