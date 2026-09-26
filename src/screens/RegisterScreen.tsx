import { useState } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import {
  useNavigation,
} from "@react-navigation/native";

import type {
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import Button from "../components/Button";
import Input from "../components/Input";
import ErrorMessage from "../components/ErrorMessage";

import { useAuth } from "../hooks/useAuth";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

import type {
  AuthStackParamList,
} from "../navigation/types";

type NavigationProp =
  NativeStackNavigationProp<
    AuthStackParamList,
    "Register"
  >;

export default function RegisterScreen() {
  const navigation =
    useNavigation<NavigationProp>();

  const { register } = useAuth();

  const [name, setName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [vin, setVin] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [showCamera, setShowCamera] =
    useState(false);

  const [permission, requestPermission] =
    useCameraPermissions();

  const handleOpenCamera = async () => {
    setError(null);

    if (!permission?.granted) {
      const result =
        await requestPermission();

      if (!result.granted) {
        setError(
          "Precisamos de acesso à câmera para escanear o VIN."
        );

        return;
      }
    }

    setShowCamera(true);
  };

  const handleBarcodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    const cleaned = data
      .trim()
      .replace(/[^a-fA-F0-9]/g, "");

    if (!/^[a-fA-F0-9]{64}$/.test(cleaned)) {
      return;
    }

    setVin(cleaned);
    setShowCamera(false);
    setError(null);
  };

  const handleRegister = async () => {
    setError(null);

    if (
      !name.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword ||
      !vin.trim()
    ) {
      setError(
        "Preencha todos os campos obrigatórios."
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        "As senhas não coincidem."
      );

      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    const phoneWithCountry = phoneDigits.startsWith("55")
      ? phoneDigits
      : `55${phoneDigits}`;

    if (![12, 13].includes(phoneWithCountry.length)) {
      setError(
        "Informe um telefone brasileiro válido com DDD."
      );

      return;
    }

    if (!/^[a-fA-F0-9]{64}$/.test(vin.trim())) {
      setError(
        "O VIN_Hash precisa ter 64 caracteres hexadecimais."
      );

      return;
    }

    try {
      setLoading(true);

      await register({
        name: name.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: `+${phoneWithCountry}`,
        password,
        vin_hash: vin.trim(),
      });

      // Não navegamos para Login aqui.
      // O Firebase autentica o usuário após o cadastro
      // e o RootNavigator abrirá o AppNavigator.
      
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível criar sua conta.";

      setError(
        translateFirebaseError(message)
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Tela da câmera
   */
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: [
              "qr",
              "code128",
              "code39",
              "code93",
              "codabar",
            ],
          }}
          onBarcodeScanned={
            showCamera
              ? handleBarcodeScanned
              : undefined
          }
        />

        <View style={styles.cameraOverlay}>
          <View style={styles.cameraHeader}>
            <Pressable
              style={styles.closeButton}
              onPress={() =>
                setShowCamera(false)
              }
            >
              <Text
                style={styles.closeButtonText}
              >
                ✕
              </Text>
            </Pressable>

            <Text
              style={styles.cameraTitle}
            >
              Escanear VIN
            </Text>
          </View>

          <View style={styles.scanArea}>
            <View
              style={styles.scanCornerTopLeft}
            />

            <View
              style={styles.scanCornerTopRight}
            />

            <View
              style={styles.scanCornerBottomLeft}
            />

            <View
              style={styles.scanCornerBottomRight}
            />
          </View>

          <View
            style={styles.cameraInstructions}
          >
            <Text
              style={styles.cameraInstructionTitle}
            >
              Posicione o código dentro da área
            </Text>

            <Text
              style={styles.cameraInstructionText}
            >
              Aponte a câmera para o QR Code ou
              código de barras que contém o VIN_Hash.
            </Text>
          </View>
        </View>
      </View>
    );
  }

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
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Criar conta
          </Text>

          <Text style={styles.subtitle}>
            Conte um pouco sobre você e seu
            veículo para personalizarmos
            sua experiência Ford.
          </Text>
        </View>

        {error && (
          <ErrorMessage
            message={error}
          />
        )}

        <Text style={styles.sectionTitle}>
          Seus dados
        </Text>

        <Input
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Digite seu nome"
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Input
          label="Sobrenome"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Digite seu sobrenome"
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Input
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          label="Telefone"
          value={phone}
          onChangeText={setPhone}
          placeholder="Ex.: (11) 99999-9999"
          keyboardType="phone-pad"
        />

        <Input
          label="Senha"
          value={password}
          onChangeText={setPassword}
          placeholder="Digite sua senha"
          secureTextEntry
          autoCapitalize="none"
        />

        <Input
          label="Confirmar senha"
          value={confirmPassword}
          onChangeText={
            setConfirmPassword
          }
          placeholder="Digite sua senha novamente"
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.sectionTitle}>
          Seu veículo
        </Text>

        <Input
          label="VIN_Hash"
          value={vin}
          onChangeText={(value) =>
            setVin(
              value
                .toUpperCase()
                .replace(
                  /[^A-Z0-9]/g,
                  ""
                )
            )
          }
          placeholder="Digite ou escaneie o VIN_Hash"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={64}
        />

        <Pressable
          style={styles.scanButton}
          onPress={handleOpenCamera}
        >
          <Text
            style={styles.scanIcon}
          >
            ▣
          </Text>

          <View>
            <Text
              style={styles.scanTitle}
            >
              Escanear VIN pela câmera
            </Text>

            <Text
              style={styles.scanSubtitle}
            >
              Aponte a câmera para o código
              do veículo
            </Text>
          </View>
        </Pressable>

        <Button
          title={
            loading
              ? "Criando conta..."
              : "Criar conta"
          }
          onPress={handleRegister}
          disabled={loading}
        />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Já possui uma conta?
          </Text>

          <Text
            style={styles.loginLink}
            onPress={() =>
              navigation.navigate(
                "Login"
              )
            }
          >
            Entrar
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function translateFirebaseError(
  message: string
): string {
  if (
    message.includes(
      "auth/email-already-in-use"
    )
  ) {
    return "Este e-mail já está cadastrado.";
  }

  if (
    message.includes(
      "auth/invalid-email"
    )
  ) {
    return "Informe um e-mail válido.";
  }

  if (
    message.includes(
      "auth/weak-password"
    )
  ) {
    return "A senha precisa ser mais forte.";
  }

  if (
    message.includes(
      "auth/network-request-failed"
    )
  ) {
    return "Verifique sua conexão com a internet.";
  }

  return message;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom:
      spacing.xxxl,
  },

  header: {
    marginBottom: spacing.lg,
  },

  title: {
    ...typography.h1,
    color: colors.text,
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },

  sectionTitle: {
    ...typography.title,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },

  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },

  scanIcon: {
    fontSize: 26,
    color: colors.primary,
    marginRight: spacing.md,
  },

  scanTitle: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "700",
  },

  scanSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.xs,
  },

  loginText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  loginLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "700",
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },

  cameraOverlay: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 50,
  },

  cameraHeader: {
    alignItems: "center",
    justifyContent: "center",
  },

  closeButton: {
    position: "absolute",
    left: 20,
    top: -10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 22,
  },

  cameraTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  scanArea: {
    width: "82%",
    height: 120,
    alignSelf: "center",
    position: "relative",
  },

  scanCornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 35,
    height: 35,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#fff",
  },

  scanCornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 35,
    height: 35,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#fff",
  },

  scanCornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 35,
    height: 35,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#fff",
  },

  scanCornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 35,
    height: 35,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#fff",
  },

  cameraInstructions: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  cameraInstructionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },

  cameraInstructionText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.85,
    lineHeight: 20,
  },
});