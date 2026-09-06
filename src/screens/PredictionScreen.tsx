import {
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import PredictionCard from "../components/PredictionCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function PredictionScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Previsões para Você</Text>

      <Text style={styles.subtitle}>
        Antecipamos suas próximas necessidades.
      </Text>

      <Text style={styles.sectionTitle}>
        Riscos e oportunidades
      </Text>

      <PredictionCard
        icon="🚙"
        title="Continue em dia com sua Ford"
        description="Mantenha seu Ford com ótimo desempenho e valor de revenda."
      />

      <PredictionCard
        icon="🔧"
        title="Próxima manutenção prevista"
        description="Sua próxima revisão está próxima."
        value="5.200 km"
      />

      <PredictionCard
        icon="🛡️"
        title="Uso de garantia"
        description="Você possui itens de garantia disponíveis."
        value="Elegível para 2 itens"
      />

      <Text style={styles.sectionTitle}>
        Linha do tempo prevista
      </Text>

      <PredictionCard
        icon="🔍"
        title="Revisão"
        description="Próxima revisão prevista."
        value="Em 45 dias • 5.000 km"
      />

      <PredictionCard
        icon="📅"
        title="Próximo serviço"
        description="Previsão de novo atendimento."
        value="Em 3 meses"
      />

      <PredictionCard
        icon="🚘"
        title="Nova revisão"
        description="Próxima oportunidade identificada."
        value="Em 6 meses"
      />
    </ScrollView>
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

  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});