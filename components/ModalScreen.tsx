import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Type } from "../Types";
import { colors } from "../theme";
import { formStyles as styles } from "./formStyles";

interface ModalScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Type, "id" | "createdAt">) => void;
}

//---------------------- função pra tirar modal e fechar teclado ao tocar fora--------------------------
export const handleBackgroundTap = (
  isKeyboardVisible: boolean,
  onClose: () => void,
) => {
  if (isKeyboardVisible) {
    Keyboard.dismiss();
  } else {
    onClose();
  }
};

const ModalScreen: React.FC<ModalScreenProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();

  //-----------------------varavel de controle do teclado-----------------------------
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"credit card" | "debit">(
    "credit card",
  );
  const [nameExpense, setNameExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [obs, setObs] = useState("");

  //-------------------------------- função que adiciona e salva card---------------------
  const handleAdd = () => {
    if (nameExpense.trim() === "" || amount.trim() === "") {
      alert("Preencha os campos de Nome e Valor!");
      return;
    }
    const valorNumerico = parseFloat(amount.replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Digite um valor válido.");
      return;
    }
    onSave({
      title: nameExpense.trim(),
      amount: valorNumerico,
      category: paymentMethod,
      observacao: obs.trim(),
    });
    setNameExpense("");
    setAmount("");
    setObs("");
  };

  React.useEffect(() => {
    const showlistener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hidelistener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showlistener.remove();
      hidelistener.remove();
    };
  }, []);

  const handlePress = () => handleBackgroundTap(isKeyboardVisible, onClose);

  //-------------------------- botão do tipo de pagamento --------------------------
  const renderOption = (
    value: "credit card" | "debit",
    label: string,
    icon: "card-outline" | "cash-outline",
    color: string,
  ) => {
    const active = paymentMethod === value;
    return (
      <TouchableOpacity
        style={[styles.segmentButton, active && styles.segmentButtonActive]}
        onPress={() => setPaymentMethod(value)}
      >
        <Ionicons
          name={icon}
          size={18}
          color={active ? color : colors.textMuted}
        />
        <Text style={[styles.segmentText, active && { color }]}>{label}</Text>
      </TouchableOpacity>
    );
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
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}
              >
                <View style={styles.handle} />

                <View style={styles.header}>
                  <Text style={styles.title}>Novo gasto</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    accessibilityLabel="Fechar"
                  >
                    <Ionicons name="close" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {/*---------------input Nome--------------*/}
                <View style={styles.field}>
                  <Text style={styles.label}>Nome</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Mercado"
                      placeholderTextColor={colors.textLight}
                      value={nameExpense}
                      onChangeText={setNameExpense}
                    />
                  </View>
                </View>

                {/*--------------input Valor--------------*/}
                <View style={styles.field}>
                  <Text style={styles.label}>Valor</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.prefix}>R$</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0,00"
                      placeholderTextColor={colors.textLight}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/*-------------input Obs-----------------*/}
                <View style={styles.field}>
                  <Text style={styles.label}>Observação (opcional)</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: compra parcelada"
                      placeholderTextColor={colors.textLight}
                      value={obs}
                      onChangeText={setObs}
                    />
                  </View>
                </View>

                {/*-------------tipo de pagamento-----------------*/}
                <View style={styles.field}>
                  <Text style={styles.label}>Forma de pagamento</Text>
                  <View style={styles.segment}>
                    {renderOption(
                      "credit card",
                      "Crédito",
                      "card-outline",
                      colors.credit,
                    )}
                    {renderOption(
                      "debit",
                      "Débito",
                      "cash-outline",
                      colors.debit,
                    )}
                  </View>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={[styles.button, styles.buttonSecondary]}
                  >
                    <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleAdd}
                    style={[styles.button, styles.buttonPrimary]}
                  >
                    <Text style={styles.buttonPrimaryText}>Adicionar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ModalScreen;
