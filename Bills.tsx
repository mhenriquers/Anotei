import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Bills: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text>Contas</Text>
        <TouchableOpacity style={styles.triggercard}>
          <Text style={styles.triggertext}> + </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
export default Bills;
