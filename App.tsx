import React, { useState, useEffect } from "react";
import { Type, RootStackParamList, InterfaceBill, Reserva } from "./Types";
import Reservas from "./Screens/Reservas";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import ExpenseList from "./Screens/ExpensesList";
import HomeScreen from "./Screens/HomeScreen";
import ModalScreen from "./components/ModalScreen";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeaderMenu from "./components/HeaderMenu";
import { colors } from "./theme";
import Bills from "./Screens/Bills";
import ModalBill from "./components/ModalBills";
import MenuOverlay from "./components/MenuOverlay";
import ConfirmDialog from "./components/ConfirmDialog";
import { syncBillReminders } from "./notifications";
import InstallScreen from "./components/InstallScreen";
import { needsInstallFirst } from "./pwa";
import { totalsByPaymentMethod } from "./paymentMethods";

const Stack = createNativeStackNavigator<RootStackParamList>();
type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

//--------------------------função para salvar dados
const SalvaConta = async (billsToSave: InterfaceBill[]) => {
  try {
    await AsyncStorage.setItem("bills", JSON.stringify(billsToSave));
  } catch (error) {
    alert("Erro ao salvar contas");
  }
};

const AnoteiApp: React.FC = () => {
  const [expenses, setExpenses] = useState<Type[]>([]);

  // total por forma de pagamento (crédito, débito e pix)
  const paymentTotals = totalsByPaymentMethod(expenses);
  const valorTotal =
    paymentTotals["credit card"] + paymentTotals.debit + paymentTotals.pix;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"expense" | "bill" | null>(null);

  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);

  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [isDeleteAllVisible, setIsDeleteAllVisible] = useState(false);

  //----------------------------- estudar oq isso faz ----------------------------------------

  const toggleSelectExpense = (id: string) => {
    setSelectedExpenseIds((prev) =>
      prev?.includes(id)
        ? prev.filter((expenseId) => expenseId !== id)
        : [...prev, id],
    );
  };

  // ------------------------função para salvar os dados ed

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
  // gasto aberto no modal para edição (null = cadastro de um gasto novo)
  const [editingExpense, setEditingExpense] = useState<Type | null>(null);

  const openExpenseModal = (expense: Type | null) => {
    setEditingExpense(expense);
    setModalType("expense");
    setIsModalVisible(true);
  };

  const handleSaveExpense = (newExpenseData: Omit<Type, "id">) => {
    const completeExpense: Type = {
      ...newExpenseData,
      // ao editar, o gasto mantém o id (e continua no mesmo lugar da lista)
      id: editingExpense?.id ?? Math.random().toString(),
      // data/hora escolhida no cadastro (por padrão, a de agora)
      createdAt: newExpenseData.createdAt ?? new Date(),
    };

    const updateExpenses = editingExpense
      ? expenses.map((expense) =>
          expense.id === editingExpense.id
            ? { ...expense, ...completeExpense }
            : expense,
        )
      : [...expenses, completeExpense];
    setExpenses(updateExpenses);
    saveExpenses(updateExpenses);
    setIsModalVisible(false);
    setEditingExpense(null);
  };

  //----------------------------------------- função para deletar gasto
  const handleDeleteExpenses = (idsParaDeletar: string[]) => {
    // Usamos diretamente o parâmetro que o Modal Genérico nos enviou!
    if (idsParaDeletar && idsParaDeletar.length > 0) {
      const updatedExpenses = expenses.filter(
        (expense) => !idsParaDeletar.includes(expense.id),
      );

      setExpenses(updatedExpenses);
      saveExpenses(updatedExpenses);
      alert("Gasto(s) deletado(s) com sucesso!");
    } else {
      alert("Selecione ao menos um gasto para excluir.");
    }
  };

  //----------------------------------------- função para apagar todos os gastos
  const handleDeleteAllExpenses = () => setIsDeleteAllVisible(true);

  const confirmDeleteAllExpenses = () => {
    setExpenses([]);
    saveExpenses([]);
    setIsDeleteAllVisible(false);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  //-------------------------------função pra salvar conta fixa
  const [bills, setBills] = useState<InterfaceBill[]>([]);
  const [billsLoaded, setBillsLoaded] = useState(false);

  const handleSaveBill = (billData: InterfaceBill) => {
    console.log("Nova conta:", billData); // ← Adicione isto
    console.log("Bills antes:", bills); // ← E isto
    const updatedBills = [...bills, billData];
    console.log("Bills depois:", updatedBills); // ← E isto
    setBills(updatedBills);
    SalvaConta(updatedBills);
    setIsModalVisible(false);
  };

  //--------------------------função para carregar dados
  const carregaConta = async () => {
    try {
      const savedBills = await AsyncStorage.getItem("bills");
      if (savedBills) {
        setBills(JSON.parse(savedBills));
      }
    } catch (error) {
      alert("Erro ao carregar contas");
    } finally {
      setBillsLoaded(true);
    }
  };

  const handleUpdateBills = (updatedBills: InterfaceBill[]) => {
    setBills(updatedBills);
    SalvaConta(updatedBills);
  };
  //-------------------------- reservas (dinheiro guardado)
  const [reservas, setReservas] = useState<Reserva[]>([]);

  const loadReservas = async () => {
    try {
      const saved = await AsyncStorage.getItem("reservas");
      setReservas(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error("Erro ao carregar reservas", error);
    }
  };

  const handleChangeReservas = async (updated: Reserva[]) => {
    setReservas(updated);
    try {
      await AsyncStorage.setItem("reservas", JSON.stringify(updated));
    } catch (error) {
      console.error("Erro ao salvar reservas", error);
      alert("Erro ao salvar reservas");
    }
  };

  useEffect(() => {
    loadExpenses();
    carregaConta();
    loadReservas();
  }, []);

  //-------------------------- reagenda os avisos de vencimento sempre que as contas mudam
  useEffect(() => {
    if (billsLoaded) {
      syncBillReminders(bills);
    }
  }, [bills, billsLoaded]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          id="RootStack"
          screenOptions={{
            // cabeçalho branco com sombra leve, separado do fundo cinza das telas
            headerStyle: { backgroundColor: colors.surface },
            headerShadowVisible: true,
            headerTintColor: colors.hero,
            headerTitleStyle: { fontWeight: "800", fontSize: 20 },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          {/*--------------------------Tela Home------------------------------ */}

          <Stack.Screen name={"Home"} options={{ headerShown: false }}>
            {(props) => (
              <HomeScreen
                {...props}
                onOpenModal={() => openExpenseModal(null)}
                onEditExpense={openExpenseModal}
                expenses={expenses}
                paymentTotals={paymentTotals}
                valorTotal={valorTotal}
                innerBill={bills}
                reservas={reservas}
                onDataRestored={async () => {
                  // relê tudo do armazenamento depois de restaurar um backup
                  await Promise.all([
                    loadExpenses(),
                    carregaConta(),
                    loadReservas(),
                  ]);
                }}
              />
            )}
          </Stack.Screen>

          {/*--------------------------Tela de Gastos------------------------------ */}

          <Stack.Screen
            name={"ExpenseList"}
            options={{
              headerShown: true,
              headerTitle: "Meus Gastos",
              headerRight: () => (
                <HeaderMenu onMenuPress={() => setIsMenuVisible(true)} />
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
                paymentTotals={paymentTotals}
                isDeleteMode={isDeleteMode}
                setIsDeleteMode={setIsDeleteMode}
                onDeleteExpenses={handleDeleteExpenses}
                onEditExpense={openExpenseModal}
              />
            )}
          </Stack.Screen>

          {/*--------------------------Tela Contas Fixas------------------------ */}

          <Stack.Screen
            name={"Bills"}
            options={{
              headerShown: true,
              headerTitle: "Contas Fixas",
            }}
            listeners={({ navigation }) => ({
              beforeRemove: () => {
                setIsModalVisible(false);
              },
            })}
          >
            {(props: NativeStackScreenProps<RootStackParamList, "Bills">) => (
              <Bills
                {...props}
                innerBill={bills}
                onOpenModal={() => {
                  setModalType("bill");
                  setIsModalVisible(true);
                }}
                onDeleteBills={(updatedBills) => setBills(updatedBills)}
                onUpdateBills={handleUpdateBills}
              />
            )}
          </Stack.Screen>

          {/*--------------------------Tela Reservas------------------------ */}

          <Stack.Screen
            name={"Reservas"}
            options={{ headerShown: true, headerTitle: "Reservas" }}
          >
            {() => (
              <Reservas
                reservas={reservas}
                onChange={handleChangeReservas}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>

        {/*---------------------- Menu Suspenso (3 Pontos) Reutilizável ------------------ */}
        <MenuOverlay
          isVisible={isMenuVisible}
          dataLength={expenses.length}
          dataType="expenses"
          onOpen={() => {
            if (expenses.length > 0) {
              setIsDeleteMode(true); // Abre o modal de exclusão
              setIsMenuVisible(false); // Fecha o menu de 3 pontos
            } else {
              alert("Não há gastos para excluir!");
            }
          }}
          onClose={() => setIsMenuVisible(false)}
          onDeleteAll={handleDeleteAllExpenses}
        />

        {/*---------------------- Confirmação de apagar todos os gastos ------------------ */}
        <ConfirmDialog
          visible={isDeleteAllVisible}
          title="Apagar todos os gastos?"
          message={`${
            expenses.length === 1
              ? "1 gasto será apagado."
              : `${expenses.length} gastos serão apagados.`
          } Essa ação não pode ser desfeita.`}
          icon="trash-outline"
          tone="danger"
          confirmLabel="Apagar tudo"
          cancelLabel="Cancelar"
          onConfirm={confirmDeleteAllExpenses}
          onCancel={() => setIsDeleteAllVisible(false)}
        />

        {/*----------------------Variavel de controle Modal------------------ */}

        {isModalVisible && modalType === "expense" && (
          <ModalScreen
            visible={isModalVisible}
            expense={editingExpense}
            onClose={() => {
              setIsModalVisible(false);
              setEditingExpense(null);
            }}
            onSave={handleSaveExpense}
          />
        )}

        {isModalVisible && modalType === "bill" && (
          <ModalBill
            visible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSave={handleSaveBill}
          />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

//-------------------------- iPhone pelo Safari: pede para instalar antes de usar
// (lá a aba do Safari e o app instalado não compartilham os dados)
const showInstallScreen = needsInstallFirst();

const App: React.FC = () =>
  showInstallScreen ? (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <InstallScreen />
    </SafeAreaProvider>
  ) : (
    <AnoteiApp />
  );

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
