import React, { useState } from "react";
import { Type, RootStackParamList } from "./Types";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import ExpenseList from "./ExpensesList";
import HomeScreen from "./HomeScreen";
import ModalScreen from "./ModalScreen";
import { TouchableOpacity, Image, StyleSheet, Text, View } from "react-native";
// import { View } from "react-native/types_generated/index";

const Stack = createNativeStackNavigator<RootStackParamList>();
type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Type[]>([]);
  const valorTotal = expenses.reduce((total, item) => total + item.amount, 0);

  const handleSaveExpense = (newExpenseData: any) => {
    const completeExpense: Type = {
      ...newExpenseData,
      id: Math.random().toString(),
      createdAt: new Date(),
    };
    setExpenses((currentExpenses) => [...currentExpenses, completeExpense]);
    setIsModalVisible(false);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleDeleteExpense = () => {
    if (selectedExpenseIds) {
      setExpenses((currentExpenses) =>
        currentExpenses.filter(
          (expense) => !selectedExpenseIds.includes(expense.id),
        ),
      );
      setSelectedExpenseIds([]);
      alert("Gasto deletado!");
    } else {
      alert("Selecione ao menos um gasto");
    }
  };

  //----------------------------- estudar oq isso faz ----------------------------------------

  const toggleSelectExpense = (id: string) => {
    setSelectedExpenseIds((prev) =>
      prev?.includes(id)
        ? prev.filter((expenseId) => expenseId !== id)
        : [...prev, id],
    );
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={"Home"} options={{ headerShown: false }}>
          {(props) => (
            <HomeScreen
              {...props}
              onOpenModal={() => setIsModalVisible(true)}
              expenses={expenses}
              totalGasto={valorTotal}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name={"ExpenseList"}
          options={{
            headerShown: true,
            headerTitle: "Meus Gastos",
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  setIsMenuVisible(true);
                }}
              >
                <Image
                  source={require("./assets/3-pontos.png")}
                  style={{
                    width: 40,
                    height: 40,
                    marginRight: 0,
                  }}
                />
              </TouchableOpacity>
            ),
          }}
          listeners={({ navigation }) => ({
            beforeRemove: () => {
              setIsDeleteMode(false);
              setIsMenuVisible(false);
              setSelectedExpenseIds([]);
            },
          })}
        >
          {(props) => (
            <ExpenseList
              expenseList={expenses}
              totalGasto={valorTotal}
              selectedExpenseIds={selectedExpenseIds}
              onSelectExpense={toggleSelectExpense}
              isDeleteMode={isDeleteMode}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>

      {isMenuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            onPress={() => {
              setIsDeleteMode(true);
              setIsMenuVisible(false);
            }}
          >
            <Text style={styles.menuOption}> Apagar </Text>
          </TouchableOpacity>
        </View>
      )}

      {isDeleteMode && (
        <View style={styles.containerButtons}>
          <TouchableOpacity
            onPress={() => {
              setIsDeleteMode(false);
              setSelectedExpenseIds([]);
            }}
            style={styles.cancelButton}
          >
            <Text style={styles.textButtons}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              handleDeleteExpense();
              setIsDeleteMode(false);
            }}
            style={styles.eraserButton}
          >
            <Text style={styles.textButtons}>Apagar</Text>
          </TouchableOpacity>
        </View>
      )}

      <ModalScreen
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveExpense}
      />
    </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  menuOverlay: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    zIndex: 200,
    elevation: 5,
  },

  menuOption: {
    fontSize: 16,
    padding: 10,
    fontWeight: "bold",
  },

  containerButtons: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 100,
  },

  textButtons: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

  cancelButton: {
    backgroundColor: "#75d0fa",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  eraserButton: {
    backgroundColor: "#d60606",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
});
export default App;
