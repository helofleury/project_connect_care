import {
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import RecommendationCard from "../components/RecommendationCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { AppStackParamList } from "../navigation/types";

type NavigationProp =
  NativeStackNavigationProp<AppStackParamList>;

export default function RecommendationScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Recomendações para Você</Text>

      <Text style={styles.subtitle}>
        Ações personalizadas com base no seu perfil.
      </Text>

      <RecommendationCard
        highlighted
        icon="🔧"
        title="Agendar Revisão"
        description="Detectamos que seu veículo está próximo da manutenção."
        actionLabel="Agendar agora"
        onPress={() =>
          navigation.navigate("DealershipSelection")
        }
      />

      <Text style={styles.sectionTitle}>
        Outras recomendações
      </Text>

      <RecommendationCard
        icon="🚗"
        title="Troca de pneus"
        description="Seus pneus estão próximos do limite de uso."
      />

      <RecommendationCard
        icon="🧰"
        title="Acessórios para Ranger"
        description="Confira acessórios recomendados para o seu veículo."
      />

      <RecommendationCard
        icon="💬"
        title="Fale com a concessionária"
        description="Tire dúvidas ou agende outros serviços."
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
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
});