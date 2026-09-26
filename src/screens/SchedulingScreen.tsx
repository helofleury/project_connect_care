import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../theme/colors";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { AppStackParamList } from "../navigation/types";

type RouteProps = RouteProp<AppStackParamList, "Scheduling">;

type NavigationProp =
  NativeStackNavigationProp<AppStackParamList>;

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
  const navigation = useNavigation<NavigationProp>();

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const [selectedTime, setSelectedTime] =
    useState<string | null>(null);

  const [isScheduling, setIsScheduling] =
    useState(false);

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert(
        "Selecione uma data e horário",
        "Escolha uma data e um horário para continuar."
      );

      return;
    }

    setIsScheduling(true);

    // Simula o processamento do agendamento.
    // Posteriormente vamos substituir esta parte
    // pela chamada ao schedulingService/backend.
    setTimeout(() => {
      setIsScheduling(false);

      Alert.alert(
        "Agendamento confirmado! 🎉",
        `Sua revisão foi agendada para ${selectedDate} às ${selectedTime}.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 600);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
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
          Concessionária selecionada:{" "}
          {route.params.dealershipId}
        </Text>
      </Card>

      <Text style={styles.sectionTitle}>
        Escolha uma data
      </Text>

      <View style={styles.options}>
        {dates.map((date) => {
          const selected = selectedDate === date;

          return (
            <Pressable
              key={date}
              onPress={() => setSelectedDate(date)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selectedOption,
                pressed && styles.pressedOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.selectedOptionText,
                ]}
              >
                {date}
              </Text>
            </Pressable>
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
            <Pressable
              key={time}
              onPress={() => setSelectedTime(time)}
              style={({ pressed }) => [
                styles.timeOption,
                selected && styles.selectedOption,
                pressed && styles.pressedOption,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.selectedOptionText,
                ]}
              >
                {time}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.confirmButton}>
        <Button
          title={
            isScheduling
              ? "Confirmando..."
              : "Confirmar agendamento"
          }
          onPress={handleSchedule}
          disabled={
            !selectedDate ||
            !selectedTime ||
            isScheduling
          }
        />
      </View>
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

  pressedOption: {
    opacity: 0.7,
  },

  optionText: {
    ...typography.bodySmall,
    color: colors.text,
  },

  selectedOptionText: {
    color: colors.textWhite,
    fontWeight: "600",
  },

  confirmButton: {
    marginTop: spacing.xl,
  },
});