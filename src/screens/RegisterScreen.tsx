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
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import type { AuthStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    // Registration will be connected through useAuth later.
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
        <Text style={styles.title}>Criar conta</Text>

        <Text style={styles.description}>
          Crie sua conta para aproveitar uma experiência
          personalizada com a Ford.
        </Text>

        <Input
          label="Nome"
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
        />

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
          title="Criar conta"
          onPress={handleRegister}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Já possui uma conta?
          </Text>

          <Button
            title="Voltar para o login"
            variant="outline"
            onPress={() => navigation.goBack()}
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

  title: {
    ...typography.h1,
    color: colors.text,
  },

  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  loginContainer: {
    marginTop: spacing.lg,
  },

  loginText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
});