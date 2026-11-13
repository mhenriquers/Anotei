import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import appJson from "../app.json";

// última versão que a pessoa já viu (só deste aparelho, não entra no backup)
const KEY_SEEN = "versaoVista";
const CURRENT = appJson.expo.version;

//---------------------- aviso "Atualizado para a versão X" (Android e web) ----------------------
// Aparece uma vez depois que o app é atualizado. Na primeira vez que o app abre
// (sem versão salva) só guarda a versão, sem aviso.
const UpdatedNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY_SEEN)
      .then((seen) => {
        if (seen === CURRENT) return;
        if (seen !== null) setVisible(true);
        return AsyncStorage.setItem(KEY_SEEN, CURRENT);
      })
      .catch(() => {});
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
      <Text style={styles.text}>Atualizado para a versão {CURRENT}</Text>
      <TouchableOpacity
        onPress={() => setVisible(false)}
        hitSlop={10}
        accessibilityLabel="Fechar aviso"
      >
        <Ionicons name="close" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  text: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.primaryDark,
    marginLeft: 10,
  },
});

export default UpdatedNotice;
