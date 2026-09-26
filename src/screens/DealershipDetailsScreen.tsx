import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import Card from "../components/Card";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

import { useDealerships } from "../hooks/useDealerships";

import { useTheme } from "../contexts/ThemeContext";

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

  const navigation =
    useNavigation<NavigationProp>();

  const { colors } = useTheme();

  const { dealershipId } = route.params;

  const {
    getDealershipById,
    loading,
  } = useDealerships();

  const dealership =
    getDealershipById(dealershipId);

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading />

        <Text style={styles.loadingText}>
          Carregando concessionária...
        </Text>
      </View>
    );
  }

  if (!dealership) {
    return (
      <View style={styles.center}>
        <ErrorMessage
          message="Não foi possível encontrar essa concessionária."
        />

        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.topbar}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.text}
            />
          </Pressable>

          <Text style={styles.topbarTitle}>
            Concessionária
          </Text>

          <View style={styles.topbarSpacer} />
        </View>

        {/* Nome + status */}
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {dealership.name}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color={colors.textSecondary}
              />

              <Text style={styles.address}>
                {dealership.address}, {dealership.city}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.status,
              !dealership.available &&
                styles.unavailable,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                !dealership.available &&
                  styles.statusDotUnavailable,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                !dealership.available &&
                  styles.statusTextUnavailable,
              ]}
            >
              {dealership.available
                ? "Aberta"
                : "Indisponível"}
            </Text>
          </View>
        </View>

        {/* Informações */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            Informações
          </Text>

          <InfoRow
            icon="navigate-outline"
            label="Distância"
            value={dealership.distance}
            colors={colors}
          />

          <InfoRow
            icon="star-outline"
            label="Avaliação"
            value={`${dealership.rating}`}
            colors={colors}
          />

          <InfoRow
            icon="time-outline"
            label="Horário"
            value={dealership.openingHours}
            colors={colors}
          />

          <InfoRow
            icon="call-outline"
            label="Telefone"
            value={dealership.phone}
            colors={colors}
            last
          />
        </Card>

        {/* Serviços */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            Serviços disponíveis
          </Text>

          {dealership.services.map(
            (service) => (
              <View
                key={service}
                style={styles.serviceRow}
              >
                <View style={styles.serviceIcon}>
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={colors.primary}
                  />
                </View>

                <Text style={styles.service}>
                  {service}
                </Text>
              </View>
            ),
          )}
        </Card>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <Button
            title="Agendar serviço"
            onPress={() =>
              navigation.navigate(
                "Scheduling",
                {
                  dealershipId:
                    dealership.id,
                },
              )
            }
            disabled={!dealership.available}
          />
        </View>

        {!dealership.available && (
          <Text style={styles.unavailableMessage}>
            Esta concessionária não está disponível
            para agendamento no momento.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
  last?: boolean;
}

function InfoRow({
  icon,
  label,
  value,
  colors,
  last,
}: InfoRowProps) {
  return (
    <View
      style={[
        infoStyles.row,
        !last && {
          borderBottomWidth: 1,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <View style={infoStyles.left}>
        <Ionicons
          name={icon}
          size={16}
          color={colors.textSecondary}
        />

        <Text
          style={[
            infoStyles.label,
            { color: colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          infoStyles.value,
          { color: colors.text },
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      paddingHorizontal: 14,
      paddingTop: 50,
      paddingBottom: 34,
},

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: colors.background,
    },

    loadingText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 10,
    },

    topbar: {
      height: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },

    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    topbarTitle: {
      ...typography.bodyMedium,
      color: colors.text,
      fontWeight: "800",
    
    },

    topbarSpacer: {
      width: 36,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 4,
    },

    titleContainer: {
      flex: 1,
      marginRight: 10,
    },

    title: {
      ...typography.title,
      color: colors.text,
      fontWeight: "800",
      lineHeight: 23,
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },

    address: {
      ...typography.caption,
      color: colors.textSecondary,
      marginLeft: 4,
      flex: 1,
    },

    status: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.successLight,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
      marginTop: 2,
    },

    unavailable: {
      backgroundColor: colors.dangerLight,
    },

    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.success,
      marginRight: 5,
    },

    statusDotUnavailable: {
      backgroundColor: colors.danger,
    },

    statusText: {
      fontSize: 10,
      color: colors.success,
      fontWeight: "800",
    },

    statusTextUnavailable: {
      color: colors.danger,
    },

    card: {
      marginTop: 12,
      padding: 14,
    },

    cardTitle: {
      ...typography.bodyMedium,
      color: colors.text,
      fontWeight: "800",
      marginBottom: 5,
    },

    serviceRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
    },

    serviceIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryLight,
      marginRight: 9,
    },

    service: {
      ...typography.bodySmall,
      color: colors.text,
      flex: 1,
    },

    ctaContainer: {
      marginTop: 18,
    },

    unavailableMessage: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
      marginTop: 9,
    },
  });
}

const infoStyles = StyleSheet.create({
  row: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },

  label: {
    ...typography.caption,
  },

  value: {
    ...typography.caption,
    fontWeight: "700",
    maxWidth: "55%",
    textAlign: "right",
  },
});