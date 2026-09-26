import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Card from "../components/Card";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useCommunicationPreferences } from "../hooks/useEngagement";
import type { AppStackParamList } from "../navigation/types";
import type { CommunicationPreferences, EngagementChannel } from "../services/engagementService";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function CommunicationPreferencesScreen() {
  const navigation = useNavigation<Nav>();
  const { customer } = useAuth();
  const { colors } = useTheme();
  const { preferences, loading, saving, error, save } = useCommunicationPreferences(customer?.customer_id ?? null);
  const styles = createStyles(colors);

  const update = (patch: Partial<CommunicationPreferences>) => {
    if (preferences) void save({ ...preferences, ...patch });
  };

  const toggleChannel = (
    field: "news_channels" | "alert_channels" | "recommendation_channels",
    channel: EngagementChannel,
  ) => {
    if (channel === "whatsapp" && !customer?.phone) {
      Alert.alert("WhatsApp indisponível", "Cadastre um telefone para usar o WhatsApp como canal.");
      return;
    }
    if (channel === "email" && !customer?.email) {
      Alert.alert("E-mail indisponível", "Cadastre um e-mail para usar o e-mail como canal.");
      return;
    }

    const current = preferences?.[field] ?? [];
    const next = current.includes(channel)
      ? current.filter((item) => item !== channel)
      : [...current, channel];
    update({ [field]: next });
  };

  if (loading || !preferences) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}><Text style={[styles.loading, { color: colors.textSecondary }]}>Carregando preferências...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={[styles.back, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={22} color={colors.text} /></Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Preferências</Text>
        <View style={styles.back} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.introTitle, { color: colors.text }]}>Como você quer receber nossas comunicações?</Text>
        <Text style={[styles.intro, { color: colors.textSecondary }]}>Você controla os canais. O ConnectCare 360 usa análise preditiva e IA para identificar quando uma comunicação é relevante para o seu perfil e comportamento.</Text>

        <PreferenceCard title="Alertas do veículo" description="Manutenção, riscos e avisos importantes." enabled={preferences.allow_alerts} channels={preferences.alert_channels} onEnabled={(value) => update({ allow_alerts: value })} onChannel={(channel) => toggleChannel("alert_channels", channel)} />
        <PreferenceCard title="Novidades" description="Novidades, campanhas e oportunidades." enabled={preferences.allow_news} channels={preferences.news_channels} onEnabled={(value) => update({ allow_news: value })} onChannel={(channel) => toggleChannel("news_channels", channel)} />
        <PreferenceCard title="Recomendações" description="Sugestões personalizadas para o seu veículo." enabled={preferences.allow_recommendations} channels={preferences.recommendation_channels} onEnabled={(value) => update({ allow_recommendations: value })} onChannel={(channel) => toggleChannel("recommendation_channels", channel)} />

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        {saving ? <Text style={[styles.saved, { color: colors.textSecondary }]}>Salvando...</Text> : null}
        <Button title="Voltar" variant="outline" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PreferenceCard({ title, description, enabled, channels, onEnabled, onChannel }: { title: string; description: string; enabled: boolean; channels: EngagementChannel[]; onEnabled: (value: boolean) => void; onChannel: (channel: EngagementChannel) => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <Card style={styles.card}>
    <View style={styles.cardTop}><View style={{ flex: 1 }}><Text style={[styles.title, { color: colors.text }]}>{title}</Text><Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text></View><Switch value={enabled} onValueChange={onEnabled} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.surface} /></View>
    <Text style={[styles.channelLabel, { color: colors.textSecondary }]}>CANAIS DE RECEBIMENTO</Text>
    <Text style={[styles.helper, { color: colors.textSecondary }]}>Selecione um, os dois ou nenhum.</Text>
    <View style={styles.channels}>
      <ChannelButton label="WhatsApp" icon="logo-whatsapp" selected={channels.includes("whatsapp")} onPress={() => onChannel("whatsapp")} />
      <ChannelButton label="E-mail" icon="mail-outline" selected={channels.includes("email")} onPress={() => onChannel("email")} />
    </View>
  </Card>;
}

function ChannelButton({ label, icon, selected, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return <Pressable onPress={onPress} style={[styles.channel, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primaryLight : colors.surface }]}><Ionicons name={icon} size={19} color={selected ? colors.primary : colors.textSecondary} /><Text style={[styles.channelText, { color: selected ? colors.primary : colors.text }]}>{label}</Text>{selected ? <Ionicons name="checkmark-circle" size={18} color={colors.primary} /> : null}</Pressable>;
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    safe: { flex: 1 }, loading: { flex: 1, textAlign: "center", paddingTop: 80, ...typography.body },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    back: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" }, headerTitle: { ...typography.title },
    content: { padding: spacing.md, paddingBottom: spacing.xxxl }, introTitle: { ...typography.h3, marginBottom: spacing.xs }, intro: { ...typography.bodySmall, marginBottom: spacing.lg, lineHeight: 20 }, card: { marginBottom: spacing.md }, cardTop: { flexDirection: "row", alignItems: "center" }, title: { ...typography.h3 }, description: { ...typography.bodySmall, marginTop: 3, paddingRight: spacing.sm }, channelLabel: { ...typography.caption, marginTop: spacing.md, marginBottom: 2 }, helper: { ...typography.caption, marginBottom: spacing.xs }, channels: { gap: spacing.xs }, channel: { minHeight: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.xs }, channelText: { ...typography.bodySmall, fontWeight: "600", flex: 1 }, error: { ...typography.bodySmall, marginBottom: spacing.sm }, saved: { ...typography.caption, textAlign: "center", marginBottom: spacing.sm },
  });
}
