import type { FC } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../theme/colors";
import { borderRadius, sizes, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;

  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad";

  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  maxLength?: number;

  error?: string;
}

const Input: FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  maxLength,
  error,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        maxLength={maxLength}
        style={[styles.input, error && styles.inputError]}
      />

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  input: {
    height: sizes.inputHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body,
  },

  inputError: {
    borderColor: colors.danger,
  },

  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});

export default Input;