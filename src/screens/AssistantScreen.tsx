import { useRef, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useChatbot, type DisplayChatMessage } from "../hooks/useChatbot";
import { useTheme } from "../contexts/ThemeContext";
import { spacing, borderRadius } from "../theme/spacing";
import { typography } from "../theme/typography";

const DEMO_VIN =
  "7c1878b6f55e26922eb1955d2c1ea5689999868cb58cfb373b6742ce34a45b28";

const SUGGESTIONS = [
  "Quando devo fazer a próxima revisão?",
  "Como agendo uma revisão?",
  "Tem alguma oferta para mim?",
];

interface AssistantScreenProps {
  embedded?: boolean;
}

export default function AssistantScreen({
  embedded = false,
}: AssistantScreenProps) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { messages, sending, sendMessage } = useChatbot(DEMO_VIN);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<DisplayChatMessage>>(null);

  const styles = createStyles(colors);

  const handleSend = async (text?: string) => {
    const value = text ?? input;

    if (!value.trim() || sending) {
      return;
    }

    setInput("");
    await sendMessage(value);

    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  return (
    <SafeAreaView
  style={styles.container}
  edges={embedded ? [] : ["top"]}
>
  {!embedded && (
    <View style={styles.header}>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={colors.text}
        />
      </Pressable>

      <View style={styles.headerIcon}>
        <Ionicons
          name="sparkles"
          size={20}
          color={colors.primary}
        />
      </View>

      <View>
        <Text style={styles.headerTitle}>
          Zyro -Assistente Ford
        </Text>

        <Text style={styles.headerSubtitle}>
          Tire dúvidas sobre seu veículo a qualquer hora
        </Text>
      </View>
    </View>
  )}

  <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => (
            <ChatBubble message={item} colors={colors} />
          )}
        />

        {messages.length <= 1 && (
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((suggestion) => (
              <Pressable
                key={suggestion}
                style={styles.suggestionChip}
                onPress={() => handleSend(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={colors.textLight}
            value={input}
            onChangeText={setInput}
            multiline
            editable={!sending}
          />

          <Pressable
            style={[
              styles.sendButton,
              (!input.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSend()}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.textWhite} />
            ) : (
              <Ionicons name="send" size={18} color={colors.textWhite} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChatBubble({
  message,
  colors,
}: {
  message: DisplayChatMessage;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const isUser = message.role === "user";
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant,
      ]}
    >
      <View
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}
      >
        <Text
          style={[
            styles.bubbleText,
            isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant,
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    flex: {
      flex: 1,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      backgroundColor: colors.surface,
    },

    backButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.xs,
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

    list: {
      padding: spacing.md,
      gap: spacing.sm,
    },

    bubbleRow: {
      width: "100%",
      flexDirection: "row",
      marginBottom: spacing.sm,
    },

    bubbleRowUser: {
      justifyContent: "flex-end",
    },

    bubbleRowAssistant: {
      justifyContent: "flex-start",
    },

    bubble: {
      maxWidth: "80%",
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },

    bubbleUser: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },

    bubbleAssistant: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderBottomLeftRadius: 4,
    },

    bubbleText: {
      ...typography.bodySmall,
      lineHeight: 20,
    },

    bubbleTextUser: {
      color: colors.textWhite,
    },

    bubbleTextAssistant: {
      color: colors.text,
    },

    suggestions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },

    suggestionChip: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.round,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },

    suggestionText: {
      ...typography.caption,
      color: colors.primary,
    },

    inputRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: spacing.sm,
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.surface,
    },

    input: {
      flex: 1,
      maxHeight: 100,
      backgroundColor: colors.background,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      color: colors.text,
      ...typography.bodySmall,
    },

    sendButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    sendButtonDisabled: {
      opacity: 0.5,
    },
  });
}