
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

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

import { useCustomerSummary } from "../hooks/useCustomerSummary";
import { useVehiclePrediction } from "../hooks/useVehiclePrediction";
import { useTheme } from "../contexts/ThemeContext";
import Card from "../components/Card";
import { DEMO_VIN } from "../constants/demo";
import type { AppStackParamList } from "../navigation/types";
import { typography } from "../theme/typography";

type Nav = NativeStackNavigationProp<AppStackParamList>;

export default function PredictionScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const { summary, loading: summaryLoading } =
    useCustomerSummary(DEMO_VIN);

  const {
    prediction,
    mlPrediction,
    nextMaintenance,
    loading,
    error,
  } = useVehiclePrediction(DEMO_VIN);

  const [showHealthInfo, setShowHealthInfo] = useState(false);
  const [showReliabilityInfo, setShowReliabilityInfo] =
    useState(false);

  const styles = createStyles(colors);

  if (loading || summaryLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />

        <Text style={styles.centerText}>
          Carregando previsões...
        </Text>
      </View>
    );
  }

  /*
   * ============================================================
   * DADOS REAIS
   * ============================================================
   */

  const risk = String(
    prediction?.risk_level || "BAIXO"
  ).toUpperCase();

  /*
   * SAÚDE DO VEÍCULO
   *
   * O backend fornece risk_score de 0 a 100.
   *
   * Quanto maior o risco, menor a saúde.
   *
   * Exemplo:
   *
   * risk_score = 20
   * healthScore = 80
   *
   * risk_score = 45
   * healthScore = 55
   *
   * risk_score = 80
   * healthScore = 20
   *
   * Portanto, não existe mais um valor fixo
   * para ALTO, MÉDIO ou BAIXO.
   */

  const healthScore = prediction
    ? clampScore(100 - prediction.risk_score)
    : 0;

  /*
   * CONFIABILIDADE
   *
   * O Random Forest fornece probability_percent.
   *
   * Esse percentual representa a probabilidade
   * de risco prevista pelo modelo.
   *
   * Portanto, para representar confiabilidade:
   *
   * confiabilidade = 100 - probabilidade de risco
   *
   * Exemplo:
   *
   * probability_percent = 15
   * reliabilityScore = 85
   *
   * probability_percent = 40
   * reliabilityScore = 60
   *
   * probability_percent = 75
   * reliabilityScore = 25
   *
   * O valor vem do modelo, não é escolhido
   * manualmente no aplicativo.
   *
   * Se o Random Forest não retornar esse valor,
   * usamos o risk_score real como fallback.
   */

  const reliabilityScore =
    mlPrediction?.probability_percent != null
      ? clampScore(
          100 - mlPrediction.probability_percent
        )
      : prediction
      ? clampScore(100 - prediction.risk_score)
      : 0;

  const nextKm =
    nextMaintenance?.estimated_next_km;

  const healthStatus = getScoreStatus(
    healthScore
  );

  const reliabilityStatus = getScoreStatus(
    reliabilityScore
  );

  const riskInfo = getRiskInfo(risk);

  /*
   * Agora o modelo vem do backend.
   *
   * Antes:
   * "Seu Ford"
   *
   * Agora:
   * prediction.model
   *
   * Se a API não retornar o modelo,
   * usamos "Seu Ford" apenas como fallback
   * de apresentação.
   */

  const vehicleModel =
    prediction?.model || "Seu Ford";

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="sparkles"
              size={19}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Seu futuro, mais tranquilo
            </Text>

            <Text style={styles.subtitle}>
              Previsões para {vehicleModel}
            </Text>
          </View>
        </View>

        {/* SAÚDE */}

        <Card style={styles.scoreCard}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.cardIcon,
                {
                  backgroundColor:
                    getScoreLightColor(
                      healthScore,
                      colors
                    ),
                },
              ]}
            >
              <Ionicons
                name="heart"
                size={18}
                color={getScoreColor(
                  healthScore,
                  colors
                )}
              />
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardLabel}>
                VEHICLE HEALTH SCORE
              </Text>

              <Text style={styles.cardTitle}>
                {healthStatus.label}
              </Text>
            </View>

            <Pressable
              style={styles.infoButton}
              onPress={() =>
                setShowHealthInfo(
                  !showHealthInfo
                )
              }
            >
              <Ionicons
                name={
                  showHealthInfo
                    ? "close"
                    : "information-outline"
                }
                size={16}
                color={colors.primary}
              />
            </Pressable>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreValueRow}>
              <Text
                style={[
                  styles.scoreValue,
                  {
                    color: getScoreColor(
                      healthScore,
                      colors
                    ),
                  },
                ]}
              >
                {healthScore}
              </Text>

              <Text style={styles.scoreTotal}>
                /100
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    getScoreLightColor(
                      healthScore,
                      colors
                    ),
                },
              ]}
            >
              <Ionicons
                name={
                  healthStatus.icon as any
                }
                size={13}
                color={getScoreColor(
                  healthScore,
                  colors
                )}
              />

              <Text
                style={[
                  styles.statusPillText,
                  {
                    color: getScoreColor(
                      healthScore,
                      colors
                    ),
                  },
                ]}
              >
                {healthStatus.label}
              </Text>
            </View>
          </View>

          <ScoreBar
            score={healthScore}
            colors={colors}
          />

          {showHealthInfo && (
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.primary}
              />

              <Text style={styles.infoText}>
                Indicador calculado a partir do
                nível de risco identificado no
                histórico real do veículo.
              </Text>
            </View>
          )}
        </Card>

        {/* CONFIABILIDADE */}

        <Card style={styles.scoreCard}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.cardIcon,
                {
                  backgroundColor:
                    getScoreLightColor(
                      reliabilityScore,
                      colors
                    ),
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={getScoreColor(
                  reliabilityScore,
                  colors
                )}
              />
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardLabel}>
                CUSTOMER HEALTH SCORE
              </Text>

              <Text style={styles.cardTitle}>
                {reliabilityStatus.label}
              </Text>
            </View>

            <Pressable
              style={styles.infoButton}
              onPress={() =>
                setShowReliabilityInfo(
                  !showReliabilityInfo
                )
              }
            >
              <Ionicons
                name={
                  showReliabilityInfo
                    ? "close"
                    : "information-outline"
                }
                size={16}
                color={colors.primary}
              />
            </Pressable>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreValueRow}>
              <Text
                style={[
                  styles.scoreValue,
                  {
                    color: getScoreColor(
                      reliabilityScore,
                      colors
                    ),
                  },
                ]}
              >
                {reliabilityScore}
              </Text>

              <Text style={styles.scoreTotal}>
                /100
              </Text>
            </View>

            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor:
                    getScoreLightColor(
                      reliabilityScore,
                      colors
                    ),
                },
              ]}
            >
              <Ionicons
                name={
                  reliabilityStatus.icon as any
                }
                size={13}
                color={getScoreColor(
                  reliabilityScore,
                  colors
                )}
              />

              <Text
                style={[
                  styles.statusPillText,
                  {
                    color: getScoreColor(
                      reliabilityScore,
                      colors
                    ),
                  },
                ]}
              >
                {reliabilityStatus.label}
              </Text>
            </View>
          </View>

          <ScoreBar
            score={reliabilityScore}
            colors={colors}
          />

          {showReliabilityInfo && (
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.primary}
              />

              <Text style={styles.infoText}>
                Indicador baseado na probabilidade
                de risco calculada pelo modelo de
                Machine Learning.
              </Text>
            </View>
          )}
        </Card>

        {/* PRÓXIMA MANUTENÇÃO */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Próximo cuidado
            </Text>

            <Text style={styles.sectionSubtitle}>
              O que vem pela frente
            </Text>
          </View>
        </View>

        <Card style={styles.maintenanceCard}>
          <View style={styles.maintenanceIcon}>
            <Ionicons
              name="construct-outline"
              size={19}
              color={colors.primary}
            />
          </View>

          <View style={styles.maintenanceContent}>
            <Text style={styles.maintenanceTitle}>
              Próxima manutenção
            </Text>

            <Text style={styles.maintenanceText}>
              {summary?.next_maintenance?.message ||
                "Acompanhe o momento ideal para a próxima revisão."}
            </Text>

            {nextKm ? (
              <View style={styles.kmRow}>
                <Ionicons
                  name="speedometer-outline"
                  size={14}
                  color={colors.primary}
                />

                <Text style={styles.kmText}>
                  {Math.round(
                    nextKm
                  ).toLocaleString("pt-BR")}{" "}
                  km
                </Text>
              </View>
            ) : null}
          </View>
        </Card>

        {/* INDICADORES DE RISCO */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              O que observar
            </Text>

            <Text style={styles.sectionSubtitle}>
              Pontos importantes para o seu Ford
            </Text>
          </View>
        </View>

        <View style={styles.attentionGrid}>
          <AttentionCard
            icon="disc-outline"
            title="Pneus"
            text="Verificação"
            colors={colors}
          />

          <AttentionCard
            icon="water-outline"
            title="Óleo"
            text="Manutenção"
            colors={colors}
          />

          <AttentionCard
            icon="car-outline"
            title="Freios"
            text="Verificação"
            colors={colors}
          />

          <AttentionCard
            icon="calendar-outline"
            title="Revisão"
            text="Acompanhar"
            colors={colors}
          />
        </View>

        {/* TENDÊNCIA */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Tendência
            </Text>

            <Text style={styles.sectionSubtitle}>
              Seus indicadores hoje
            </Text>
          </View>
        </View>

        <Card style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={styles.trendTitle}>
                Momento atual
              </Text>

              <Text style={styles.trendText}>
                {risk === "ALTO"
                  ? "Requer atenção"
                  : risk === "MEDIO" ||
                    risk === "MÉDIO"
                  ? "Acompanhe de perto"
                  : "Tudo sob controle"}
              </Text>
            </View>

            <View
              style={[
                styles.trendIcon,
                {
                  backgroundColor:
                    riskInfo.background,
                },
              ]}
            >
              <Ionicons
                name={
                  risk === "ALTO"
                    ? "trending-down"
                    : "trending-up"
                }
                size={20}
                color={riskInfo.color}
              />
            </View>
          </View>

          {/*
           * Mantemos o MESMO layout da barra,
           * mas agora a barra representa o valor
           * real de saúde.
           *
           * Não existem mais 94%, 76% e 58%.
           */}

          <View style={styles.trendBar}>
            <View
              style={[
                styles.trendSegment,
                {
                  width: `${healthScore}%`,
                  backgroundColor:
                    getScoreColor(
                      healthScore,
                      colors
                    ),
                },
              ]}
            />
          </View>

          <View style={styles.trendLabels}>
            <Text style={styles.trendLabel}>
              Risco
            </Text>

            <Text style={styles.trendLabel}>
              Atenção
            </Text>

            <Text style={styles.trendLabel}>
              Excelente
            </Text>
          </View>
        </Card>

        {/* CTA */}

        <Pressable
          style={styles.cta}
          onPress={() =>
            navigation.navigate(
              "DealershipSelection"
            )
          }
        >
          <View style={styles.ctaIcon}>
            <Ionicons
              name="calendar-outline"
              size={19}
              color={colors.primary}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>
              Agendar revisão
            </Text>

            <Text style={styles.ctaSubtitle}>
              Escolha uma concessionária
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#FFFFFF"
          />
        </Pressable>

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* COMPONENTES                                                                */
/* -------------------------------------------------------------------------- */

function ScoreBar({
  score,
  colors,
}: {
  score: number;
  colors: any;
}) {
  const color = getScoreColor(
    score,
    colors
  );

  return (
    <View style={stylesBar.container}>
      <View
        style={[
          stylesBar.background,
          {
            backgroundColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            stylesBar.progress,
            {
              width: `${clampScore(score)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function AttentionCard({
  icon,
  title,
  text,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  colors: any;
}) {
  return (
    <View
      style={[
        stylesAttention.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          stylesAttention.icon,
          {
            backgroundColor:
              colors.primaryLight,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={colors.primary}
        />
      </View>

      <Text
        style={[
          stylesAttention.title,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          stylesAttention.text,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function clampScore(
  value: number
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(value))
  );
}

function getScoreStatus(score: number) {
  if (score >= 80) {
    return {
      label: "Bom",
      icon: "checkmark-circle",
    };
  }

  if (score >= 60) {
    return {
      label: "Atenção",
      icon: "alert-circle",
    };
  }

  return {
    label: "Crítico",
    icon: "warning",
  };
}

function getScoreColor(
  score: number,
  colors: any
) {
  if (score >= 80) {
    return "#16A34A";
  }

  if (score >= 60) {
    return "#F5B942";
  }

  return colors.danger || "#DC2626";
}

function getScoreLightColor(
  score: number,
  colors: any
) {
  if (score >= 80) {
    return "#E8F7EE";
  }

  if (score >= 60) {
    return "#FFF4D6";
  }

  return "#FDECEC";
}

function getRiskInfo(
  risk: string
) {
  if (risk === "ALTO") {
    return {
      label: "Crítico",
      color: "#DC2626",
      background: "#FDECEC",
    };
  }

  if (
    risk === "MEDIO" ||
    risk === "MÉDIO"
  ) {
    return {
      label: "Atenção",
      color: "#F5B942",
      background: "#FFF4D6",
    };
  }

  return {
    label: "Bom",
    color: "#16A34A",
    background: "#E8F7EE",
  };
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const stylesBar = StyleSheet.create({
  container: {
    marginTop: 12,
  },

  background: {
    height: 7,
    borderRadius: 10,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    borderRadius: 10,
  },
});

const stylesAttention = StyleSheet.create({
  card: {
    width: "48.5%",
    minHeight: 93,
    borderRadius: 14,
    borderWidth: 1,
    padding: 11,
    marginBottom: 9,
  },

  icon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  title: {
    fontSize: 13,
    fontWeight: "900",
  },

  text: {
    fontSize: 11,
    marginTop: 2,
  },
});

function createStyles(colors: any) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },

    content: {
      padding: 14,
      paddingBottom: 35,
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },

    centerText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: 9,
    },

    /* HEADER */

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 13,
    },

    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    headerText: {
      flex: 1,
    },

    title: {
      ...typography.title,
      color: colors.text,
      fontWeight: "900",
      fontSize: 19,
    },

    subtitle: {
      fontSize: 10.5,
      color: colors.textSecondary,
      marginTop: 2,
    },

    /* SCORE */

    scoreCard: {
      padding: 14,
      marginBottom: 10,
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    cardIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 9,
    },

    cardHeaderText: {
      flex: 1,
    },

    cardLabel: {
      fontSize: 8.5,
      fontWeight: "900",
      letterSpacing: 0.6,
      color: colors.primary,
    },

    cardTitle: {
      fontSize: 12.5,
      fontWeight: "800",
      color: colors.text,
      marginTop: 2,
    },

    infoButton: {
      width: 29,
      height: 29,
      borderRadius: 15,
      backgroundColor:
        colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    scoreRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 13,
    },

    scoreValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
    },

    scoreValue: {
      fontSize: 31,
      fontWeight: "900",
      letterSpacing: -0.5,
    },

    scoreTotal: {
      fontSize: 11,
      color: colors.textSecondary,
      marginLeft: 3,
    },

    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 20,
    },

    statusPillText: {
      fontSize: 9,
      fontWeight: "800",
      marginLeft: 4,
    },

    infoBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        colors.primaryLight,
      borderRadius: 11,
      padding: 9,
      marginTop: 11,
    },

    infoText: {
      flex: 1,
      fontSize: 9.5,
      lineHeight: 14,
      color: colors.textSecondary,
      marginLeft: 7,
    },

    /* SECTION */

    sectionHeader: {
      marginTop: 5,
      marginBottom: 8,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
    },

    sectionSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },

    /* MAINTENANCE */

    maintenanceCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 13,
      marginBottom: 14,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },

    maintenanceIcon: {
      width: 40,
      height: 40,
      borderRadius: 11,
      backgroundColor:
        colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },

    maintenanceContent: {
      flex: 1,
    },

    maintenanceTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 3,
    },

    maintenanceText: {
      fontSize: 9.5,
      lineHeight: 14,
      color: colors.textSecondary,
    },

    kmRow: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        colors.primaryLight,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 9,
      marginTop: 7,
    },

    kmText: {
      fontSize: 9,
      fontWeight: "900",
      color: colors.primary,
      marginLeft: 4,
    },

    /* ATTENTION */

    attentionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 7,
    },

    /* TREND */

    trendCard: {
      padding: 14,
      marginBottom: 14,
    },

    trendHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    trendTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.text,
    },

    trendText: {
      fontSize: 9.5,
      color: colors.textSecondary,
      marginTop: 2,
    },

    trendIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    trendBar: {
      height: 7,
      borderRadius: 10,
      overflow: "hidden",
      flexDirection: "row",
      marginTop: 14,
      backgroundColor: colors.border,
    },

    trendSegment: {
      height: "100%",
    },

    trendLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 5,
    },

    trendLabel: {
      fontSize: 8,
      color: colors.textSecondary,
    },

    /* CTA */

    cta: {
      minHeight: 61,
      borderRadius: 15,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 11,
      paddingVertical: 9,
    },

    ctaIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 9,
    },

    ctaTitle: {
      fontSize: 12,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    ctaSubtitle: {
      fontSize: 12,
      color: "#FFFFFF",
      opacity: 0.82,
      marginTop: 2,
    },

    error: {
      ...typography.caption,
      color: colors.danger,
      marginTop: 10,
    },
  });
}
