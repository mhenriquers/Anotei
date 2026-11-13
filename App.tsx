import React, { useState, useEffect, useRef } from "react";
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
import UndoToast, { ToastData } from "./components/UndoToast";
import { syncBillReminders } from "./notifications";
import InstallScreen from "./components/InstallScreen";
import { needsInstallFirst } from "./pwa";
import { loadStoredValues } from "./storedValues";
import { splitInstallments } from "./installments";

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

  const handleSaveExpense = (
    newExpenseData: Omit<Type, "id">,
    parcelas: number = 1,
  ) => {
    // compra parcelada: vira um gasto por mês
    if (!editingExpense && parcelas > 1) {
      const installments = splitInstallments(newExpenseData, parcelas, () =>
        Math.random().toString(),
      );
      const updated = [...expenses, ...installments];
      setExpenses(updated);
      saveExpenses(updated);
      setIsModalVisible(false);
      return;
    }

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

  //----------------------------------------- aviso no rodapé com "Desfazer"
  const [toast, setToast] = useState<ToastData | null>(null);
  const showToast = (data: Omit<ToastData, "id">) =>
    setToast({ ...data, id: Date.now() });

  // lista atual de gastos, para o "Desfazer" (que roda depois) não usar uma lista antiga
  const expensesRef = useRef(expenses);
  expensesRef.current = expenses;

  // devolve os gastos apagados para a lista
  const restoreExpenses = (deleted: Type[]) => {
    const current = expensesRef.current;
    const missing = deleted.filter(
      (item) => !current.some((expense) => expense.id === item.id),
    );
    const restored = [...current, ...missing];
    setExpenses(restored);
    saveExpenses(restored);
  };

  const showDeletedToast = (deleted: Type[]) =>
    showToast({
      message:
        deleted.length === 1
          ? "Gasto apagado"
          : `${deleted.length} gastos apagados`,
      actionLabel: "Desfazer",
      onAction: () => restoreExpenses(deleted),
    });

  //----------------------------------------- função para deletar gasto
  const deleteExpenseIds = (ids: string[]) => {
    const current = expensesRef.current;
    const deleted = current.filter((expense) => ids.includes(expense.id));
    const updatedExpenses = current.filter(
      (expense) => !ids.includes(expense.id),
    );
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    if (deleted.length > 0) showDeletedToast(deleted);
  };

  // parcela apagada com outras parcelas da mesma compra ainda na lista:
  // pergunta se apaga só as escolhidas ou a compra inteira
  const [installmentDelete, setInstallmentDelete] = useState<{
    ids: string[]; // as escolhidas
    allIds: string[]; // as escolhidas + as outras parcelas das mesmas compras
  } | null>(null);

  const handleDeleteExpenses = (idsParaDeletar: string[]) => {
    // Usamos diretamente o parâmetro que o Modal Genérico nos enviou!
    if (idsParaDeletar && idsParaDeletar.length > 0) {
      const grupos = new Set(
        expenses
          .filter((e) => idsParaDeletar.includes(e.id) && e.grupoParcela)
          .map((e) => e.grupoParcela),
      );
      const allIds = expenses
        .filter(
          (e) =>
            idsParaDeletar.includes(e.id) ||
            (e.grupoParcela && grupos.has(e.grupoParcela)),
        )
        .map((e) => e.id);

      if (allIds.length > idsParaDeletar.length) {
        setInstallmentDelete({ ids: idsParaDeletar, allIds });
      } else {
        deleteExpenseIds(idsParaDeletar);
      }
    } else {
      alert("Selecione ao menos um gasto para excluir.");
    }
  };

  //----------------------------------------- função para apagar todos os gastos
  const handleDeleteAllExpenses = () => setIsDeleteAllVisible(true);

  const confirmDeleteAllExpenses = () => {
    const deleted = expenses;
    setExpenses([]);
    saveExpenses([]);
    setIsDeleteAllVisible(false);
    if (deleted.length > 0) showDeletedToast(deleted);
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  //-------------------------------função pra salvar conta fixa
  const [bills, setBills] = useState<InterfaceBill[]>([]);
  const [billsLoaded, setBillsLoaded] = useState(false);

  // conta aberta no modal para edição (null = cadastro de uma conta nova)
  const [editingBill, setEditingBill] = useState<InterfaceBill | null>(null);

  const openBillModal = (bill: InterfaceBill | null) => {
    setEditingBill(bill);
    setModalType("bill");
    setIsModalVisible(true);
  };

  const handleSaveBill = (billData: InterfaceBill) => {
    // ao editar, troca a conta com o mesmo id (continua no mesmo lugar da lista)
    const updatedBills = editingBill
      ? bills.map((bill) => (bill.id === billData.id ? billData : bill))
      : [...bills, billData];
    setBills(updatedBills);
    SalvaConta(updatedBills);
    setIsModalVisible(false);
    setEditingBill(null);
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
    loadStoredValues();
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
                innerBill={bills}
                reservas={reservas}
                onDataRestored={async () => {
                  // relê tudo do armazenamento depois de restaurar um backup
                  await Promise.all([
                    loadExpenses(),
                    carregaConta(),
                    loadReservas(),
                    loadStoredValues(),
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
                onOpenModal={() => openBillModal(null)}
                onEditBill={openBillModal}
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
          } Dá para desfazer logo depois.`}
          icon="trash-outline"
          tone="danger"
          confirmLabel="Apagar tudo"
          cancelLabel="Cancelar"
          onConfirm={confirmDeleteAllExpenses}
          onCancel={() => setIsDeleteAllVisible(false)}
        />

        {/*---------------------- Apagar parcela: só esta ou a compra toda ------------------ */}
        <ConfirmDialog
          visible={installmentDelete !== null}
          title="Apagar as outras parcelas?"
          message={
            installmentDelete
              ? `Essa compra tem mais ${
                  installmentDelete.allIds.length - installmentDelete.ids.length
                } parcela(s) na lista. Quer apagar todas?`
              : ""
          }
          icon="card-outline"
          tone="danger"
          confirmLabel="Todas"
          cancelLabel={
            installmentDelete?.ids.length === 1 ? "Só esta" : "Só as escolhidas"
          }
          onConfirm={() => {
            if (installmentDelete) deleteExpenseIds(installmentDelete.allIds);
            setInstallmentDelete(null);
          }}
          onCancel={() => {
            if (installmentDelete) deleteExpenseIds(installmentDelete.ids);
            setInstallmentDelete(null);
          }}
        />

        {/*---------------------- Aviso no rodapé ("Gasto apagado · Desfazer") ------------------ */}
        <UndoToast toast={toast} onHide={() => setToast(null)} />

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
            bill={editingBill}
            onClose={() => {
              setIsModalVisible(false);
              setEditingBill(null);
            }}
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
