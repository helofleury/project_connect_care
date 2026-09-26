
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import DealerShipCard from "../components/DealershipCard";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";

import { useDealerships } from "../hooks/useDealerships";

import { useTheme } from "../contexts/ThemeContext";

import { typography } from "../theme/typography";

import type { AppStackParamList } from "../navigation/types";

type NavigationProp =
  NativeStackNavigationProp<AppStackParamList>;

export default function DealershipSelectionScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const { colors } = useTheme();

  const {
    dealerships,
    loading,
    error,
    refreshDealerships,
  } = useDealerships();

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading />

        <Text style={styles.loadingText}>
          Carregando concessionárias...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <ErrorMessage message={error} />

        <Pressable
          style={styles.retryButton}
          onPress={refreshDealerships}
        >
          <Ionicons
            name="refresh-outline"
            size={17}
            color={colors.primary}
          />

          <Text style={styles.retry}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshDealerships}
            tintColor={colors.primary}
          />
        }
      >
        {/* Cabeçalho compacto */}
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

          <View style={styles.topbarTitleContainer}>
            <Text style={styles.topbarTitle}>
              Agendamento
            </Text>
          </View>

          <View style={styles.topbarSpacer} />
        </View>

        {/* Título */}
        <View style={styles.heading}>
          <Text style={styles.title}>
            Escolher Concessionária
          </Text>

          <Text style={styles.subtitle}>
            Selecione uma concessionária para
            realizar seu serviço.
          </Text>
        </View>

        {/* Indicador */}
        <View style={styles.helperCard}>
          <View style={styles.helperIcon}>
            <Ionicons
              name="location-outline"
              size={19}
              color={colors.primary}
            />
          </View>

          <View style={styles.helperContent}>
            <Text style={styles.helperTitle}>
              Encontre a melhor opção
            </Text>

            <Text style={styles.helperText}>
              Veja distância, disponibilidade e
              serviços antes de escolher.
            </Text>
          </View>
        </View>

        {dealerships.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="business-outline"
                size={28}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Nenhuma concessionária encontrada
            </Text>

            <Text style={styles.emptyText}>
              Não encontramos concessionárias
              disponíveis no momento.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {dealerships.map(
              (dealership) => (
                <DealerShipCard
                  key={dealership.id}
                  name={dealership.name}
                  address={`${dealership.address}, ${dealership.city}`}
                  distance={dealership.distance}
                  available={dealership.available}
                  onPress={() =>
                    navigation.navigate(
                      "DealershipDetails",
                      {
                        dealershipId:
                          dealership.id,
                      },
                    )
                  }
                />
              ),
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    /*
     * Aumentei o espaço superior de 6 para 35.
     *
     * Isso faz toda a tela descer um pouco,
     * sem alterar os componentes ou a estrutura.
     */
    content: {
      paddingHorizontal: 14,
      paddingTop: 35,
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

    topbarTitleContainer: {
      flex: 1,
      alignItems: "center",
    },

    topbarTitle: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "700",
    },

    topbarSpacer: {
      width: 36,
    },

    heading: {
      marginTop: 5,
      marginBottom: 12,
    },

    title: {
      fontSize: 23,
      lineHeight: 28,
      color: colors.text,
      fontWeight: "800",
    },

    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 17,
      marginTop: 3,
    },

    helperCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primaryLight,
      borderRadius: 14,
      padding: 11,
      marginBottom: 12,
    },

    helperIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      marginRight: 10,
    },

    helperContent: {
      flex: 1,
    },

    helperTitle: {
      ...typography.caption,
      color: colors.text,
      fontWeight: "800",
    },

    helperText: {
      fontSize: 10,
      lineHeight: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },

    list: {
      gap: 10,
    },

    retryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: colors.primaryLight,
    },

    retry: {
      ...typography.bodySmall,
      color: colors.primary,
      fontWeight: "700",
      marginLeft: 7,
    },

    empty: {
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 55,
    },

    emptyIcon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryLight,
      marginBottom: 12,
    },

    emptyTitle: {
      ...typography.bodyMedium,
      color: colors.text,
      fontWeight: "800",
      textAlign: "center",
    },

    emptyText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 17,
      marginTop: 5,
    },
  });
}
