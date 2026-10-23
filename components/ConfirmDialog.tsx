import React, { useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { formStyles } from "./formStyles";
import { IconName } from "./DetailsSheet";

export interface ConfirmDialogContent {
  title: string;
  message: string;
  icon: IconName;
  tone: "brand" | "danger"; // danger = ações que apagam dados
  confirmLabel: string;
  cancelLabel?: string; // sem cancelLabel: mostra só o botão principal
  onConfirm: () => void;
}

interface ConfirmDialogProps extends ConfirmDialogContent {
  visible: boolean;
  onCancel: () => void;
}

const TONES = {
  brand: { color: colors.hero, soft: colors.creditSoft },
  danger: { color: colors.danger, soft: colors.dangerSoft },
};

//---------------------- caixa de confirmação no estilo do app (substitui o Alert nativo) ----------------------
const ConfirmDialog: React.FC<ConfirmDialogProps> = (props) => {
  // guarda o último conteúdo exibido para o texto não mudar durante a animação de fechar
  const lastVisible = useRef<ConfirmDialogProps>(props);
  if (props.visible) lastVisible.current = props;
  const { title, message, icon, tone, confirmLabel, cancelLabel, onConfirm } =
    props.visible ? props : lastVisible.current;
  const { visible, onCancel } = props;
  const toneColors = TONES[tone];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* fundo escuro: tocar fora fecha */}
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.card}>
          <View
            style={[styles.iconBadge, { backgroundColor: toneColors.soft }]}
          >
            <Ionicons name={icon} size={28} color={toneColors.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {cancelLabel && (
              <TouchableOpacity
                onPress={onCancel}
                style={[formStyles.button, formStyles.buttonSecondary]}
              >
                <Text style={formStyles.buttonSecondaryText}>
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm}
              style={[formStyles.button, { backgroundColor: toneColors.color }]}
            >
              <Text style={formStyles.buttonPrimaryText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginTop: 24,
  },
});

export default ConfirmDialog;
