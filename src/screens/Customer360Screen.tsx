import { Ionicons } from "@expo/vector-icons";

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { useAuth } from "../hooks/useAuth";
import { useCustomer } from "../hooks/useCustomer";
import { useVehicle } from "../hooks/useVehicle";
import { useCustomerSummary } from "../hooks/useCustomerSummary";
import { useCustomerNotifications } from "../hooks/useCustomerNotifications";
import { useVehiclePrediction } from "../hooks/useVehiclePrediction";

import { useTheme } from "../contexts/ThemeContext";

import Card from "../components/Card";

import type {
  AppStackParamList,
} from "../navigation/types";

import {
  typography,
} from "../theme/typography";

type Nav =
  NativeStackNavigationProp<
    AppStackParamList
  >;

/*
 * IMPORTANTE:
 * Este é o mesmo VIN usado pela PredictionScreen
 * e pelo useVehicle.ts atualmente.
 */
const DEMO_VIN =
  "7c1878b6f55e26922eb1955d2c1ea5689999868cb58cfb373b6742ce34a45b28";

export default function Customer360Screen() {
  const navigation =
    useNavigation<Nav>();

  const { colors } =
    useTheme();

  const {
    user,
    customer: account,
  } = useAuth();

  const {
    customer,
    loading: customerLoading,
    refreshCustomer,
  } = useCustomer(user?.uid);

  const {
    vehicle,
    loading: vehicleLoading,
    refreshVehicle,
  } = useVehicle(user?.uid);

  /*
   * IMPORTANTE:
   *
   * A PredictionScreen usa DEMO_VIN.
   *
   * O useVehicle.ts também usa DEMO_VIN.
   *
   * Então usamos o mesmo VIN aqui para garantir
   * que os scores venham exatamente da mesma
   * previsão.
   */
  const vinHash =
    DEMO_VIN;

  const {
    summary,
  } = useCustomerSummary(
    vinHash
  );

  const {
    unreadCount,
  } = useCustomerNotifications(
    vinHash
  );

  const {
    prediction,
    mlPrediction,
    loading:
      predictionLoading,
  } = useVehiclePrediction(
    vinHash
  );

  const loading =
    customerLoading ||
    vehicleLoading ||
    predictionLoading;

  const name =
    customer?.name?.trim() ||
    account?.name?.trim() ||
    user?.displayName?.trim() ||
    "Cliente Ford";

  const styles =
    createStyles(colors);

  /*
   * ==========================================
   * MESMA LÓGICA DA PREDICTIONSCREEN
   * ==========================================
   */

  const healthScore =
    prediction?.risk_score != null
      ? clampScore(
          100 -
            Number(
              prediction.risk_score
            )
        )
      : null;

  const reliabilityScore =
    mlPrediction?.probability_percent !=
    null
      ? clampScore(
          100 -
            Number(
              mlPrediction
                .probability_percent
            )
        )
      : prediction?.risk_score != null
      ? clampScore(
          100 -
            Number(
              prediction.risk_score
            )
        )
      : null;

  const refresh = async () =>
    Promise.all([
      refreshCustomer(),
      refreshVehicle(),
    ]);

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safe}
        edges={["top"]}
      >
        <View
          style={styles.center}
        >
          <ActivityIndicator
            size="small"
            color={colors.primary}
          />

          <Text
            style={
              styles.centerText
            }
          >
            Carregando seus dados...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
          />
        }
      >
        <View
          style={styles.topbar}
        >
          <Text
            style={styles.topTitle}
          >
            ConnectCare 360
          </Text>

          <Pressable
            style={styles.bell}
            onPress={() =>
              navigation.navigate(
                "Tabs",
                {
                  screen:
                    "Engagement",
                }
              )
            }
          >
            <Ionicons
              name="notifications-outline"
              size={21}
              color={colors.text}
            />

            {unreadCount > 0 && (
              <View
                style={styles.dot}
              />
            )}
          </Pressable>
        </View>

        <Pressable
          style={styles.hero}
          onPress={() =>
            navigation.navigate(
              "Profile"
            )
          }
        >
          <View
            style={styles.heroAvatar}
          >
            <Text
              style={
                styles.heroAvatarText
              }
            >
              {initial(name)}
            </Text>
          </View>

          <View
            style={styles.heroCopy}
          >
            <Text
              style={
                styles.heroGreeting
              }
            >
              Olá, {name}!
            </Text>

            <Text
              style={styles.heroText}
            >
              Aqui, tecnologia e cuidado acompanham sua jornada.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={19}
            color="#B9D5FF"
          />
        </Pressable>

        {vehicle && (
          <Pressable
            onPress={() =>
              navigation.navigate(
                "Vehicle"
              )
            }
          >
            <Card
              style={
                styles.vehicleCard
              }
            >
              <View
                style={
                  styles.vehicleVisual
                }
              >
                <Ionicons
                  name="car-sport"
                  size={62}
                  color={colors.primary}
                />
              </View>

              <View
                style={
                  styles.vehicleInfo
                }
              >
                <Text
                  style={
                    styles.vehicleModel
                  }
                >
                  {vehicle.model}
                </Text>

                <Text
                  style={
                    styles.vehicleMeta
                  }
                >
                  {vehicle.year} • VIN
                  protegido
                </Text>

                <View
                  style={
                    styles.activeLine
                  }
                >
                  <View
                    style={
                      styles.activeDot
                    }
                  />

                  <Text
                    style={
                      styles.activeText
                    }
                  >
                    Ativo
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        )}

        <View
          style={styles.segmentTabs}
        >
          <View
            style={[
              styles.segment,
              styles.segmentActive,
            ]}
          >
            <Text
              style={
                styles.segmentActiveText
              }
            >
              Resumo
            </Text>
          </View>

          <Pressable
            style={styles.segment}
            onPress={() =>
              navigation.navigate(
                "Vehicle"
              )
            }
          >
            <Text
              style={styles.segmentText}
            >
              Meu veículo
            </Text>
          </Pressable>

          <Pressable
            style={styles.segment}
            onPress={() =>
              navigation.navigate(
                "History"
              )
            }
          >
            <Text
              style={styles.segmentText}
            >
              Meu histórico
            </Text>
          </Pressable>
        </View>

        <Text
          style={styles.sectionTitle}
        >
          Resumo do relacionamento
        </Text>

        <Card>
          <Info
            icon="calendar-outline"
            label="Cliente desde"
            value={
              customer?.customerSince ||
              "15/03/2022"
            }
            colors={colors}
          />

          

          <Info
            icon="shield-checkmark-outline"
            label="Garantia"
            value={
              customer?.warranty ||
              "Válida até 15/03/2027"
            }
            colors={colors}
          />

          <Info
            icon="speedometer-outline"
            label="Quilometragem atual"
            value={`${(
              vehicle?.mileage ??
              customer?.currentMileage ??
              0
            ).toLocaleString(
              "pt-BR"
            )} km`}
            colors={colors}
          />

          <Info
            icon="construct-outline"
            label="Próxima revisão"
            value={
              summary?.next_maintenance
                ?.message ||
              "Consulte seu próximo serviço"
            }
            colors={colors}
            last
          />
        </Card>

        <Text
          style={styles.sectionTitle}
        >
          Meus scores
        </Text>

        <View
          style={styles.scoreRow}
        >
          <Score
            label="Customer Health Score"
            score={healthScore}
            colors={colors}
          />

          <Score
            label="Vehicle Health Score"
            score={reliabilityScore}
            colors={colors}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function initial(
  value: string
) {
  return (
    value
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "C"
  );
}

function clampScore(
  value: number
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value)
    )
  );
}

function getScoreStatus(
  score: number
) {
  if (score >= 80) {
    return "Muito bom";
  }

  if (score >= 60) {
    return "Atenção";
  }

  return "Crítico";
}

function getScoreColor(
  score: number,
  colors: any
) {
  if (score >= 80) {
    return colors.success;
  }

  if (score >= 60) {
    return colors.warning;
  }

  return (
    colors.danger ||
    "#DC2626"
  );
}

function Info({
  icon,
  label,
  value,
  colors,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
  last?: boolean;
}) {
  return (
    <View
      style={[
        infoStyles.row,
        !last && {
          borderBottomWidth: 1,
          borderBottomColor:
            colors.divider,
        },
      ]}
    >
      <View
        style={infoStyles.left}
      >
        <Ionicons
          name={icon}
          size={15}
          color={
            colors.textSecondary
          }
        />

        <Text
          style={[
            infoStyles.label,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          infoStyles.value,
          {
            color: colors.text,
          },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function Score({
  label,
  score,
  colors,
}: {
  label: string;
  score: number | null;
  colors: any;
}) {
  /*
   * Não exibe 0 como valor falso.
   * Se ainda não houver previsão, mostra --.
   */
  if (score == null) {
    return (
      <Card
        style={scoreStyles.card}
      >
        <Text
          style={[
            scoreStyles.label,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>

        <View
          style={
            scoreStyles.valueRow
          }
        >
          <Text
            style={[
              scoreStyles.score,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            --
          </Text>

          <Text
            style={[
              scoreStyles.max,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {" "}
            /100
          </Text>
        </View>

        <Text
          style={[
            scoreStyles.good,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          Indisponível
        </Text>

        <View
          style={[
            scoreStyles.track,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />
      </Card>
    );
  }

  const value =
    clampScore(score);

  const scoreColor =
    getScoreColor(
      value,
      colors
    );

  return (
    <Card
      style={scoreStyles.card}
    >
      <Text
        style={[
          scoreStyles.label,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>

      <View
        style={
          scoreStyles.valueRow
        }
      >
        <Text
          style={[
            scoreStyles.score,
            {
              color: colors.text,
            },
          ]}
        >
          {value}
        </Text>

        <Text
          style={[
            scoreStyles.max,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {" "}
          /100
        </Text>
      </View>

      <Text
        style={[
          scoreStyles.good,
          {
            color: scoreColor,
          },
        ]}
      >
        {getScoreStatus(value)}
      </Text>

      <View
        style={[
          scoreStyles.track,
          {
            backgroundColor:
              colors.divider,
          },
        ]}
      >
        <View
          style={[
            scoreStyles.fill,
            {
              width: `${value}%`,
              backgroundColor:
                scoreColor,
            },
          ]}
        />
      </View>
    </Card>
  );
}

const infoStyles =
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      paddingVertical: 11,
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
      fontWeight: "600",
      maxWidth: "52%",
      textAlign: "right",
    },
  });

const scoreStyles =
  StyleSheet.create({
    card: {
      flex: 1,
      padding: 12,
    },

    label: {
      ...typography.caption,
    },

    valueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: 5,
    },

    score: {
      fontSize: 24,
      fontWeight: "800",
    },

    max: {
      ...typography.caption,
    },

    good: {
      ...typography.caption,
      fontWeight: "700",
      marginTop: 2,
    },

    track: {
      height: 5,
      borderRadius: 5,
      overflow: "hidden",
      marginTop: 7,
    },

    fill: {
      height: "100%",
      borderRadius: 5,
    },
  });

function createStyles(
  colors: any
) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    content: {
      padding: 14,
      paddingBottom: 30,
    },

    topbar: {
      height: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    topTitle: {
      ...typography.title,
      color: colors.text,
      fontWeight: "800",
    },

    bell: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.surface,
    },

    dot: {
      position: "absolute",
      right: 7,
      top: 6,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        colors.danger,
    },

    hero: {
      backgroundColor: "#082C67",
      borderRadius: 18,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      marginTop: 7,
    },

    heroAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },

    heroAvatarText: {
      fontSize: 20,
      fontWeight: "800",
      color: "#082C67",
    },

    heroCopy: {
      flex: 1,
      marginHorizontal: 11,
    },

    heroGreeting: {
      fontSize: 15,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    heroText: {
      fontSize: 12,
      lineHeight: 14,
      color: "#D7E8FF",
      marginTop: 2,
    },

    vehicleCard: {
      marginTop: 12,
      padding: 10,
      flexDirection: "row",
      alignItems: "center",
    },

    vehicleVisual: {
      width: 94,
      height: 66,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.surfaceSecondary,
      borderRadius: 12,
    },

    vehicleInfo: {
      flex: 1,
      marginLeft: 11,
    },

    vehicleModel: {
      ...typography.bodyMedium,
      color: colors.text,
      fontWeight: "800",
    },

    vehicleMeta: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 2,
    },

    activeLine: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
    },

    activeDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        colors.success,
    },

    activeText: {
      ...typography.caption,
      color: colors.success,
      fontWeight: "700",
      marginLeft: 5,
    },

    segmentTabs: {
      flexDirection: "row",
      marginTop: 12,
      backgroundColor:
        colors.surface,
      borderRadius: 11,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },

    segment: {
      flex: 1,
      paddingVertical: 9,
      alignItems: "center",
    },

    segmentActive: {
      borderBottomWidth: 2,
      borderBottomColor:
        colors.primary,
    },

    segmentText: {
      ...typography.caption,
      color: colors.textSecondary,
    },

    segmentActiveText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "800",
    },

    sectionTitle: {
      ...typography.label,
      color: colors.text,
      marginTop: 17,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },

    scoreRow: {
      flexDirection: "row",
      gap: 9,
    },

    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        colors.background,
    },

    centerText: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 8,
    },
  });
}