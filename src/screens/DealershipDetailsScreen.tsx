import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import Card from "../components/Card";
import Button from "../components/Button";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { AppStackParamList } from "../navigation/types";

type RouteProps = RouteProp<
  AppStackParamList,
  "DealershipDetails"
>;

type NavigationProp =
  NativeStackNavigationProp<AppStackParamList>;

export default function DealershipDetailsScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();

  const { dealershipId } = route.params;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Ford New América
        </Text>

        <View style={styles.status}>
          <Text style={styles.statusText}>
            Aberta
          </Text>
        </View>
      </View>

      <Text style={styles.address}>
        📍 Av. das Nações, 1200
      </Text>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>
          Informações
        </Text>

        <InfoRow
          label="Distância"
          value="2,4 km"
        />

        <InfoRow
          label="Horário"
          value="08h - 18h"
        />

        <InfoRow
          label="Telefone"
          value="(11) 4000-0000"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>
          Serviços recomendados
        </Text>

        <Text style={styles.service}>
          ✓ Revisão programada
        </Text>

        <Text style={styles.service}>
          ✓ Troca de óleo
        </Text>

        <Text style={styles.service}>
          ✓ Diagnóstico do veículo
        </Text>
      </Card>

      <Button
        title="Agendar serviço"
        onPress={() =>
          navigation.navigate("Scheduling", {
            dealershipId,
          })
        }
      />
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
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    ...typography.h1,
    color: colors.text,
    flex: 1,
  },

  status: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },

  statusText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: "600",
  },

  address: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  card: {
    marginTop: spacing.lg,
  },

  cardTitle: {
    ...typography.title,
    color: colors.text,
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
  },

  infoValue: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "500",
  },

  service: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.sm,
  },
});