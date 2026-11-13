import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { checkForUpdate, UpdateInfo } from "../updates";

// versão que a pessoa dispensou com "Agora não" (o aviso volta na próxima versão)
const KEY_DISMISSED = "update:dismissed";

//---------------------- aviso "Nova versão disponível" (topo da tela inicial) ----------------------
// Só aparece no Android: na web, checkForUpdate sempre devolve null.
const UpdateBanner: React.FC = () => {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const found = await checkForUpdate();
      if (!found) return;
      const dismissed = await AsyncStorage.getItem(KEY_DISMISSED);
      if (active && dismissed !== found.version) setUpdate(found);
    })().catch((error) => console.error("Erro ao buscar atualização", error));
    return () => {
      active = false;
    };
  }, []);

  if (!update) return null;

  const dismiss = () => {
    setUpdate(null);
    AsyncStorage.setItem(KEY_DISMISSED, update.version).catch(() => {});
  };

  const download = () => {
    Linking.openURL(update.downloadUrl).catch(() =>
      alert("Não foi possível abrir o link. Tente de novo."),
    );
  };

  return (
    <View style={styles.banner}>
      <View style={styles.header}>
        <Ionicons name="sparkles-outline" size={22} color={colors.primaryDark} />
        <Text style={styles.title}>Nova versão disponível</Text>
      </View>
      <Text style={styles.text}>
        A versão {update.version} do Anotei está pronta. Baixe e instale o
        arquivo para atualizar; seus dados continuam no app.
      </Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.secondary}
          onPress={dismiss}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryText}>Agora não</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primary}
          onPress={download}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryText}>Baixar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryDark,
    marginLeft: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginTop: 8,
  },
  buttons: {
    flexDirection: "row",
    marginTop: 14,
  },
  secondary: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  primary: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default UpdateBanner;
