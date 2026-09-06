import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Button from "../components/Button";
import Input from "../components/Input";
import { colors } from "../theme/colors";
import { borderRadius, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { AuthStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Authentication will be connected through useAuth later.
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Ford 360</Text>
          <Text style={styles.subtitle}>
            Sua experiência Ford em um só lugar
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Bem-vindo de volta</Text>

          <Text style={styles.description}>
            Entre para acessar sua experiência personalizada.
          </Text>

          <Input
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
          />

          <Text style={styles.registerText}>
            Ainda não possui uma conta?
          </Text>

          <Button
            title="Criar conta"
            variant="outline"
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },

  logo: {
    fontSize: 32,
    fontWeight: "700",
    fontStyle: "italic",
    color: colors.primaryDark,
  },

  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },

  form: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  title: {
    ...typography.h2,
    color: colors.text,
  },

  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  registerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    marginVertical: spacing.md,
  },
});