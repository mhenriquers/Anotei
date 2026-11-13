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
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Type } from "../Types";
import {
  colors,
  radius,
  formatDateInput,
  formatTime,
  maskDateInput,
  maskTimeInput,
  parseDateTimeInput,
  parseBRLInput,
  maskMoneyInput,
} from "../theme";
import {
  PAYMENT_METHODS,
  PaymentMethod,
  getPaymentInfo,
} from "../paymentMethods";
import { formStyles as styles } from "./formStyles";

interface ModalScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Type, "id">) => void;
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

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("credit card");
  const [nameExpense, setNameExpense] = useState("");
  const [amount, setAmount] = useState("");
  const [obs, setObs] = useState("");

  // data e hora da compra: começam com "agora" (o modal é montado ao abrir)
  const [dateText, setDateText] = useState(() => formatDateInput(new Date()));
  const [timeText, setTimeText] = useState(() => formatTime(new Date()));
  const [dateError, setDateError] = useState("");

  const today = formatDateInput(new Date());
  const yesterday = formatDateInput(new Date(Date.now() - 24 * 60 * 60 * 1000));

  const changeDate = (text: string) => {
    setDateText(maskDateInput(text));
    setDateError("");
  };
  const changeTime = (text: string) => {
    setTimeText(maskTimeInput(text));
    setDateError("");
  };

  //-------------------------------- função que adiciona e salva card---------------------
  const handleAdd = () => {
    if (nameExpense.trim() === "" || amount.trim() === "") {
      alert("Preencha os campos de Nome e Valor!");
      return;
    }
    const valorNumerico = parseBRLInput(amount);

    if (isNaN(valorNumerico)) {
      alert("Digite um valor válido.");
      return;
    }
    const purchase = parseDateTimeInput(dateText, timeText);
    if ("error" in purchase) {
      setDateError(purchase.error);
      return;
    }
    onSave({
      title: nameExpense.trim(),
      amount: valorNumerico,
      category: paymentMethod,
      observacao: obs.trim(),
      createdAt: purchase.date,
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
  const renderOption = (value: PaymentMethod) => {
    const { label, icon, color } = getPaymentInfo(value);
    const active = paymentMethod === value;
    return (
      <TouchableOpacity
        key={value}
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
                      onChangeText={(text) => setAmount(maskMoneyInput(text))}
                      keyboardType="number-pad"
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
                    {PAYMENT_METHODS.map(renderOption)}
                  </View>
                </View>

                {/*-------------data e hora da compra-----------------*/}
                <View style={styles.field}>
                  <View style={local.labelRow}>
                    <Text style={[styles.label, local.labelInRow]}>
                      Data e hora da compra
                    </Text>
                    {[
                      { label: "Hoje", value: today },
                      { label: "Ontem", value: yesterday },
                    ].map((chip) => {
                      const active = dateText === chip.value;
                      return (
                        <TouchableOpacity
                          key={chip.label}
                          style={[local.chip, active && local.chipActive]}
                          onPress={() => changeDate(chip.value)}
                        >
                          <Text
                            style={[
                              local.chipText,
                              active && local.chipTextActive,
                            ]}
                          >
                            {chip.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={local.row}>
                    <View
                      style={[
                        styles.inputWrapper,
                        local.dateInput,
                        !!dateError && local.inputError,
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color={colors.textMuted}
                        style={local.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="dd/mm/aaaa"
                        placeholderTextColor={colors.textLight}
                        value={dateText}
                        onChangeText={changeDate}
                        keyboardType="number-pad"
                        maxLength={10}
                        accessibilityLabel="Data da compra"
                      />
                    </View>
                    <View
                      style={[
                        styles.inputWrapper,
                        local.timeInput,
                        !!dateError && local.inputError,
                      ]}
                    >
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={colors.textMuted}
                        style={local.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="hh:mm"
                        placeholderTextColor={colors.textLight}
                        value={timeText}
                        onChangeText={changeTime}
                        keyboardType="number-pad"
                        maxLength={5}
                        accessibilityLabel="Hora da compra"
                      />
                    </View>
                  </View>
                  {!!dateError && (
                    <Text style={local.errorText}>{dateError}</Text>
                  )}
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

//---------------------- estilos só deste modal ----------------------
const local = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  labelInRow: {
    flex: 1,
    marginBottom: 0,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    marginLeft: 6,
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
  row: {
    flexDirection: "row",
  },
  dateInput: {
    flex: 3,
    marginRight: 10,
  },
  timeInput: {
    flex: 2,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 6,
  },
});

export default ModalScreen;
