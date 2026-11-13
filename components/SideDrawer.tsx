import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { IconName } from "./DetailsSheet";
import appJson from "../app.json";

export interface DrawerItem {
  key: string;
  icon: IconName;
  label: string;
  subtitle?: string; // texto pequeno abaixo do item (ex: data do último backup)
  onPress: () => void;
  disabled?: boolean;
}

interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  items: DrawerItem[];
}

const DURATION = 220;
// a web não tem driver nativo de animação
const useNativeDriver = Platform.OS !== "web";

//---------------------- gaveta lateral (abre da esquerda para a direita) ----------------------
const SideDrawer: React.FC<SideDrawerProps> = ({ visible, onClose, items }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const width = Math.min(300, screenWidth * 0.8);

  // 0 = fechada, 1 = aberta
  const progress = useRef(new Animated.Value(0)).current;
  // o Modal continua na tela enquanto a animação de fechar roda
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        useNativeDriver,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: DURATION,
        useNativeDriver,
      }).start(({ finished }) => finished && setMounted(false));
    }
  }, [visible, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, 0],
  });

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose} // botão voltar do Android
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* fundo escurecido: tocar fora fecha */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: progress }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.panel,
            {
              width,
              paddingTop: insets.top + 20,
              paddingBottom: insets.bottom + 16,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.appName}>Anotei</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={10}
              accessibilityLabel="Fechar menu"
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.items}>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.item, item.disabled && styles.itemDisabled]}
                // a ação roda no próprio toque (o iPhone exige isso para abrir o
                // menu Compartilhar e o seletor de arquivos) e a gaveta fecha junto
                onPress={() => {
                  item.onPress();
                  onClose();
                }}
                disabled={item.disabled}
                activeOpacity={0.7}
              >
                <View style={styles.itemIcon}>
                  <Ionicons name={item.icon} size={20} color={colors.hero} />
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.subtitle ? (
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.version}>Versão {appJson.expo.version}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.overlay,
  },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.surface,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  appName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.hero,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  items: {
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radius.md,
    marginBottom: 4,
  },
  itemDisabled: {
    opacity: 0.45,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.creditSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  version: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
  },
});

export default SideDrawer;
