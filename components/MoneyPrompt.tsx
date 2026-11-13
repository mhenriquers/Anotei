import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  radius,
  formatBRLInput,
  maskMoneyInput,
  parseBRLInput,
} from "../theme";
import { formStyles } from "./formStyles";
import { IconName } from "./DetailsSheet";

interface MoneyPromptProps {
  visible: boolean;
  title: string; // ex: "Limite do mês"
  message: string; // explicação curta abaixo do título
  icon: IconName;
  value: number | null; // valor atual (null = sem valor)
  kind?: "money" | "day"; // "day" = dia do mês (1 a 31) no lugar de R$
  onSave: (value: number | null) => void; // null = a pessoa apagou o valor
  onCancel: () => void;
}

//---------------------- caixa para digitar um valor em R$ (limite, receita...) ou um dia do mês ----------------------
const MoneyPrompt: React.FC<MoneyPromptProps> = ({
  visible,
  title,
  message,
  icon,
  value,
  kind = "money",
  onSave,
  onCancel,
}) => {
  const isDay = kind === "day";
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  // ao abrir, o campo começa com o valor atual
  useEffect(() => {
    if (!visible) return;
    setError("");
    if (!value) setText("");
    else setText(isDay ? String(value) : formatBRLInput(value));
  }, [visible]);

  const changeText = (t: string) => {
    setError("");
    setText(isDay ? t.replace(/\D/g, "").slice(0, 2) : maskMoneyInput(t));
  };

  const save = () => {
    if (text.trim() === "") return onSave(null);
    const number = isDay ? Number(text) : parseBRLInput(text);
    if (isDay && !(Number.isInteger(number) && number >= 1 && number <= 31)) {
      setError("Digite um dia entre 1 e 31.");
      return;
    }
    onSave(number > 0 ? number : null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.card}>
          <View style={styles.iconBadge}>
            <Ionicons name={icon} size={28} color={colors.hero} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={[formStyles.inputWrapper, styles.input]}>
            <Text style={formStyles.prefix}>{isDay ? "Dia" : "R$"}</Text>
            <TextInput
              style={formStyles.input}
              placeholder={isDay ? "10" : "0,00"}
              placeholderTextColor={colors.textLight}
              value={text}
              onChangeText={changeText}
              maxLength={isDay ? 2 : undefined}
              keyboardType="number-pad"
              autoFocus
              onSubmitEditing={save}
              accessibilityLabel={title}
            />
            {text !== "" && (
              <TouchableOpacity
                onPress={() => setText("")}
                hitSlop={10}
                accessibilityLabel="Apagar valor"
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.textLight}
                />
              </TouchableOpacity>
            )}
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onCancel}
              style={[formStyles.button, formStyles.buttonSecondary]}
            >
              <Text style={formStyles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={save}
              style={[formStyles.button, formStyles.buttonPrimary]}
            >
              <Text style={formStyles.buttonPrimaryText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: colors.creditSoft,
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
  input: {
    alignSelf: "stretch",
    marginTop: 20,
  },
  error: {
    alignSelf: "stretch",
    color: colors.danger,
    fontSize: 13,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginTop: 20,
  },
});

export default MoneyPrompt;
