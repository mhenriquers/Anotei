import React, { useEffect, useRef } from "react";
import {
  Animated,
  PanResponder,
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { formStyles } from "./formStyles";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];

export interface DetailRow {
  icon: IconName;
  label: string;
  value: string;
}

interface DetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string; // título do modal (ex: "Detalhes do gasto")
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  amount: string; // valor já formatado em R$
  name: string;
  badge: { label: string; color: string; backgroundColor: string };
  rows: DetailRow[]; // linhas de informação (rótulo à esquerda, valor à direita)
  children?: React.ReactNode; // conteúdo extra abaixo das informações
}

const DRAG_START = 6; // pixels para baixo até o painel começar a acompanhar o dedo
const CLOSE_DISTANCE = 120; // arrastou mais que isso: fecha
const CLOSE_VELOCITY = 1; // ou soltou rápido para baixo: fecha

//---------------------- modal genérico de detalhes (gasto ou conta fixa) ----------------------
const DetailsSheet: React.FC<DetailsSheetProps> = ({
  visible,
  onClose,
  title,
  icon,
  iconColor,
  iconBackground,
  amount,
  name,
  badge,
  rows,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(400);

  // o PanResponder é criado uma vez só, então ele lê o onClose mais recente por ref
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // o fundo escuro vai clareando conforme o painel desce
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, 400],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // volta o painel para o lugar sempre que o modal abre
  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [visible]);

  //------------------- arrastar para baixo fecha o modal -------------------
  const panResponder = useRef(
    PanResponder.create({
      // toque que começa em qualquer parte do painel: o painel assume o gesto.
      // Botões (X e Fechar) têm prioridade, porque o toque é oferecido primeiro
      // ao elemento mais interno, então eles continuam funcionando normalmente.
      onStartShouldSetPanResponder: () => true,
      // toque que começa num botão e depois desce: o painel assume o gesto
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > DRAG_START && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        translateY.setValue(Math.max(0, gesture.dy));
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > CLOSE_DISTANCE || gesture.vy > CLOSE_VELOCITY) {
          Animated.timing(translateY, {
            toValue: sheetHeight.current,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onCloseRef.current());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* fundo escuro: tocar fora do painel fecha */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </TouchableWithoutFeedback>

        {/* painel: arrastar para baixo fecha */}
        <Animated.View
          {...panResponder.panHandlers}
          onLayout={(event) => {
            sheetHeight.current = event.nativeEvent.layout.height;
          }}
          style={[
            formStyles.sheet,
            { paddingBottom: insets.bottom + 20, transform: [{ translateY }] },
          ]}
        >
          <View style={formStyles.handle} />

          <View style={formStyles.header}>
            <Text style={formStyles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={formStyles.closeButton}
              accessibilityLabel="Fechar"
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/*-------------------------- resumo -------------------------- */}
          <View style={styles.summary}>
            <View
              style={[styles.iconBadge, { backgroundColor: iconBackground }]}
            >
              <Ionicons name={icon} size={26} color={iconColor} />
            </View>
            <Text style={styles.amount}>{amount}</Text>
            <Text style={styles.name}>{name}</Text>
            <View
              style={[styles.badge, { backgroundColor: badge.backgroundColor }]}
            >
              <Text style={[styles.badgeText, { color: badge.color }]}>
                {badge.label}
              </Text>
            </View>
          </View>

          {/*-------------------------- informações -------------------------- */}
          <View style={styles.rows}>
            {rows.map((row, index) => (
              <View
                key={row.label}
                style={[styles.row, index > 0 && styles.rowDivider]}
              >
                <View style={styles.rowLabel}>
                  <Ionicons
                    name={row.icon}
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text style={styles.rowLabelText}>{row.label}</Text>
                </View>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {children}

          <View style={formStyles.buttonRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[formStyles.button, styles.closeAction]}
            >
              <Text style={styles.closeActionText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
  },
  summary: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  amount: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  badge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  rows: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  rowLabelText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 6,
  },
  rowValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    textAlign: "right",
  },
  // botão "Fechar" sólido na cor da marca (a mesma do card "Total gasto" da Home)
  closeAction: {
    backgroundColor: colors.hero,
  },
  closeActionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default DetailsSheet;
