import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InterfaceBill } from "../Types";
import RenderCard from "../components/RenderCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuOverlay from "../components/MenuOverlay";
import { useNavigation } from "@react-navigation/native";
import HeaderMenu from "../components/HeaderMenu";
import MenuExclusaoGenerico from "../components/ExcluseMenu";
import ProgressBar from "../components/ProgressBar";
import DraggableFab from "../components/DraggableFab";
import { colors, radius, shadow, formatBRL } from "../theme";

interface BillProps {
  onOpenModal: () => void;
  innerBill: InterfaceBill[];
  onDeleteBills: (updatedBills: InterfaceBill[]) => void;
  onUpdateBills?: (updatedBills: InterfaceBill[]) => void;
}

const Bills: React.FC<BillProps> = ({
  onOpenModal,
  innerBill,
  onDeleteBills,
  onUpdateBills,
}) => {
  //-------------------------------- variaveis de controle

  const navigation = useNavigation();
  const [bills, setBills] = useState<InterfaceBill[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  //-------------------------função para salvar contas fixas

  const saveBills = async (updatedBills: InterfaceBill[]) => {
    try {
      await AsyncStorage.setItem("bills", JSON.stringify(updatedBills));
    } catch (error) {
      console.error("Erro ao salvar contas", error);
    }
  };

  //----------------------------------- função para deletar contas fixas

  const handleDeleteBill = (idsParaDeletar: string[]) => {
    if (idsParaDeletar.length > 0) {
      // Filtra removendo todas as contas cujos IDs estão na lista de exclusão
      const updatedBills = bills.filter(
        (bill) => !idsParaDeletar.includes(bill.id),
      );

      setBills(updatedBills);
      saveBills(updatedBills);
      onDeleteBills(updatedBills);

      alert("Conta(s) excluída(s) com sucesso!");
    } else {
      alert("Nenhuma conta foi selecionada.");
    }
  };

  useEffect(() => {
    setBills(innerBill);
  }, [innerBill]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderMenu onMenuPress={() => setIsMenuVisible(true)} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    setProgress(calculaProgress());
  }, [bills]);

  const calculaProgress = (): number => {
    if (bills.length === 0) return 0;
    const paidBills = bills.filter((bill) => bill.pago).length;
    return (paidBills / bills.length) * 100;
  };

  const handleTogglePaid = (id: string) => {
    const updatedBills = bills.map((bill) =>
      bill.id === id ? { ...bill, pago: !bill.pago } : bill,
    );
    setBills(updatedBills);
    saveBills(updatedBills);
    if (onUpdateBills) {
      onUpdateBills(updatedBills);
    }
  };

  //-------------------------- resumo do mês --------------------------
  const total = bills.reduce((soma, bill) => soma + (bill.valor || 0), 0);
  const totalPago = bills
    .filter((bill) => bill.pago)
    .reduce((soma, bill) => soma + (bill.valor || 0), 0);
  const paidCount = bills.filter((bill) => bill.pago).length;

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      {/* View interno: a lista e o botão + terminam acima dos botões do celular */}
      <View style={styles.inner}>
        <FlatList
          data={bills}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryLabel}>Pago</Text>
                  <Text style={styles.summaryValue}>
                    {formatBRL(totalPago)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.summaryLabel}>Total do mês</Text>
                  <Text style={styles.summaryTotal}>{formatBRL(total)}</Text>
                </View>
              </View>
              <ProgressBar
                progress={progress}
                label={`${paidCount} de ${bills.length} contas pagas`}
              />
            </View>
          }
          renderItem={({ item }) => (
            <RenderCard
              itemCard={item}
              onTogglePaid={() => handleTogglePaid(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="calendar-outline"
                size={40}
                color={colors.textLight}
              />
              <Text style={styles.emptyTitle}>Nenhuma conta fixa</Text>
              <Text style={styles.emptyText}>
                Cadastre aluguel, internet, luz e outras contas no botão +.
              </Text>
            </View>
          }
        />

        <MenuOverlay
          isVisible={isMenuVisible}
          dataLength={bills.length}
          dataType="bills"
          onOpen={() => {
            setIsDeleteMode(true);
            setIsMenuVisible(false);
          }}
          onClose={() => setIsMenuVisible(false)}
        />

        {isDeleteMode && (
          <MenuExclusaoGenerico
            items={bills}
            storageKey="bills"
            title="Excluir contas"
            subtitle="Selecione as contas que deseja apagar."
            renderTitle={(item) => item.nome}
            renderSubtitle={(item) => formatBRL(item.valor)}
            onDelete={handleDeleteBill}
            onCancel={() => setIsDeleteMode(false)}
          />
        )}

        <DraggableFab
          onPress={onOpenModal}
          storageKey="fab-position-bills"
          accessibilityLabel="Adicionar conta"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  inner: {
    flex: 1,
  },

  listContent: {
    padding: 20,
    paddingBottom: 10, // + 10 de margem do último card = 20, igual às laterais
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 20,
    ...shadow,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },

  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 2,
  },

  summaryTotal: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },

  empty: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
  },

  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 4,
  },
});
export default Bills;
