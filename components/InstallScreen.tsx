import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, shadow } from "../theme";
import { IconName } from "./DetailsSheet";

const STEPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "share-outline",
    title: "Toque em Compartilhar",
    text: "O botão fica na barra do Safari. Se não aparecer, toque em ··· primeiro.",
  },
  {
    icon: "add-circle-outline",
    title: "Escolha “Adicionar à Tela de Início”",
    text: "Role a lista para baixo se precisar. Se aparecer “Abrir como App Web”, deixe ligado.",
  },
  {
    icon: "phone-portrait-outline",
    title: "Abra o Anotei pelo ícone",
    text: "Ele aparece na tela de início, como qualquer outro app.",
  },
];

//---------------------- iPhone pelo Safari: ensina a instalar antes de usar ----------------------
const InstallScreen: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      alert(window.location.href);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoBox}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Instale o Anotei</Text>
        <Text style={styles.subtitle}>
          Para suas contas e gastos ficarem salvos, use o Anotei pelo ícone na
          tela de início. Leva 10 segundos:
        </Text>

        {STEPS.map((step, index) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
            <Ionicons name={step.icon} size={26} color={colors.credit} />
          </View>
        ))}

        <View style={styles.note}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.textMuted}
          />
          <Text style={styles.noteText}>
            Abriu pelo WhatsApp, Instagram ou outro app? Copie o link e abra no
            Safari para conseguir instalar.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.copyButton}
          onPress={copyLink}
          activeOpacity={0.8}
        >
          <Ionicons
            name={copied ? "checkmark" : "link-outline"}
            size={18}
            color={colors.hero}
          />
          <Text style={styles.copyText}>
            {copied ? "Link copiado!" : "Copiar link"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
    ...shadow,
  },
  logo: {
    width: 68,
    height: 68,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 12,
    ...shadow,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.hero,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  stepInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  stepText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: 2,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingHorizontal: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginLeft: 8,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    backgroundColor: colors.creditSoft,
  },
  copyText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.hero,
    marginLeft: 6,
  },
});

export default InstallScreen;
