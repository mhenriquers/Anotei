import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import ModalScreen from "./ModalScreen";
import { Type, RootStackParamList } from "./Types";
import ExpenseList from "./ExpensesList";

interface AppProps {}

const HomeScreen: React.FC<{
  navigation: any;
  onOpenModal: () => void;
  expenses: Type[];
  totalGasto: number;
}> = ({ navigation, onOpenModal, expenses, totalGasto }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Image source={require("./assets/logo.png")} style={styles.logo} />

        <View style={styles.containerCards}>
          <TouchableOpacity style={[styles.card, styles.subCard]}>
            <Text style={styles.subtitle}> Fixas: </Text>
            <Text style={styles.value}> R$ 0,00 </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("ExpenseList")}
            style={[styles.card, styles.subCard]}
          >
            <Text style={styles.subtitle}> Cartão: </Text>
            <Text style={styles.value}> R$ {totalGasto.toFixed(2)} </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerCards}>
          <TouchableOpacity style={[styles.card, styles.subCard]}>
            <Text style={styles.subtitle}> Débito </Text>
            <Text style={styles.value}> R$ 0,00 </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.subCard]}>
            <Text style={styles.subtitle}>Total:</Text>
            <Text style={styles.value}>R$0,00</Text>
          </TouchableOpacity>
        </View>

        {/*----------------modal------------------*/}

        {/* <TouchableOpacity
          onPress={() => navigation.navigate("ExpenseList")}
          style={styles.linkButton}
        >
          <Text style={styles.linkButtonText}> Meus gastos </Text>
        </TouchableOpacity> */}
        <TouchableOpacity onPress={onOpenModal} style={styles.triggercard}>
          <Text style={styles.triggertext}> + </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#faf7e7",
    paddingHorizontal: 20,
  },

  linkButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#333",
    borderRadius: 8,
  },

  linkButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  containerCards: {
    flexDirection: "row",
    top: 20,
  },

  logo: {
    width: 250,
    height: 250,
    top: 0,
  },

  card: {
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    borderRadius: 16,
    elevation: 15,
    shadowRadius: 5,
    padding: 20,
    shadowOffset: { width: 10, height: 0 },
    backgroundColor: "#fff",
    margin: 5,
    marginTop: 20,
  },

  subCard: {
    width: "50%",
    margin: 5,
    marginTop: 0,
    paddingVertical: 25,
  },

  title: {
    position: "absolute",
    top: 50,
    fontSize: 34,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    alignSelf: "center",
    justifyContent: "flex-start",
  },

  subtitle: {
    fontSize: 20,
    color: "#333",
    fontWeight: "bold",
    alignItems: "flex-start",
  },

  value: {
    fontSize: 18,
    color: "#333",
  },

  triggercard: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#41d606",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    flex: 1,
  },

  buttonTrigger: {
    alignItems: "center",
    justifyContent: "center",
  },

  triggertext: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
});

export default HomeScreen;
