
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useRecommendations } from "../hooks/useRecommendations";
import { useTheme } from "../contexts/ThemeContext";
import type { AppStackParamList } from "../navigation/types";
import { typography } from "../theme/typography";
import Card from "../components/Card";

type Nav = NativeStackNavigationProp<AppStackParamList>;

const FILTERS = [
  "Todos",
  "Manutenção",
  "Acessórios",
  "Serviços",
] as const;

export default function RecommendationScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();

  const {
    recommendations,
    loading,
    error,
    refreshRecommendations,
  } = useRecommendations();

  const [filter, setFilter] =
    useState<(typeof FILTERS)[number]>("Todos");

  const styles = createStyles(colors);

  /* ============================================================
     MANUTENÇÃO
     ============================================================ */

  const maintenanceItems = [
    {
      id: "maintenance-revision",
      icon: "construct-outline",
      title: "Revisão preventiva",
      description:
        "Mantenha seu Ford em dia com uma revisão preventiva e evite problemas futuros.",
      actionLabel: "Agendar revisão",
    },
    {
      id: "maintenance-oil",
      icon: "water-outline",
      title: "Troca de óleo",
      description:
        "A troca de óleo ajuda a preservar o motor e manter o desempenho do seu Ford.",
      actionLabel: "Ver serviço",
    },
    {
      id: "maintenance-tires",
      icon: "disc-outline",
      title: "Verificação dos pneus",
      description:
        "Confira o estado dos pneus e mantenha a segurança e estabilidade do seu veículo.",
      actionLabel: "Verificar pneus",
    },
    {
      id: "maintenance-brakes",
      icon: "stop-circle-outline",
      title: "Sistema de freios",
      description:
        "Uma inspeção dos freios ajuda a identificar desgastes antes que eles se tornem um problema.",
      actionLabel: "Ver serviço",
    },
  ];

  /* ============================================================
     ACESSÓRIOS
     ============================================================ */

  const accessories = [
    {
      id: "accessory-tapetes",
      icon: "car-outline",
      title: "Tapetes",
      description:
        "Mais proteção e praticidade para o interior.",
      actionLabel: "Ver opções",
    },
    {
      id: "accessory-bagageiro",
      icon: "cube-outline",
      title: "Bagageiro",
      description:
        "Mais espaço para viagens e para a sua rotina.",
      actionLabel: "Ver opções",
    },
    {
      id: "accessory-protecao",
      icon: "shield-checkmark-outline",
      title: "Proteção",
      description:
        "Itens para ajudar a preservar o seu veículo.",
      actionLabel: "Ver opções",
    },
  ];

  /* ============================================================
     OFERTAS E BENEFÍCIOS
     ============================================================ */

  const offers = [
    {
      id: "offer-maintenance",
      icon: "pricetag-outline",
      badge: "BENEFÍCIO PARA VOCÊ",
      title: "Condições especiais",
      description:
        "Aproveite benefícios exclusivos em serviços selecionados para o seu Ford.",
      actionLabel: "Ver benefícios",
    },
    {
      id: "offer-profile",
      icon: "gift-outline",
      badge: "OFERTA PERSONALIZADA",
      title: "Benefícios para o seu perfil",
      description:
        "Ofertas pensadas de acordo com a sua rotina e o comportamento de uso do veículo.",
      actionLabel: "Explorar ofertas",
    },
    {
      id: "offer-accessories",
      icon: "car-outline",
      badge: "PARA O SEU FORD",
      title: "Acessórios selecionados",
      description:
        "Encontre acessórios que fazem sentido para o seu veículo e seu estilo de uso.",
      actionLabel: "Ver acessórios",
    },
  ];

  /* ============================================================
     RECOMENDAÇÕES DO BACKEND
     ============================================================ */

  const filtered = recommendations.filter(
    (r) =>
      filter === "Todos" ||
      category(r) === filter
  );

  /*
   * Para Manutenção, usamos os cards próprios acima.
   * As recomendações do backend que também forem de manutenção
   * continuam podendo aparecer abaixo deles.
   */

  const backendMaintenance =
    filter === "Manutenção"
      ? filtered.filter(
          (r) =>
            category(r) === "Manutenção"
        )
      : [];

  const showMaintenance =
    filter === "Todos" ||
    filter === "Manutenção";

  const showAccessories =
    filter === "Todos" ||
    filter === "Acessórios";

  const showBackendRecommendations =
    filter !== "Manutenção";

  const hasContent =
    (showMaintenance &&
      maintenanceItems.length > 0) ||
    (showAccessories &&
      accessories.length > 0) ||
    filtered.length > 0;

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
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              Recomendações para você
            </Text>

            <Text style={styles.subtitle}>
              Recomendações, benefícios e ofertas personalizados
              {"\n"}
              para o seu Ford.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="sparkles-outline"
              size={21}
              color={colors.primary}
            />
          </View>
        </View>

        {/* FILTROS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filter,
                filter === item &&
                  styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item &&
                    styles.filterActiveText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* =====================================================
            OFERTAS E BENEFÍCIOS
           ===================================================== */}

        {filter === "Todos" && (
          <>
            <Text style={styles.sectionTitle}>
              Ofertas e benefícios para você
            </Text>

            <Text style={styles.sectionSubtitle}>
              Benefícios selecionados com base no seu perfil
              e no uso do seu Ford.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersScroll}
            >
              {offers.map((offer) => (
                <Pressable
                  key={offer.id}
                  onPress={() =>
                    navigation.navigate(
                      "DealershipSelection"
                    )
                  }
                >
                  <View style={styles.benefitCard}>
                    <View style={styles.benefitBadge}>
                      <Ionicons
                        name={
                          offer.icon as keyof typeof Ionicons.glyphMap
                        }
                        size={13}
                        color="#FFFFFF"
                      />

                      <Text style={styles.benefitBadgeText}>
                        {offer.badge}
                      </Text>
                    </View>

                    <Text style={styles.benefitTitle}>
                      {offer.title}
                    </Text>

                    <Text style={styles.benefitText}>
                      {offer.description}
                    </Text>

                    <View style={styles.benefitAction}>
                      <Text style={styles.benefitActionText}>
                        {offer.actionLabel}
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {/* LOADING */}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              color={colors.primary}
            />

            <Text style={styles.muted}>
              Montando recomendações...
            </Text>
          </View>
        ) : null}

        {/* ERROR */}

        {error ? (
          <Card style={styles.errorCard}>
            <Text style={styles.error}>
              {error}
            </Text>

            <Pressable
              onPress={refreshRecommendations}
            >
              <Text style={styles.retry}>
                Tentar novamente
              </Text>
            </Pressable>
          </Card>
        ) : null}

        {/* =====================================================
            MANUTENÇÃO
           ===================================================== */}

        {showMaintenance && (
          <>
            {filter === "Todos" && (
              <Text style={styles.sectionTitle}>
                Manutenção
              </Text>
            )}

            {maintenanceItems.map(
              (maintenance) => (
                <Pressable
                  key={maintenance.id}
                  onPress={() =>
                    navigation.navigate(
                      "DealershipSelection"
                    )
                  }
                >
                  <Card style={styles.card}>
                    <View style={styles.row}>
                      <View style={styles.icon}>
                        <Ionicons
                          name={
                            maintenance.icon as keyof typeof Ionicons.glyphMap
                          }
                          size={23}
                          color={colors.primary}
                        />
                      </View>

                      <View style={styles.cardContent}>
                        <View style={styles.tagRow}>
                          <Text style={styles.tag}>
                            MANUTENÇÃO
                          </Text>
                        </View>

                        <Text style={styles.cardTitle}>
                          {maintenance.title}
                        </Text>

                        <Text style={styles.cardText}>
                          {maintenance.description}
                        </Text>

                        <View style={styles.actionLine}>
                          <Text style={styles.action}>
                            {maintenance.actionLabel}
                          </Text>

                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={colors.primary}
                          />
                        </View>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              )
            )}

            {/* Manutenções personalizadas vindas do backend */}

            {backendMaintenance.map((r) => (
              <Pressable
                key={`backend-${r.id}`}
                onPress={() =>
                  navigation.navigate(
                    "DealershipSelection"
                  )
                }
              >
                <Card style={styles.card}>
                  <View style={styles.row}>
                    <View style={styles.icon}>
                      <Ionicons
                        name={iconFor(r.icon)}
                        size={23}
                        color={colors.primary}
                      />
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.tagRow}>
                        <Text style={styles.tag}>
                          MANUTENÇÃO
                        </Text>

                        {r.highlighted && (
                          <Text
                            style={
                              styles.personalized
                            }
                          >
                            PARA VOCÊ
                          </Text>
                        )}
                      </View>

                      <Text style={styles.cardTitle}>
                        {r.title}
                      </Text>

                      <Text style={styles.cardText}>
                        {r.description}
                      </Text>

                      <View style={styles.actionLine}>
                        <Text style={styles.action}>
                          {r.actionLabel ||
                            "Ver detalhes"}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </>
        )}

        {/* =====================================================
            RECOMENDAÇÕES DE SERVIÇOS
           ===================================================== */}

        {showBackendRecommendations &&
          filtered
            .filter(
              (r) =>
                category(r) ===
                "Serviços"
            )
            .map((r, index) => (
              <Pressable
                key={r.id}
                onPress={() =>
                  navigation.navigate(
                    "DealershipSelection"
                  )
                }
              >
                <Card
                  style={{
                    ...styles.card,
                    ...(index === 0 &&
                    r.highlighted
                      ? styles.highlighted
                      : {}),
                  }}
                >
                  <View style={styles.row}>
                    <View style={styles.icon}>
                      <Ionicons
                        name={iconFor(r.icon)}
                        size={23}
                        color={colors.primary}
                      />
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.tagRow}>
                        <Text style={styles.tag}>
                          SERVIÇOS
                        </Text>

                        {r.highlighted && (
                          <Text
                            style={
                              styles.personalized
                            }
                          >
                            PARA VOCÊ
                          </Text>
                        )}
                      </View>

                      <Text style={styles.cardTitle}>
                        {r.title}
                      </Text>

                      <Text style={styles.cardText}>
                        {r.description}
                      </Text>

                      <View style={styles.actionLine}>
                        <Text style={styles.action}>
                          {r.actionLabel ||
                            "Ver detalhes"}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}

        {/* =====================================================
            ACESSÓRIOS
           ===================================================== */}

        {showAccessories && (
          <>
            {filter === "Todos" && (
              <Text style={styles.sectionTitle}>
                Acessórios
              </Text>
            )}

            {accessories.map((accessory) => (
              <Pressable
                key={accessory.id}
                onPress={() =>
                  navigation.navigate(
                    "DealershipSelection"
                  )
                }
              >
                <Card style={styles.card}>
                  <View style={styles.row}>
                    <View style={styles.icon}>
                      <Ionicons
                        name={
                          accessory.icon as keyof typeof Ionicons.glyphMap
                        }
                        size={23}
                        color={colors.primary}
                      />
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.tagRow}>
                        <Text style={styles.tag}>
                          ACESSÓRIOS
                        </Text>
                      </View>

                      <Text style={styles.cardTitle}>
                        {accessory.title}
                      </Text>

                      <Text style={styles.cardText}>
                        {accessory.description}
                      </Text>

                      <View style={styles.actionLine}>
                        <Text style={styles.action}>
                          {accessory.actionLabel}
                        </Text>

                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </>
        )}

        {/* ESTADO VAZIO */}

        {!loading && !hasContent ? (
          <Card>
            <Text style={styles.cardTitle}>
              Tudo certo por aqui
            </Text>

            <Text style={styles.cardText}>
              No momento não encontramos uma
              recomendação específica para esse
              filtro.
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   CATEGORIA
   ============================================================ */

function category(r: any) {
  if (
    r.type === "MAINTENANCE" ||
    r.type === "PREVENTIVE"
  ) {
    return "Manutenção";
  }

  if (
    r.type === "LOYALTY" ||
    r.type === "ACCESSORY" ||
    r.type === "ACCESSORIES"
  ) {
    return "Acessórios";
  }

  if (
    r.type === "SERVICE" ||
    r.type === "SERVICES" ||
    r.type === "SERVICE_PATTERN"
  ) {
    return "Serviços";
  }

  return "Serviços";
}

/* ============================================================
   ÍCONE
   ============================================================ */

function iconFor(
  icon?: string
): keyof typeof Ionicons.glyphMap {
  const allowed = [
    "construct-outline",
    "medkit-outline",
    "people-outline",
    "analytics-outline",
    "warning-outline",
    "eye-outline",
    "bulb-outline",
    "car-outline",
    "cube-outline",
    "shield-checkmark-outline",
    "calendar-outline",
    "build-outline",
    "settings-outline",
    "water-outline",
    "disc-outline",
    "stop-circle-outline",
    "pricetag-outline",
    "gift-outline",
  ];

  return (
    allowed.includes(icon || "")
      ? icon
      : "bulb-outline"
  ) as keyof typeof Ionicons.glyphMap;
}

/* ============================================================
   STYLES
   ============================================================ */

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

    header: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    headerIcon: {
      width: 38,
      height: 38,
      borderRadius: 11,
      backgroundColor:
        colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },

    title: {
      ...typography.title,
      color: colors.text,
      fontWeight: "800",
    },

    subtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 4,
      lineHeight: 16,
    },

    filters: {
      paddingVertical: 12,
      gap: 7,
    },

    filter: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },

    filterActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    filterText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: "700",
    },

    filterActiveText: {
      color: "#FFFFFF",
    },

    /* ========================================================
       OFERTAS E BENEFÍCIOS
       ======================================================== */

    sectionSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: -5,
      marginBottom: 10,
    },

    offersScroll: {
      gap: 10,
      paddingBottom: 4,
    },

    benefitCard: {
      width: 245,
      minHeight: 165,
      backgroundColor: "#082C67",
      borderRadius: 17,
      padding: 15,
      justifyContent: "space-between",
    },

    benefitBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor:
        "rgba(255,255,255,0.14)",
      borderRadius: 20,
      paddingHorizontal: 9,
      paddingVertical: 5,
      gap: 5,
    },

    benefitBadgeText: {
      color: "#FFFFFF",
      fontSize: 8,
      fontWeight: "900",
    },

    benefitTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "900",
      marginTop: 10,
    },

    benefitText: {
      color: "#DCEAFF",
      fontSize: 10.5,
      lineHeight: 16,
      marginTop: 4,
      flex: 1,
    },

    benefitAction: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      gap: 5,
    },

    benefitActionText: {
      color: "#FFFFFF",
      fontSize: 10.5,
      fontWeight: "900",
    },

    /* ========================================================
       GERAL
       ======================================================== */

    center: {
      alignItems: "center",
      padding: 24,
    },

    muted: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 8,
    },

    errorCard: {
      marginBottom: 10,
    },

    error: {
      ...typography.caption,
      color: colors.danger,
    },

    retry: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "800",
      marginTop: 8,
    },

    sectionTitle: {
      ...typography.bodyMedium,
      color: colors.text,
      fontWeight: "800",
      marginTop: 8,
      marginBottom: 10,
    },

    card: {
      marginBottom: 9,
      padding: 12,
    },

    highlighted: {
      borderColor: colors.primary,
      borderWidth: 1.5,
    },

    row: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    icon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor:
        colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    cardContent: {
      flex: 1,
      marginLeft: 11,
    },

    tagRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },

    tag: {
      fontSize: 9,
      fontWeight: "800",
      color: colors.textSecondary,
      textTransform: "uppercase",
    },

    personalized: {
      fontSize: 8,
      fontWeight: "800",
      color: colors.primary,
    },

    cardTitle: {
      ...typography.bodyMedium,
      color: colors.text,
      fontWeight: "800",
      marginTop: 3,
    },

    cardText: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 16,
      marginTop: 3,
    },

    actionLine: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 7,
    },

    action: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: "800",
      marginRight: 4,
    },
  });
}