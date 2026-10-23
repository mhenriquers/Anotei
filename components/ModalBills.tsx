import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { handleBackgroundTap } from "./ModalScreen";
import ReminderToggle from "./ReminderToggle";
import { colors } from "../theme";
import { formStyles as styles } from "./formStyles";

interface ModalBill {
  visible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const ModalBill: React.FC<ModalBill> = ({ visible, onClose, onSave }) => {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const handlePress = () => handleBackgroundTap(isKeyboardVisible, onClose);

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

  //----------------Variaveis de Controle dos inputs----------------------
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const [dia, setDia] = useState("");
  const [obs, setObs] = useState("");
  const [avisar, setAvisar] = useState(true);

  // dia do vencimento válido (1 a 31) ou null
  const diaNumero = Number(dia);
  const dueDay =
    Number.isInteger(diaNumero) && diaNumero >= 1 && diaNumero <= 31
      ? diaNumero
      : null;

  //--------------------função para salvar a conta--------------------------

  const handleSaveBill = () => {
    if (nome.trim() === "" || valor.trim() === "" || dia.trim() === "") {
      alert("Preencha os campos obrigatórios");
      return;
    }
    const valorNumerico = parseFloat(valor.replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Digite um valor válido.");
      return;
    }
    if (dueDay === null) {
      alert("Informe um dia de vencimento entre 1 e 31.");
      return;
    }
    onSave({
      id: Date.now().toString(),
      nome: nome.trim(),
      valor: valorNumerico,
      venc: `Dia ${dueDay}`,
      diaVencimento: dueDay,
      avisar,
      obs: obs.trim(),
      pago: false,
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
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View
                style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}
              >
                <View style={styles.handle} />

                <View style={styles.header}>
                  <Text style={styles.title}>Nova conta fixa</Text>
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
                      placeholder="Ex: Internet"
                      placeholderTextColor={colors.textLight}
                      value={nome}
                      onChangeText={setNome}
                    />
                  </View>
                </View>

                {/*--------------input Valor e Venc.--------------*/}
                <View style={{ flexDirection: "row" }}>
                  <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Valor</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.prefix}>R$</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0,00"
                        placeholderTextColor={colors.textLight}
                        keyboardType="decimal-pad"
                        value={valor}
                        onChangeText={setValor}
                      />
                    </View>
                  </View>

                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Vencimento</Text>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.prefix}>Dia</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="5"
                        placeholderTextColor={colors.textLight}
                        keyboardType="number-pad"
                        maxLength={2}
                        value={dia}
                        onChangeText={(text) => setDia(text.replace(/\D/g, ""))}
                      />
                    </View>
                  </View>
                </View>

                {/*-------------input Obs-----------------*/}
                <View style={styles.field}>
                  <Text style={styles.label}>Observação (opcional)</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: débito automático"
                      placeholderTextColor={colors.textLight}
                      value={obs}
                      onChangeText={setObs}
                    />
                  </View>
                </View>

                {/*-------------aviso no vencimento-----------------*/}
                <ReminderToggle
                  value={avisar}
                  onValueChange={setAvisar}
                  dueDay={dueDay}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={[styles.button, styles.buttonSecondary]}
                  >
                    <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveBill}
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

export default ModalBill;
