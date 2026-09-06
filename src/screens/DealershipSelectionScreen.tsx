import {
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import DealerShipCard from "../components/DealerShipCard";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { AppStackParamList } from "../navigation/types";

type NavigationProp =
  NativeStackNavigationProp<AppStackParamList>;

const dealerships = [
  {
    id: "1",
    name: "Ford New América",
    address: "Av. das Nações, 1200",
    distance: "2,4 km",
  },
  {
    id: "2",
    name: "Ford Center",
    address: "Av. Brasil, 850",
    distance: "4,7 km",
  },
  {
    id: "3",
    name: "Ford Prime",
    address: "Rua Augusta, 520",
    distance: "6,3 km",
  },
];

export default function DealershipSelectionScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Escolher Concessionária
      </Text>

      <Text style={styles.subtitle}>
        Selecione a concessionária ideal para sua
        recomendação.
      </Text>

      {dealerships.map((dealership) => (
        <DealerShipCard
          key={dealership.id}
          name={dealership.name}
          address={dealership.address}
          distance={dealership.distance}
          onPress={() =>
            navigation.navigate("DealershipDetails", {
              dealershipId: dealership.id,
            })
          }
        />
      ))}
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
    marginBottom: spacing.lg,
  },
});