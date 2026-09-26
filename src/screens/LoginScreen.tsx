import { useState } from "react";

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import { FirebaseError } from "firebase/app";

import Button from "../components/Button";
import Input from "../components/Input";

import { useAuth } from "../hooks/useAuth";

import { colors } from "../theme/colors";

import {
  borderRadius,
  spacing,
} from "../theme/spacing";

import {
  typography,
} from "../theme/typography";

import type {
  AuthStackParamList,
} from "../navigation/types";

type NavigationProp =
  NativeStackNavigationProp<
    AuthStackParamList
  >;

function getLoginErrorMessage(
  error: unknown
): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "E-mail ou senha incorretos.";

      case "auth/invalid-email":
        return "E-mail inválido. Verifique e tente novamente.";

      case "auth/too-many-requests":
        return "Muitas tentativas. Aguarde um momento e tente de novo.";

      default:
        return "Não foi possível entrar. Tente novamente.";
    }
  }

  return "Não foi possível entrar. Tente novamente.";
}

export default function LoginScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const {
    login,
    loading,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin =
    async () => {
      try {
        await login(
          email.trim(),
          password
        );

        /*
         * Não precisamos navegar manualmente.
         *
         * O Firebase atualiza o usuário autenticado,
         * o AuthContext atualiza "user" e o RootNavigator
         * automaticamente troca AuthNavigator pelo
         * AppNavigator.
         *
         * O AppNavigator começa em "Tabs" e o
         * AppTabNavigator começa em "Customer360".
         */
      } catch (error) {
        console.error(
          "Login error:",
          error
        );

        Alert.alert(
          "Erro ao entrar",
          getLoginErrorMessage(
            error
          )
        );
      }
    };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={styles.logoContainer}
        >
          <Text
            style={styles.logo}
          >
            ConnectCare 360
          </Text>

          <Text
            style={styles.subtitle}
          >
            Sua experiência Ford em um só lugar
          </Text>
        </View>

        <View
          style={styles.form}
        >
          <Text
            style={styles.title}
          >
            Bem-vindo de volta
          </Text>

          <Text
            style={styles.description}
          >
            Entre para acessar sua experiência personalizada.
          </Text>

          <Input
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={
              setEmail
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Senha"
            placeholder="Digite sua senha"
            value={password}
            onChangeText={
              setPassword
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            title={
              loading
                ? "Entrando..."
                : "Entrar"
            }
            onPress={
              handleLogin
            }
            disabled={loading}
          />

          <Text
            style={
              styles.registerText
            }
          >
            Ainda não possui uma conta?
          </Text>

          <Button
            title="Criar conta"
            variant="outline"
            onPress={() =>
              navigation.navigate(
                "Register"
              )
            }
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    content: {
      flexGrow: 1,
      justifyContent:
        "center",
      padding: spacing.lg,
    },

    logoContainer: {
      alignItems:
        "center",
      marginBottom:
        spacing.xxxl,
    },

    logo: {
      fontSize: 32,
      fontWeight: "700",
      fontStyle: "italic",
      color:
        colors.primaryDark,
    },

    subtitle: {
      ...typography.bodySmall,
      color:
        colors.textSecondary,
      marginTop:
        spacing.sm,
      textAlign:
        "center",
    },

    form: {
      backgroundColor:
        colors.surface,
      borderRadius:
        borderRadius.xl,
      padding:
        spacing.lg,
      borderWidth: 1,
      borderColor:
        colors.border,
    },

    title: {
      ...typography.h2,
      color:
        colors.text,
    },

    description: {
      ...typography.bodySmall,
      color:
        colors.textSecondary,
      marginTop:
        spacing.xs,
      marginBottom:
        spacing.lg,
    },

    registerText: {
      ...typography.bodySmall,
      color:
        colors.textSecondary,
      textAlign:
        "center",
      marginVertical:
        spacing.md,
    },
  });