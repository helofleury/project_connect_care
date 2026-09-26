import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Card from "../components/Card";
import type { AppStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

import { useVehicleHistory } from "../hooks/useVehicleHistory";

type NavigationProp =
  NativeStackNavigationProp<AppStackParamList>;

const DEMO_VIN =
  "7c1878b6f55e26922eb1955d2c1ea5689999868cb58cfb373b6742ce34a45b28";

/*
 * Quantidade máxima de históricos exibidos
 * por página.
 */
const ITEMS_PER_PAGE = 10;

export default function HistoryScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const {
    history,
    loading,
    error,
    refreshHistory,
  } = useVehicleHistory(DEMO_VIN);

  /*
   * Página atual.
   *
   * 1 = primeiros 10
   * 2 = próximos 10
   * etc.
   */
  const [currentPage, setCurrentPage] =
    useState(1);

  /*
   * Quantidade total de páginas.
   */
  const totalPages =
    Math.ceil(
      history.length / ITEMS_PER_PAGE
    );

  /*
   * Índices dos registros que serão
   * exibidos na página atual.
   */
  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const endIndex =
    startIndex + ITEMS_PER_PAGE;

  /*
   * Aqui acontece a paginação.
   *
   * Se existem 47 históricos:
   *
   * página 1 → [0...9]
   * página 2 → [10...19]
   * página 3 → [20...29]
   * etc.
   */
  const currentHistory =
    history.slice(
      startIndex,
      endIndex
    );

  /*
   * Caso o histórico seja atualizado
   * e a página atual deixe de existir,
   * voltamos para a última página válida.
   */
  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  /*
   * Quando atualizamos o histórico,
   * voltamos para a primeira página.
   */
  const handleRefresh = async () => {
    setCurrentPage(1);
    await refreshHistory();
  };

  /*
   * Vai para a página anterior.
   */
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(
        (page) => page - 1
      );
    }
  };

  /*
   * Vai para a próxima página.
   */
  const goToNextPage = () => {
    if (
      currentPage < totalPages
    ) {
      setCurrentPage(
        (page) => page + 1
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================== */}
        {/* HEADER                                             */}
        {/* ================================================== */}

        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={colors.text}
            />
          </Pressable>

          <Text
            style={styles.headerTitle}
          >
            Meu Histórico
          </Text>

          <View
            style={styles.headerSpacer}
          />
        </View>

        <Text style={styles.subtitle}>
          Histórico de serviços e manutenções
          realizadas no seu veículo.
        </Text>

        {/* ================================================== */}
        {/* LOADING                                            */}
        {/* ================================================== */}

        {loading && (
          <Card
            style={styles.loadingCard}
          >
            <ActivityIndicator
              size="large"
              color={colors.primary}
            />

            <Text
              style={styles.loadingText}
            >
              Carregando histórico...
            </Text>
          </Card>
        )}

        {/* ================================================== */}
        {/* ERRO                                               */}
        {/* ================================================== */}

        {!loading && error && (
          <Card
            style={styles.errorCard}
          >
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={colors.primary}
            />

            <Text
              style={styles.errorTitle}
            >
              Erro ao carregar histórico
            </Text>

            <Text
              style={styles.errorText}
            >
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={handleRefresh}
            >
              <Text
                style={styles.retryText}
              >
                Tentar novamente
              </Text>
            </Pressable>
          </Card>
        )}

        {/* ================================================== */}
        {/* HISTÓRICO                                          */}
        {/* ================================================== */}

        {!loading &&
          !error &&
          history.length > 0 && (
            <View>
              <Text
                style={styles.sectionTitle}
              >
                Serviços realizados
              </Text>

              {/* ================================================== */}
              {/* CONTADOR                                           */}
              {/* ================================================== */}

              <Text
                style={styles.totalText}
              >
                Exibindo{" "}
                {startIndex + 1}–
                {Math.min(
                  endIndex,
                  history.length
                )}{" "}
                de {history.length} registros
              </Text>

              {/* ================================================== */}
              {/* REGISTROS DA PÁGINA ATUAL                           */}
              {/* ================================================== */}

              {currentHistory.map(
                (item) => (
                  <Card
                    key={item.record_id}
                    style={
                      styles.historyCard
                    }
                  >
                    <View
                      style={
                        styles.historyIcon
                      }
                    >
                      <Ionicons
                        name="build-outline"
                        size={24}
                        color={
                          colors.primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.historyContent
                      }
                    >
                      <Text
                        style={
                          styles.historyTitle
                        }
                      >
                        {item.maintenance_number
                          ? `Manutenção ${item.maintenance_number}`
                          : "Serviço realizado"}
                      </Text>

                      {/* DATA */}

                      <View
                        style={
                          styles.infoRow
                        }
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color={
                            colors.textSecondary
                          }
                        />

                        <Text
                          style={
                            styles.infoText
                          }
                        >
                          Data:{" "}
                          {formatDate(
                            item.service_date
                          )}
                        </Text>
                      </View>

                      {/* QUILOMETRAGEM */}

                      <View
                        style={
                          styles.infoRow
                        }
                      >
                        <Ionicons
                          name="speedometer-outline"
                          size={16}
                          color={
                            colors.textSecondary
                          }
                        />

                        <Text
                          style={
                            styles.infoText
                          }
                        >
                          Quilometragem:{" "}
                          {formatKm(
                            item.km
                          )}
                        </Text>
                      </View>

                      {/* CONCESSIONÁRIA */}

                      <View
                        style={
                          styles.infoRow
                        }
                      >
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color={
                            colors.textSecondary
                          }
                        />

                        <Text
                          style={
                            styles.infoText
                          }
                        >
                          Concessionária:{" "}
                          {item.dealer_code ??
                            "Não informado"}
                        </Text>
                      </View>

                      {/* CÓDIGO DO SERVIÇO */}

                      {item.service_code && (
                        <View
                          style={
                            styles.infoRow
                          }
                        >
                          <Ionicons
                            name="construct-outline"
                            size={16}
                            color={
                              colors.textSecondary
                            }
                          />

                          <Text
                            style={
                              styles.infoText
                            }
                          >
                            Código do
                            serviço:{" "}
                            {
                              item.service_code
                            }
                          </Text>
                        </View>
                      )}

                      {/* ORIGEM */}

                      {item.main_source && (
                        <View
                          style={
                            styles.infoRow
                          }
                        >
                          <Ionicons
                            name="document-text-outline"
                            size={16}
                            color={
                              colors.textSecondary
                            }
                          />

                          <Text
                            style={
                              styles.infoText
                            }
                          >
                            Origem:{" "}
                            {
                              item.main_source
                            }
                          </Text>
                        </View>
                      )}

                      {/* GARANTIA */}

                      {item.warranty_phase && (
                        <View
                          style={
                            styles.infoRow
                          }
                        >
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={16}
                            color={
                              colors.textSecondary
                            }
                          />

                          <Text
                            style={
                              styles.infoText
                            }
                          >
                            Garantia:{" "}
                            {formatWarrantyPhase(
                              item.warranty_phase
                            )}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card>
                )
              )}

              {/* ================================================== */}
              {/* PAGINAÇÃO                                          */}
              {/* ================================================== */}

              {totalPages > 1 && (
                <View
                  style={
                    styles.pagination
                  }
                >
                  {/* ANTERIOR */}

                  <Pressable
                    style={[
                      styles.paginationButton,
                      currentPage === 1 &&
                        styles.paginationButtonDisabled,
                    ]}
                    onPress={
                      goToPreviousPage
                    }
                    disabled={
                      currentPage === 1
                    }
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={
                        currentPage === 1
                          ? colors.textSecondary
                          : colors.primary
                      }
                    />

                    <Text
                      style={[
                        styles.paginationText,
                        currentPage === 1 &&
                          styles.paginationTextDisabled,
                      ]}
                    >
                      Anterior
                    </Text>
                  </Pressable>

                  {/* INDICADOR DA PÁGINA */}

                  <View
                    style={
                      styles.pageIndicator
                    }
                  >
                    <Text
                      style={
                        styles.pageCurrent
                      }
                    >
                      {currentPage}
                    </Text>

                    <Text
                      style={
                        styles.pageSeparator
                      }
                    >
                      /
                    </Text>

                    <Text
                      style={
                        styles.pageTotal
                      }
                    >
                      {totalPages}
                    </Text>
                  </View>

                  {/* PRÓXIMO */}

                  <Pressable
                    style={[
                      styles.paginationButton,
                      currentPage ===
                        totalPages &&
                        styles.paginationButtonDisabled,
                    ]}
                    onPress={
                      goToNextPage
                    }
                    disabled={
                      currentPage ===
                      totalPages
                    }
                  >
                    <Text
                      style={[
                        styles.paginationText,
                        currentPage ===
                          totalPages &&
                          styles.paginationTextDisabled,
                      ]}
                    >
                      Próximo
                    </Text>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={
                        currentPage ===
                        totalPages
                          ? colors.textSecondary
                          : colors.primary
                      }
                    />
                  </Pressable>
                </View>
              )}
            </View>
          )}

        {/* ================================================== */}
        {/* SEM HISTÓRICO                                      */}
        {/* ================================================== */}

        {!loading &&
          !error &&
          history.length === 0 && (
            <Card
              style={styles.emptyCard}
            >
              <View
                style={
                  styles.iconContainer
                }
              >
                <Ionicons
                  name="time-outline"
                  size={38}
                  color={colors.primary}
                />
              </View>

              <Text
                style={styles.emptyTitle}
              >
                Nenhum histórico encontrado
              </Text>

              <Text
                style={styles.emptyText}
              >
                Ainda não encontramos registros
                de serviços para este veículo.
              </Text>
            </Card>
          )}

        {/* ================================================== */}
        {/* INFORMAÇÕES                                       */}
        {/* ================================================== */}

        <Text
          style={styles.sectionTitle}
        >
          Informações disponíveis
        </Text>

        <HistoryType
          icon="build-outline"
          title="Serviços e revisões"
          description="Manutenções realizadas no veículo."
        />

        <HistoryType
          icon="calendar-outline"
          title="Agendamentos"
          description="Serviços agendados e realizados."
        />

        <HistoryType
          icon="location-outline"
          title="Concessionárias"
          description="Concessionárias onde o veículo recebeu atendimento."
        />

        <HistoryType
          icon="shield-checkmark-outline"
          title="Garantia"
          description="Fase da garantia no momento do serviço."
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ========================================================== */
/* HISTORY TYPE                                                */
/* ========================================================== */

interface HistoryTypeProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function HistoryType({
  icon,
  title,
  description,
}: HistoryTypeProps) {
  return (
    <Card
      style={styles.historyTypeCard}
    >
      <View
        style={styles.historyTypeIcon}
      >
        <Ionicons
          name={icon}
          size={22}
          color={colors.primary}
        />
      </View>

      <View
        style={styles.historyTypeContent}
      >
        <Text
          style={styles.historyTypeTitle}
        >
          {title}
        </Text>

        <Text
          style={
            styles.historyTypeDescription
          }
        >
          {description}
        </Text>
      </View>
    </Card>
  );
}

/* ========================================================== */
/* FORMATTERS                                                  */
/* ========================================================== */

function formatDate(
  date: string | null
): string {
  if (!date) {
    return "Não informado";
  }

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatKm(
  km: number | null
): string {
  if (
    km === null ||
    km === undefined
  ) {
    return "Não informado";
  }

  return `${Number(
    km
  ).toLocaleString(
    "pt-BR"
  )} km`;
}

function formatWarrantyPhase(
  phase: string
): string {
  switch (phase) {
    case "0_3_YEARS":
      return "0 a 3 anos";

    case "3_5_YEARS":
      return "3 a 5 anos";

    case "5_PLUS_YEARS":
      return "Mais de 5 anos";

    default:
      return phase.replace(
        /_/g,
        " "
      );
  }
}

/* ========================================================== */
/* STYLES                                                       */
/* ========================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent:
      "center",
    borderRadius: 21,
    backgroundColor:
      colors.surface,
  },

  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },

  headerSpacer: {
    width: 42,
  },

  subtitle: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    marginTop: spacing.xs,
  },

  loadingCard: {
    alignItems: "center",
    marginTop: spacing.lg,
    paddingVertical:
      spacing.xl,
  },

  loadingText: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    marginTop: spacing.md,
  },

  errorCard: {
    alignItems: "center",
    marginTop: spacing.lg,
    paddingVertical:
      spacing.xl,
  },

  errorTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },

  errorText: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },

  retryButton: {
    backgroundColor:
      colors.primary,
    borderRadius: 10,
    paddingHorizontal:
      spacing.md,
    paddingVertical:
      spacing.sm,
    marginTop: spacing.md,
  },

  retryText: {
    ...typography.bodySmall,
    color:
      colors.background,
    fontWeight: "700",
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom:
      spacing.xs,
  },

  totalText: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    marginBottom:
      spacing.sm,
  },

  /* ======================================================== */
  /* HISTÓRICO                                                */
  /* ======================================================== */

  historyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },

  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent:
      "center",
    backgroundColor:
      colors.surfaceSecondary,
    marginRight:
      spacing.sm,
  },

  historyContent: {
    flex: 1,
  },

  historyTitle: {
    ...typography.title,
    color: colors.text,
    marginBottom:
      spacing.xs,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },

  infoText: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },

  /* ======================================================== */
  /* PAGINAÇÃO                                                */
  /* ======================================================== */

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },

  paginationButton: {
    minWidth: 105,
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
    gap: 4,
    borderRadius: 10,
    backgroundColor:
      colors.surface,
    borderWidth: 1,
    borderColor:
      colors.border,
    paddingHorizontal:
      spacing.sm,
  },

  paginationButtonDisabled: {
    opacity: 0.5,
  },

  paginationText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "700",
  },

  paginationTextDisabled: {
    color:
      colors.textSecondary,
  },

  pageIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
    minWidth: 50,
  },

  pageCurrent: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "800",
  },

  pageSeparator: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    marginHorizontal: 4,
  },

  pageTotal: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    fontWeight: "600",
  },

  /* ======================================================== */
  /* VAZIO                                                    */
  /* ======================================================== */

  emptyCard: {
    alignItems: "center",
    marginTop: spacing.lg,
    paddingVertical:
      spacing.xl,
  },

  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent:
      "center",
    backgroundColor:
      colors.surfaceSecondary,
  },

  emptyTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },

  emptyText: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginTop: spacing.xs,
  },

  /* ======================================================== */
  /* TIPOS DE HISTÓRICO                                       */
  /* ======================================================== */

  historyTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  historyTypeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent:
      "center",
    backgroundColor:
      colors.surfaceSecondary,
    marginRight:
      spacing.sm,
  },

  historyTypeContent: {
    flex: 1,
  },

  historyTypeTitle: {
    ...typography.title,
    color: colors.text,
  },

  historyTypeDescription: {
    ...typography.bodySmall,
    color:
      colors.textSecondary,
    marginTop: spacing.xs,
  },
});
