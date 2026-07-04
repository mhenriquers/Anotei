import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to Tracking Waste</Text>
      <Text style={styles.subtitle}>React Native App</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});

export default App;
