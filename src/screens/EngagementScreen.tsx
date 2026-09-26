import { Ionicons } from "@expo/vector-icons";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useEngagement } from "../hooks/useEngagement";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const priorityLabel: Record<string, string> = { HIGH: "ALTA PRIORIDADE", MEDIUM: "ACOMPANHAMENTO", LOW: "SEM URGÊNCIA" };

export default function EngagementScreen() {
  const { colors } = useTheme();
  const { customer } = useAuth();
  const { decision, history, historyLoading, error, refresh } = useEngagement(customer?.customer_id ?? null);
  const styles = createStyles(colors);

  return <SafeAreaView style={styles.safe} edges={["top"]}>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={historyLoading} onRefresh={refresh} />} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><View style={{ flex: 1 }}><Text style={styles.title}>Engagement</Text><Text style={styles.subtitle}>O ConnectCare 360 analisa o perfil, o comportamento e a previsão do veículo para identificar quando uma comunicação é relevante.</Text></View><Ionicons name="sparkles-outline" size={26} color={colors.primary} /></View>

      <Card style={styles.automaticCard}>
        <View style={styles.statusIcon}><Ionicons name="flash-outline" size={22} color={colors.primary} /></View>
        <View style={{ flex: 1 }}><Text style={styles.cardTitle}>Comunicação proativa</Text><Text style={styles.cardText}>O cliente controla suas preferências, enquanto o motor de Engagement decide quando comunicar, com base nos dados do veículo e na análise preditiva.</Text></View>
      </Card>

      <Text style={styles.section}>DECISÃO MAIS RECENTE</Text>
      {decision ? <Card>
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: decision.priority === "HIGH" ? colors.dangerLight : decision.priority === "MEDIUM" ? colors.warningLight : colors.successLight }]}><Text style={[styles.badgeText, { color: decision.priority === "HIGH" ? colors.danger : decision.priority === "MEDIUM" ? colors.warning : colors.success }]}>{priorityLabel[decision.priority]}</Text></View>
          <Text style={styles.channel}>{channelLabel(decision.channels, decision.channel)}</Text>
        </View>
        <Text style={styles.messageTitle}>{decision.title}</Text>
        <Text style={styles.message}>{decision.message}</Text>

        <View style={styles.reasonBox}>
          <View style={styles.reasonHeader}><Ionicons name="bulb-outline" size={18} color={colors.primary} /><Text style={styles.reasonTitle}>Por que o sistema decidiu isso?</Text></View>
          <Text style={styles.reason}>{decision.reason}</Text>
        </View>

        <View style={styles.delivery}><Ionicons name={decision.delivery_status === "sent" ? "checkmark-circle-outline" : "information-circle-outline"} size={18} color={decision.delivery_status === "sent" ? colors.success : colors.textSecondary} /><Text style={styles.deliveryText}>{deliveryLabel(decision.delivery_status)}</Text></View>
      </Card> : <Card><Text style={styles.cardText}>Nenhuma comunicação registrada ainda.</Text></Card>}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.section}>HISTÓRICO</Text>
      {history.map((item) => <Card key={item.decision_id} style={styles.historyCard}><View style={styles.historyTop}><Text style={styles.historyTitle}>{item.title}</Text><Text style={styles.historyDate}>{formatDate(item.created_at)}</Text></View><Text style={styles.historyMeta}>{channelLabel(item.channels, item.channel)} · {priorityLabel[item.priority]} · {deliveryLabel(item.delivery_status)}</Text><Text style={styles.historyReason}>{item.reason}</Text></Card>)}
      {!history.length ? <Text style={styles.empty}>As próximas decisões de Engagement aparecerão aqui.</Text> : null}
    </ScrollView>
  </SafeAreaView>;
}

function channelLabel(channels: string[] | undefined, legacyChannel: string): string {
  const selected = channels?.length ? channels : legacyChannel === "whatsapp" ? ["whatsapp"] : legacyChannel === "email" ? ["email"] : legacyChannel.split("+");
  const labels = selected.map((channel) => channel === "whatsapp" ? "WhatsApp" : channel === "email" ? "E-mail" : "Nenhum");
  return labels.join(" + ");
}
function deliveryLabel(status: string): string { if (status === "sent") return "Enviado"; if (status === "partial") return "Enviado parcialmente"; if (status === "not_configured") return "Aguardando configuração do canal"; if (status === "failed") return "Falha no envio"; return "Não enviado"; }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }); }



function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    safe: {
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
      marginBottom: spacing.md,
    },

    title: {
      ...typography.h1,
      color: colors.text,
      fontSize: 24,
    },

    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: spacing.xs,
      lineHeight: 18,
      paddingRight: spacing.sm,
    },

    automaticCard: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },

    statusIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    cardTitle: {
      ...typography.h3,
      color: colors.text,
      fontSize: 16,
      marginBottom: 3,
    },

    cardText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },

    section: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
      fontWeight: "700",
      marginBottom: spacing.xs,
      marginTop: spacing.sm,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },

    badge: {
      paddingHorizontal: spacing.xs,
      paddingVertical: 5,
      borderRadius: 8,
    },

    badgeText: {
      ...typography.caption,
      fontSize: 11,
      fontWeight: "700",
    },

    channel: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: "right",
    },

    messageTitle: {
      ...typography.h3,
      color: colors.text,
      fontSize: 16,
      marginTop: spacing.sm,
    },

    message: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      marginTop: spacing.xs,
    },

    reasonBox: {
      marginTop: spacing.md,
      padding: spacing.sm,
      borderRadius: 11,
      backgroundColor: colors.background,
    },

    reasonHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    reasonTitle: {
      ...typography.bodySmall,
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
    },

    reason: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 17,
      marginTop: spacing.xs,
    },

    delivery: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.md,
    },

    deliveryText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 12,
    },

    historyCard: {
      marginBottom: spacing.xs,
    },

    historyTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
    },

    historyTitle: {
      ...typography.bodySmall,
      color: colors.text,
      fontSize: 13,
      fontWeight: "700",
      flex: 1,
    },

    historyDate: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
    },

    historyMeta: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
      marginTop: 4,
    },

    historyReason: {
      ...typography.caption,
      color: colors.textSecondary,
      fontSize: 11,
      lineHeight: 16,
      marginTop: 3,
    },

    empty: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: "center",
      marginTop: spacing.md,
    },

    error: {
      ...typography.bodySmall,
      color: colors.danger,
      fontSize: 13,
      marginVertical: spacing.sm,
    },
  });
}
