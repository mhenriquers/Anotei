import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, radius } from "../theme";

export interface ToastData {
  id: number; // muda a cada aviso novo (reinicia o tempo)
  message: string; // ex: "Gasto apagado"
  actionLabel?: string; // ex: "Desfazer"
  onAction?: () => void;
}

interface UndoToastProps {
  toast: ToastData | null; // null = escondido
  onHide: () => void;
}

const DURATION_MS = 5000; // tempo na tela
// a web não tem driver nativo de animação
const useNativeDriver = Platform.OS !== "web";

//---------------------- aviso rápido no rodapé ("Gasto apagado · Desfazer") ----------------------
const UndoToast: React.FC<UndoToastProps> = ({ toast, onHide }) => {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  // o onHide mais recente, para o timer não usar uma versão antiga
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!toast) return;
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver,
    }).start();
    const timer = setTimeout(() => onHideRef.current(), DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast?.id]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + 16, opacity }]}
    >
      <View style={styles.toast} accessibilityLiveRegion="polite">
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.actionLabel && toast.onAction && (
          <TouchableOpacity
            onPress={() => {
              toast.onAction?.();
              onHide();
            }}
            hitSlop={10}
            style={styles.action}
          >
            <Text style={styles.actionText}>{toast.actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#1E293B", // escuro nos dois temas, com texto branco
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  message: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  action: {
    marginLeft: 16,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#86EFAC", // verde claro, legível sobre o fundo escuro do aviso
  },
});

export default UndoToast;
