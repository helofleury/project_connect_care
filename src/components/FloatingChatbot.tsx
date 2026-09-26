import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AssistantScreen from "../screens/AssistantScreen";
import { useTheme } from "../contexts/ThemeContext";
import { DEMO_VIN } from "../constants/demo";
import { typography } from "../theme/typography";

export default function FloatingChatbot() {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  const styles = createStyles(colors);

  return (
    <>
      <Pressable
        style={styles.floatingButton}
        onPress={() => setVisible(true)}
      >
        <Ionicons
          name="sparkles"
          size={20}
          color={colors.textWhite}
        />
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="sparkles"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View>
                <Text style={styles.headerTitle}>
                  Zyro - Assistente Ford
                </Text>

                <Text style={styles.headerSubtitle}>
                  Tire suas dúvidas sobre seu veículo
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={() => setVisible(false)}
            >
              <Ionicons
                name="close"
                size={24}
                color={colors.text}
              />
            </Pressable>
          </View>

          <AssistantScreen embedded />
        </View>
      </Modal>
    </>
  );
}

function createStyles(
  colors: ReturnType<typeof useTheme>["colors"]
) {
  return StyleSheet.create({
    floatingButton: {
  position: "absolute",
  right: 20,
  bottom: 80,
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.primary,
  alignItems: "center",
  justifyContent: "center",
  elevation: 8,
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.25,
  shadowRadius: 6,
  zIndex: 999,
},
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },

    modalHeader: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
    },

    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    headerIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      ...typography.title,
      color: colors.text,
    },

    headerSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },

    closeButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}