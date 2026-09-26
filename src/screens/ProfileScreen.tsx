import { Ionicons } from "@expo/vector-icons";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Card from "../components/Card";

import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";

import type { AppStackParamList } from "../navigation/types";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, customer, logout } = useAuth();

  const displayName = customer?.name ?? user?.email ?? "Cliente Ford";
  const displayEmail = user?.email ?? "E-mail não disponível";

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza de que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <Pressable
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Perfil
        </Text>

        <View style={styles.backButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{getInitial(displayName)}</Text>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>
            {displayName}
          </Text>

          <Text style={[styles.email, { color: colors.textSecondary }]}>
            {displayEmail}
          </Text>
        </View>

        <SectionTitle label="Informações da conta" />

        <Card>
          <InfoRow
            icon="person-outline"
            label="Nome"
            value={displayName}
          />

          <InfoRow icon="mail-outline" label="E-mail" value={displayEmail} />

          <InfoRow
            icon="calendar-outline"
            label="Cliente desde"
            value="Não informado"
            isLast
          />
        </Card>

        <SectionTitle label="Preferências" />

        <Card>
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <Ionicons
                name="moon-outline"
                size={18}
                color={colors.textSecondary}
                style={styles.rowIcon}
              />

              <View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>
                  Modo escuro
                </Text>

                <Text
                  style={[
                    styles.rowSubLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Opcional — ajuste conforme sua preferência
                </Text>
              </View>
            </View>

            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        <SectionTitle label="Configurações" />

        <Card>
          <SettingsRow
            icon="notifications-outline"
            label="Preferências de comunicação"
            onPress={() => navigation.navigate("CommunicationPreferences")}
          />

          <SettingsRow
            icon="lock-closed-outline"
            label="Privacidade e segurança"
            onPress={() =>
              Alert.alert(
                "Privacidade e segurança",
                "Em breve você poderá gerenciar suas configurações de privacidade por aqui."
              )
            }
          />

          <SettingsRow
            icon="help-circle-outline"
            label="Ajuda e suporte"
            onPress={() =>
              Alert.alert(
                "Ajuda e suporte",
                "Fale com a concessionária mais próxima ou use o Assistente Ford."
              )
            }
          />

          <SettingsRow
            icon="information-circle-outline"
            label="Sobre o app"
            isLast
            onPress={() =>
              Alert.alert("Ford Customer 360", "Versão 1.0.0")
            }
          />
        </Card>

        <Pressable
          style={[styles.logoutButton, { borderColor: colors.danger }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />

          <Text style={[styles.logoutText, { color: colors.danger }]}>
            Sair da conta
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ label }: { label: string }) {
  const { colors } = useTheme();

  return (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {label}
    </Text>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isLast?: boolean;
}

function InfoRow({ icon, label, value, isLast }: InfoRowProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider },
      ]}
    >
      <View style={styles.rowLabelContainer}>
        <Ionicons
          name={icon}
          size={18}
          color={colors.textSecondary}
          style={styles.rowIcon}
        />

        <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </View>

      <Text
        style={[styles.rowValue, { color: colors.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

function SettingsRow({ icon, label, onPress, isLast }: SettingsRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[
        styles.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.divider },
      ]}
      onPress={onPress}
    >
      <View style={styles.rowLabelContainer}>
        <Ionicons
          name={icon}
          size={18}
          color={colors.textSecondary}
          style={styles.rowIcon}
        />

        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </Pressable>
  );
}

function getInitial(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    return "?";
  }

  return trimmed.charAt(0).toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    ...typography.title,
  },

  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  profileHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  avatarText: {
    ...typography.h1,
    color: "#FFFFFF",
  },

  name: {
    ...typography.h3,
  },

  email: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },

  sectionTitle: {
    ...typography.title,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },

  rowLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm,
  },

  rowIcon: {
    marginRight: spacing.sm,
  },

  rowLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
  },

  rowSubLabel: {
    ...typography.caption,
    marginTop: 2,
  },

  rowValue: {
    ...typography.bodySmall,
    fontWeight: "600",
    maxWidth: "45%",
    textAlign: "right",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },

  logoutText: {
    ...typography.button,
  },
});