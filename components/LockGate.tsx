import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { formStyles } from "./formStyles";
import { authenticate } from "../biometrics";
import { loadLockSetting } from "../appLock";

// fora do app por menos que isso (ex: foi compartilhar um backup) não pede de novo
const GRACE_MS = 60 * 1000;

//---------------------- tela de bloqueio (digital) por cima do app ----------------------
// O app continua montado por baixo; a tela de bloqueio é um Modal, então fica
// por cima até de outros modais abertos.
const LockGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false); // já leu a configuração
  const backgroundAt = useRef<number | null>(null);
  const authenticating = useRef(false);

  const unlock = async () => {
    if (authenticating.current) return;
    authenticating.current = true;
    const ok = await authenticate();
    authenticating.current = false;
    if (ok) setLocked(false);
  };

  // ao abrir o app
  useEffect(() => {
    loadLockSetting().then((enabled) => {
      setChecked(true);
      if (enabled) {
        setLocked(true);
        unlock();
      }
    });
  }, []);

  // ao voltar para o app depois de um tempo fora
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (state) => {
      // a janela da digital também deixa o app "inactive": não conta como sair
      if (state === "background") backgroundAt.current = Date.now();
      if (state !== "active" || backgroundAt.current === null) return;
      const away = Date.now() - backgroundAt.current;
      backgroundAt.current = null;
      if (away >= GRACE_MS && (await loadLockSetting())) {
        setLocked(true);
        unlock();
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <>
      {checked ? children : <View style={styles.blank} />}
      <Modal
        visible={locked}
        animationType="fade"
        onRequestClose={() => {}}
        statusBarTranslucent
      >
        <View style={styles.lock}>
          <View style={styles.logoBox}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Anotei bloqueado</Text>
          <Text style={styles.text}>
            Use a digital (ou o desbloqueio do celular) para abrir.
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={unlock}
              style={[
                formStyles.button,
                formStyles.buttonPrimary,
                styles.button,
              ]}
            >
              <Ionicons name="finger-print" size={20} color="#FFFFFF" />
              <Text style={[formStyles.buttonPrimaryText, styles.buttonText]}>
                Desbloquear
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  blank: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: colors.background,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 66,
    height: 66,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    alignSelf: "center",
    maxWidth: 360,
    width: "100%",
    marginTop: 28,
  },
  button: {
    flexDirection: "row",
  },
  buttonText: {
    marginLeft: 8,
  },
});

export default LockGate;
