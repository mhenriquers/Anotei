import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { formStyles } from "./formStyles";
import { IconName } from "./DetailsSheet";

interface WelcomeScreenProps {
  onDone: () => void;
}

const SLIDES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "receipt-outline",
    title: "Anote seus gastos",
    text: "Toque no botão + e registre cada compra em segundos: valor, forma de pagamento e data.",
  },
  {
    icon: "calendar-outline",
    title: "Contas fixas do mês",
    text: "Cadastre aluguel, internet e outras contas. Marque como paga e receba aviso perto do vencimento.",
  },
  {
    icon: "cloud-upload-outline",
    title: "Seus dados são só seus",
    text: "Tudo fica guardado no seu aparelho. Faça backup pelo menu ☰ para não perder nada se trocar de celular.",
  },
];

//---------------------- boas-vindas no primeiro uso (3 telas curtas) ----------------------
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onDone }) => {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <View style={styles.top}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        {!isLast && (
          <TouchableOpacity onPress={onDone} hitSlop={10}>
            <Text style={styles.skip}>Pular</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.iconBadge}>
          <Ionicons name={slide.icon} size={44} color={colors.hero} />
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.text}>{slide.text}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((item, i) => (
          <View
            key={item.title}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => (isLast ? onDone() : setIndex(index + 1))}
          style={[formStyles.button, formStyles.buttonPrimary]}
        >
          <Text style={formStyles.buttonPrimaryText}>
            {isLast ? "Começar" : "Próximo"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  logo: {
    width: 44,
    height: 44,
  },
  skip: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textMuted,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    maxWidth: 520,
    alignSelf: "center",
  },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.creditSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 12,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.hero,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingBottom: 16,
    maxWidth: 520,
    width: "100%",
    alignSelf: "center",
  },
});

export default WelcomeScreen;
