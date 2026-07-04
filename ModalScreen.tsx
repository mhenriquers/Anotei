import React, { FC, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Expense } from "./Types";

interface ModalScreenProps {
  visible: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, "id" | "createdAt">) => void;
}

export const ModalScreen: React.FC<ModalScreenProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
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

  const handleBackgroundTap = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
    } else {
      onClose();
    }
  };
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={handleBackgroundTap}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalcard}>
                <TouchableOpacity onPress={onClose}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.titleText}> Adicionar Gasto </Text>

                    <View style={styles.closeImageContainer}>
                      <Image
                        source={require("./assets/closeImage.png")}
                        style={styles.closeImage}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                <View style={styles.generalContainer}>
                  <View style={styles.containerLabel}>
                    <Text style={styles.modaltext}>Nome: </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite o nome"
                    />
                  </View>
                  <View style={styles.containerLabel}>
                    <Text style={styles.modaltext}>Valor: </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite o valor"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.containerLabel}>
                    <Text style={styles.modaltext}> Obs : </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite a observação"
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalcard: {
    position: "absolute",
    top: "30%",
    right: "10%",
    justifyContent: "flex-start",
    width: "80%",
    borderRadius: 16,
    elevation: 15,
    shadowRadius: 5,
    backgroundColor: "#fff",
  },

  generalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  titleContainer: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  closeImageContainer: {
    alignSelf: "flex-end",
  },

  closeImage: {
    width: 30,
    height: 30,
    marginRight: 10,
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },

  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    paddingLeft: 10,
    paddingTop: 10,
  },

  containerLabel: {
    flexDirection: "row",
    height: 60,
    justifyContent: "center",
  },

  modaltext: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
    marginTop: 15,
    width: "20%",
  },

  input: {
    width: "65%",
    height: "auto",
    margin: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
});
