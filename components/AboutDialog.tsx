import React from "react";
import {
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { formStyles } from "./formStyles";
import appJson from "../app.json";

const GITHUB_URL = "https://github.com/mhenriquers/Anotei";

interface AboutDialogProps {
  visible: boolean;
  onClose: () => void;
}

//---------------------- "Sobre": versão, link do projeto e privacidade ----------------------
const AboutDialog: React.FC<AboutDialogProps> = ({ visible, onClose }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.card}>
        <View style={styles.logoBox}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Anotei</Text>
        <Text style={styles.version}>Versão {appJson.expo.version}</Text>

        <View style={styles.privacy}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.primaryDark}
          />
          <Text style={styles.privacyText}>
            Seus dados ficam só no aparelho. Nada sobre você é enviado para a
            internet.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.link}
          onPress={() => Linking.openURL(GITHUB_URL)}
          accessibilityRole="link"
        >
          <Ionicons name="logo-github" size={18} color={colors.hero} />
          <Text style={styles.linkText}>Ver o projeto no GitHub</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={onClose}
            style={[formStyles.button, { backgroundColor: colors.hero }]}
          >
            <Text style={formStyles.buttonPrimaryText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  version: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  privacy: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 20,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.primaryDark,
    marginLeft: 10,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.hero,
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginTop: 4,
  },
});

export default AboutDialog;
