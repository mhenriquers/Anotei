import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ModalScreen } from "./ModalScreen";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Tracking Waste</Text>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Total Gasto:</Text>
          <Text style={styles.value}>$0.00</Text>
        </View>

        {/*----------------modal------------------*/}
        <ModalScreen
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        />

        <View style={styles.triggercard}>
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Text style={styles.triggertext}> + </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#faf7e7",
    paddingHorizontal: 20,
  },
  card: {
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    borderRadius: 16,
    elevation: 15,
    shadowRadius: 5,
    padding: 20,
    shadowOffset: { width: 10, height: 0 },
    backgroundColor: "#fff",
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
    fontSize: 26,
    color: "#666",
  },
  value: {
    fontSize: 26,
    fontWeight: "bold",
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
  },
  triggertext: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
  },
});

export default App;
