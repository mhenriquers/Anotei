import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Bills from "./Bills";

//import { create } from "react-native/types_generated/Libraries/ReactNative/ReactFabricPublicInstance/ReactNativeAttributePayload";

const Stack = createNativeStackNavigator<RootStackParamList>();
type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Type[]>([]);

  const valorTotalCredito = expenses
    .filter((item) => item.category === "credit card")
    .reduce((total, item) => total + item.amount, 0);

  const valorTotalDebito = expenses
    .filter((item) => item.category === "debit")
    .reduce((total, item) => total + item.amount, 0);

  const valorTotal = valorTotalCredito + valorTotalDebito;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  //----------------------------- estudar oq isso faz ----------------------------------------

  const toggleSelectExpense = (id: string) => {
    setSelectedExpenseIds((prev) =>
      prev?.includes(id)
        ? prev.filter((expenseId) => expenseId !== id)
        : [...prev, id],
    );
  };
  // ------------------------função para salvar os dados
  const saveExpenses = async (expensesToSave: Type[]) => {
    try {
      await AsyncStorage.setItem("expenses", JSON.stringify(expensesToSave));
    } catch (error) {
      console.error("Erro ao salvar gastos", error);
    }
  };
  //--------------------------função para carregar os dados

  const loadExpenses = async () => {
    try {
      const savedExpenses = await AsyncStorage.getItem("expenses");
      if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);

        //converter as datas para Date

        const expenseWithDates = parsedExpenses.map((expense: any) => ({
          ...expense,
          createdAt: new Date(expense.createdAt),
        }));
        setExpenses(expenseWithDates);
      }
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };
  //------------------------------------------função para salvar
  const handleSaveExpense = (newExpenseData: any) => {
    const completeExpense: Type = {
      ...newExpenseData,
      id: Math.random().toString(),
      createdAt: new Date(),
    };

    const updateExpenses = [...expenses, completeExpense];
    setExpenses(updateExpenses);
    saveExpenses(updateExpenses);
    setIsModalVisible(false);
  };

  //----------------------------------------- função para deletar
  const handleDeleteExpense = () => {
    if (selectedExpenseIds.length > 0) {
      const updatedExpenses = expenses.filter(
        (expense) => !selectedExpenseIds.includes(expense.id),
      );
      setExpenses(updatedExpenses);
      saveExpenses(updatedExpenses);
      setSelectedExpenseIds([]);
      alert("Gasto deletado!");
    } else {
      alert("Selecione ao menos um gasto");
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={"Home"} options={{ headerShown: false }}>
          {(props) => (
            <HomeScreen
              {...props}
              onOpenModal={() => setIsModalVisible(true)}
              expenses={expenses}
              totalGastoCredito={valorTotalCredito}
              totalGastoDebito={valorTotalDebito}
              valorTotal={valorTotal}
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
              totalGastoCredito={valorTotalCredito}
              totalGastoDebito={valorTotalDebito}
              selectedExpenseIds={selectedExpenseIds}
              onSelectExpense={toggleSelectExpense}
              isDeleteMode={isDeleteMode}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name={"Bills"}
          component={Bills}
          options={{ headerShown: true, headerTitle: "Contas Fixas" }}
        ></Stack.Screen>
      </Stack.Navigator>

      {isMenuVisible && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            onPress={() => {
              if (expenses.length > 0) {
                setIsDeleteMode(true);
                setIsMenuVisible(false);
              } else {
                alert("Não há mais que possa ser feito! ");
              }
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
