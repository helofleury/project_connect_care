import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../theme/colors";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { AppStackParamList } from "../navigation/types";

type RouteProps = RouteProp<
  AppStackParamList,
  "Scheduling"
>;

const dates = [
  "12/09",
  "13/09",
  "15/09",
  "16/09",
];

const times = [
  "08:00",
  "09:30",
  "11:00",
  "14:00",
  "15:30",
  "17:00",
];

export default function SchedulingScreen() {
  const route = useRoute<RouteProps>();

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [selectedTime, setSelectedTime] =
    useState<string | null>(null);

  const handleSchedule = () => {
    // Scheduling service will be connected later.
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Agendar serviço
      </Text>

      <Text style={styles.subtitle}>
        Escolha a melhor data e horário para seu
        atendimento.
      </Text>

      <Card style={styles.summary}>
        <Text style={styles.summaryTitle}>
          Revisão programada
        </Text>

        <Text style={styles.summaryText}>
          Ford New América
        </Text>

        <Text style={styles.summaryText}>
          Concessionária selecionada: {route.params.dealershipId}
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>
        Escolha uma data
      </Text>

      <View style={styles.options}>
        {dates.map((date) => {
          const selected = selectedDate === date;

          return (
            <View
              key={date}
              style={[
                styles.option,
                selected && styles.selectedOption,
              ]}
            >
              <Text
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.optionText,
                  selected && styles.selectedOptionText,
                ]}
              >
                {date}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>
        Escolha um horário
      </Text>

      <View style={styles.options}>
        {times.map((time) => {
          const selected = selectedTime === time;

          return (
            <View
              key={time}
              style={[
                styles.timeOption,
                selected && styles.selectedOption,
              ]}
            >
              <Text
                onPress={() => setSelectedTime(time)}
                style={[
                  styles.optionText,
                  selected && styles.selectedOptionText,
                ]}
              >
                {time}
              </Text>
            </View>
          );
        })}
      </View>

      <Button
        title="Confirmar agendamento"
        onPress={handleSchedule}
        disabled={!selectedDate || !selectedTime}
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

  summary: {
    marginTop: spacing.lg,
  },

  summaryTitle: {
    ...typography.title,
    color: colors.text,
  },

  summaryText: {
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

  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },

  option: {
    minWidth: 75,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  timeOption: {
    minWidth: 85,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },

  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  optionText: {
    ...typography.bodySmall,
    color: colors.text,
  },

  selectedOptionText: {
    color: colors.textWhite,
    fontWeight: "600",
  },
});