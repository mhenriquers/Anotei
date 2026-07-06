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

const Stack = createNativeStackNavigator<RootStackParamList>();
type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Type[]>([]);

  const handleSaveExpense = (newExpenseData: any) => {
    const completeExpense: Type = {
      ...newExpenseData,
      id: Math.random().toString(),
      createdAt: new Date(),
    };
    setExpenses((currentExpenses) => [...currentExpenses, completeExpense]);

    setIsModalVisible(false);
  };
  const [currentScreen, setCurrentScreen] = useState<"home" | "list">("home");
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={"Home"} options={{ headerShown: false }}>
          {(props) => (
            <HomeScreen
              {...props}
              onOpenModal={() => setIsModalVisible(true)}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name={"ExpenseList"}>
          {(props) => <ExpenseList {...props} expenseList={expenses} />}
        </Stack.Screen>
      </Stack.Navigator>
      <ModalScreen
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveExpense}
      />
    </NavigationContainer>
  );
};
export default App;
