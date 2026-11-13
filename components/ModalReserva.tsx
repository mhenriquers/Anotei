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
import { Reserva } from "../Types";
import {
  colors,
  radius,
  parseBRLInput,
  formatBRLInput,
  maskMoneyInput,
} from "../theme";
import { formStyles as styles } from "./formStyles";

interface ModalReservaProps {
  visible: boolean;
  reserva?: Reserva | null; // se passada, o modal edita essa reserva
  onClose: () => void;
  onSave: (data: Omit<Reserva, "id">) => void;
  onDelete?: () => void; // só no modo edição
}

// atalhos para o campo "Finalidade" (a pessoa pode digitar qualquer outra)
const FINALIDADES = ["Emergência", "Objetivo", "Investimento"];

//---------------------- cadastro / edição de uma reserva ----------------------
// O modal é montado ao abrir, então os campos começam com os dados da reserva.
const ModalReserva: React.FC<ModalReservaProps> = ({
  visible,
  reserva,
  onClose,
  onSave,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const isEditing = !!reserva;

  const [nome, setNome] = useState(reserva?.nome ?? "");
  const [valor, setValor] = useState(
    reserva ? formatBRLInput(reserva.valor) : "",
  );
  const [finalidade, setFinalidade] = useState(reserva?.finalidade ?? "");
  const [local, setLocal] = useState(reserva?.local ?? "");
  const [meta, setMeta] = useState(
    reserva?.meta ? formatBRLInput(reserva.meta) : "",
  );
  const [error, setError] = useState("");

  const handleSave = () => {
    if (nome.trim() === "" || valor.trim() === "") {
      setError("Preencha o nome e o valor.");
      return;
    }
    const valorNumerico = parseBRLInput(valor);
    if (isNaN(valorNumerico)) {
      setError("Digite um valor válido.");
      return;
    }
    const metaNumerica = parseBRLInput(meta);
    onSave({
      ...reserva, // mantém os outros campos (ex: movimentos)
      nome: nome.trim(),
      valor: valorNumerico,
      finalidade: finalidade.trim(),
      local: local.trim() || undefined,
      meta: metaNumerica > 0 ? metaNumerica : undefined,
    });
  };

  return (
    <Modal
      visible={visible}
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
            <View style={local_.backdrop} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.sheet,
              local_.sheet,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.title}>
                {isEditing ? "Editar reserva" : "Nova reserva"}
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
                    placeholder="Ex: Reserva de emergência"
                    placeholderTextColor={colors.textLight}
                    value={nome}
                    onChangeText={(text) => {
                      setNome(text);
                      setError("");
                    }}
                  />
                </View>
              </View>

              {/*---------------valor--------------*/}
              <View style={styles.field}>
                <Text style={styles.label}>Valor guardado</Text>
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

              {/*---------------meta--------------*/}
              <View style={styles.field}>
                <Text style={styles.label}>Meta (opcional)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.prefix}>R$</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Quanto quer juntar"
                    placeholderTextColor={colors.textLight}
                    value={meta}
                    onChangeText={(text) => setMeta(maskMoneyInput(text))}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {/*---------------finalidade--------------*/}
              <View style={styles.field}>
                <Text style={styles.label}>Finalidade</Text>
                <View style={local_.chips}>
                  {FINALIDADES.map((option) => {
                    const active = finalidade === option;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[local_.chip, active && local_.chipActive]}
                        onPress={() => setFinalidade(active ? "" : option)}
                      >
                        <Text
                          style={[
                            local_.chipText,
                            active && local_.chipTextActive,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Viagem, carro novo"
                    placeholderTextColor={colors.textLight}
                    value={finalidade}
                    onChangeText={setFinalidade}
                  />
                </View>
              </View>

              {/*---------------local--------------*/}
              <View style={styles.field}>
                <Text style={styles.label}>Onde está guardado (opcional)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Nubank, poupança, carteira"
                    placeholderTextColor={colors.textLight}
                    value={local}
                    onChangeText={setLocal}
                  />
                </View>
              </View>

              {!!error && <Text style={local_.errorText}>{error}</Text>}

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
                  style={local_.deleteButton}
                  accessibilityLabel="Excluir reserva"
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.danger}
                  />
                  <Text style={local_.deleteText}>Excluir reserva</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// "local_" para não confundir com o campo `local` da reserva
const local_ = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  sheet: {
    maxHeight: "90%",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primaryDark,
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

export default ModalReserva;
