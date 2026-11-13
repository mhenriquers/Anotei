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
  formatBRLInput,
  formatBRL,
} from "../theme";
import { MAX_PARCELAS } from "../installments";
import {
  PAYMENT_METHODS,
  PaymentMethod,
  getPaymentInfo,
} from "../paymentMethods";
import { formStyles as styles } from "./formStyles";
import PaymentIcon from "./PaymentIcon";

interface ModalScreenProps {
  visible: boolean;
  onClose: () => void;
  // parcelas > 1: compra parcelada no crédito (o App divide em vários gastos)
  onSave: (expenseData: Omit<Type, "id">, parcelas: number) => void;
  expense?: Type | null; // se passado, o modal edita esse gasto
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
  expense,
}) => {
  const insets = useSafeAreaInsets();
  const isEditing = !!expense;

  //-----------------------varavel de controle do teclado-----------------------------
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // o modal é montado ao abrir, então os campos começam com os dados do gasto em edição
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    expense?.category ?? "credit card",
  );
  const [nameExpense, setNameExpense] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(
    expense ? formatBRLInput(expense.amount) : "",
  );
  const [obs, setObs] = useState(expense?.observacao ?? "");

  // parcelas: só no cadastro de um gasto novo no crédito
  const [parcelasText, setParcelasText] = useState("1");
  const canSplit = !isEditing && paymentMethod === "credit card";
  const parcelas = canSplit
    ? Math.min(Math.max(Number(parcelasText) || 1, 1), MAX_PARCELAS)
    : 1;
  const amountNumber = parseBRLInput(amount);

  // data e hora da compra: começam com "agora" (ou com as do gasto em edição)
  const startDate = expense ? new Date(expense.createdAt) : new Date();
  const [dateText, setDateText] = useState(() => formatDateInput(startDate));
  const [timeText, setTimeText] = useState(() => formatTime(startDate));
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
    // parcela já lançada pode cair num mês futuro
    const purchase = parseDateTimeInput(
      dateText,
      timeText,
      !!expense?.grupoParcela,
    );
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
    }, parcelas);
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
    const { label, color } = getPaymentInfo(value);
    const active = paymentMethod === value;
    return (
      <TouchableOpacity
        key={value}
        style={[styles.segmentButton, active && styles.segmentButtonActive]}
        onPress={() => setPaymentMethod(value)}
      >
        <PaymentIcon
          method={value}
          size={18}
          muted={!active}
          mutedColor={colors.textMuted}
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
                  <Text style={styles.title}>
                    {isEditing ? "Editar gasto" : "Novo gasto"}
                  </Text>
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

                {/*-------------parcelas (só no crédito)-----------------*/}
                {canSplit && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Parcelas</Text>
                    <View style={local.row}>
                      <View style={[styles.inputWrapper, local.parcelasInput]}>
                        <TextInput
                          style={styles.input}
                          placeholder="1"
                          placeholderTextColor={colors.textLight}
                          value={parcelasText}
                          onChangeText={(text) =>
                            setParcelasText(text.replace(/\D/g, "").slice(0, 2))
                          }
                          keyboardType="number-pad"
                          maxLength={2}
                          accessibilityLabel="Número de parcelas"
                        />
                        <Text style={styles.prefix}>x</Text>
                      </View>
                      <Text style={local.parcelasHint}>
                        {parcelas > 1 && amountNumber > 0
                          ? `${parcelas}x de ${formatBRL(amountNumber / parcelas)}, uma por mês`
                          : `À vista ou até ${MAX_PARCELAS}x`}
                      </Text>
                    </View>
                  </View>
                )}

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
                    <Text style={styles.buttonPrimaryText}>
                      {isEditing ? "Salvar" : "Adicionar"}
                    </Text>
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
  parcelasInput: {
    width: 90,
    marginRight: 12,
  },
  parcelasHint: {
    flex: 1,
    alignSelf: "center",
    fontSize: 13,
    color: colors.textMuted,
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
