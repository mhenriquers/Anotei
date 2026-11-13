import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  parseBRLInput,
  formatBRLInput,
  maskMoneyInput,
} from "../theme";
import {
  PAYMENT_METHODS,
  PaymentMethod,
  getPaymentInfo,
} from "../paymentMethods";
import { Recorrente } from "../recurring";
import { formStyles as styles } from "./formStyles";
import PaymentIcon from "./PaymentIcon";

interface ModalRecorrenteProps {
  recorrente?: Recorrente | null; // se passado, o modal edita esse recorrente
  onClose: () => void;
  onSave: (data: Omit<Recorrente, "id" | "ultimoMes">) => void;
  onDelete?: () => void; // só no modo edição
}

//---------------------- cadastro / edição de um gasto recorrente ----------------------
// Montado só quando aberto, então os campos começam com os dados do recorrente.
const ModalRecorrente: React.FC<ModalRecorrenteProps> = ({
  recorrente,
  onClose,
  onSave,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const isEditing = !!recorrente;

  const [title, setTitle] = useState(recorrente?.title ?? "");
  const [valor, setValor] = useState(
    recorrente ? formatBRLInput(recorrente.amount) : "",
  );
  const [dia, setDia] = useState(recorrente ? String(recorrente.dia) : "");
  const [category, setCategory] = useState<PaymentMethod>(
    recorrente?.category ?? "credit card",
  );
  const [error, setError] = useState("");

  const handleSave = () => {
    const amount = parseBRLInput(valor);
    const day = Number(dia);
    if (title.trim() === "" || valor.trim() === "" || dia.trim() === "") {
      setError("Preencha o nome, o valor e o dia.");
      return;
    }
    if (!(amount > 0)) {
      setError("Digite um valor válido.");
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      setError("Informe um dia entre 1 e 31.");
      return;
    }
    onSave({ title: title.trim(), amount, category, dia: day });
  };

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.overlay}>
          {/* fundo escuro: tocar fora fecha */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={local.backdrop} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.sheet,
              local.sheet,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditing ? "Editar recorrente" : "Novo recorrente"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Fechar"
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/*---------------nome--------------*/}
              <View style={styles.field}>
                <Text style={styles.label}>Nome</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Netflix"
                    placeholderTextColor={colors.textLight}
                    value={title}
                    onChangeText={(text) => {
                      setTitle(text);
                      setError("");
                    }}
                  />
                </View>
              </View>

              {/*---------------valor e dia--------------*/}
              <View style={{ flexDirection: "row" }}>
                <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.label}>Valor</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.prefix}>R$</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0,00"
                      placeholderTextColor={colors.textLight}
                      value={valor}
                      onChangeText={(text) => {
                        setValor(maskMoneyInput(text));
                        setError("");
                      }}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Cobrança</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.prefix}>Dia</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10"
                      placeholderTextColor={colors.textLight}
                      value={dia}
                      onChangeText={(text) => {
                        setDia(text.replace(/\D/g, "").slice(0, 2));
                        setError("");
                      }}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                  </View>
                </View>
              </View>

              {/*---------------forma de pagamento--------------*/}
              <View style={styles.field}>
                <Text style={styles.label}>Forma de pagamento</Text>
                <View style={styles.segment}>
                  {PAYMENT_METHODS.map((value) => {
                    const { label, color } = getPaymentInfo(value);
                    const active = category === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.segmentButton,
                          active && styles.segmentButtonActive,
                        ]}
                        onPress={() => setCategory(value)}
                      >
                        <PaymentIcon
                          method={value}
                          size={18}
                          muted={!active}
                          mutedColor={colors.textMuted}
                        />
                        <Text
                          style={[styles.segmentText, active && { color }]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <Text style={local.hint}>
                Todo mês, no dia da cobrança, o gasto é lançado sozinho. Se o
                dia deste mês já passou, o primeiro lançamento é no mês que vem.
              </Text>

              {!!error && <Text style={local.errorText}>{error}</Text>}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.button, styles.buttonSecondary]}
                >
                  <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.button, styles.buttonPrimary]}
                >
                  <Text style={styles.buttonPrimaryText}>
                    {isEditing ? "Salvar" : "Adicionar"}
                  </Text>
                </TouchableOpacity>
              </View>

              {isEditing && onDelete && (
                <TouchableOpacity
                  onPress={onDelete}
                  style={local.deleteButton}
                  accessibilityLabel="Excluir recorrente"
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.danger}
                  />
                  <Text style={local.deleteText}>Excluir recorrente</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const local = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: "90%",
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 10,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default ModalRecorrente;
