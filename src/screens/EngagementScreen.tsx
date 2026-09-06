import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Card from "../components/Card";
import Button from "../components/Button";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function EngagementScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Como Falamos com Você</Text>

      <Text style={styles.subtitle}>
        Personalizamos nossas comunicações de acordo
        com suas preferências.
      </Text>

      <Text style={styles.sectionTitle}>
        Seu canal preferido
      </Text>

      <Card>
        <Text style={styles.icon}>💬</Text>

        <Text style={styles.cardTitle}>WhatsApp</Text>

        <Text style={styles.description}>
          É o canal onde você recebe melhor nossas
          mensagens.
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>
        Melhor momento para falar
      </Text>

      <Card>
        <Text style={styles.icon}>🕐</Text>

        <Text style={styles.cardTitle}>
          Terças e quintas
        </Text>

        <Text style={styles.description}>
          Entre 10h - 12h
        </Text>

        <Text style={styles.preference}>
          Melhor horário de abertura
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>
        Últimas interações
      </Text>

      <Interaction
        channel="WhatsApp"
        message="Lembrete de rodízio"
        date="12/08/2024"
      />

      <Interaction
        channel="Email"
        message="Campanha de acessórios"
        date="26/08/2024"
      />

      <Button
        title="Atualizar preferências"
        onPress={() => {}}
      />
    </ScrollView>
  );
}

interface InteractionProps {
  channel: string;
  message: string;
  date: string;
}

function Interaction({
  channel,
  message,
  date,
}: InteractionProps) {
  return (
    <Card style={styles.interaction}>
      <View style={styles.interactionContent}>
        <View>
          <Text style={styles.channel}>{channel}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <Text style={styles.date}>{date}</Text>
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

  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  icon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },

  cardTitle: {
    ...typography.title,
    color: colors.text,
  },

  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  preference: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.sm,
  },

  interaction: {
    marginBottom: spacing.sm,
  },

  interactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  channel: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  date: {
    ...typography.caption,
    color: colors.textLight,
  },
});