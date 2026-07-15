import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InterfaceBill } from "../Types";
import RenderCard from "../components/RenderCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuOverlay from "../components/MenuOverlay";
import { useNavigation } from "@react-navigation/native";
import HeaderMenu from "../components/HeaderMenu";
import MenuExclusaoGenerico from "../components/ExcluseMenu";
import ProgressBar from "../components/ProgressBar";

interface BillProps {
  onOpenModal: () => void;
  innerBill: InterfaceBill[];
  onDeleteBills: (updatedBills: InterfaceBill[]) => void;
}

const Bills: React.FC<BillProps> = ({
  onOpenModal,
  innerBill,
  onDeleteBills,
}) => {
  //-------------------------------- variaveis de controle

  const navigation = useNavigation();
  const [bills, setBills] = useState<InterfaceBill[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedBillIds, setSelectedBillIds] = useState<string[]>([]);
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
      // Nota: O próprio modal já pode salvar no AsyncStorage,
      // mas manter aqui garante que o estado local fique idêntico.
      saveBills(updatedBills);
      onDeleteBills(updatedBills);

      alert("Conta(s) excluída(s) com sucesso!");
    } else {
      alert("Nenhuma conta foi selecionada.");
    }
  };

  const handleSelectBill = (id: string) => {
    setSelectedBillIds((prev) => (prev.includes(id) ? [] : [id]));
  };

  useEffect(() => {
    setBills(innerBill);
  }, [innerBill]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderMenu
          onMenuPress={() => setIsMenuVisible(true)}
          imageStyle={{ width: 40, height: 40, marginRight: 10 }}
        />
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
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ProgressBar progress={progress} label="Contas Pagas" />
      <FlatList
        data={bills}
        renderItem={({ item }) => (
          <RenderCard
            itemCard={item}
            onTogglePaid={() => handleTogglePaid(item.id)}
          />
        )} // Removida a prop key daqui
        keyExtractor={(item) => item.id} // Este cara já resolve tudo sozinho
        ListEmptyComponent={<Text> </Text>}
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
          storageKey="bills" // Sua chave do AsyncStorage
          title="Excluir Contas"
          subtitle="Selecione as contas que deseja apagar:"
          renderTitle={(item) => item.nome}
          renderSubtitle={(item) => `R$ ${item.valor.toFixed(2)}`}
          onDelete={handleDeleteBill}
          onCancel={() => setIsDeleteMode(false)}
        />
      )}
      <TouchableOpacity onPress={onOpenModal} style={styles.triggercard}>
        <Text style={styles.triggertext}> + </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  triggercard: {
    position: "absolute",
    bottom: 70,
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

  triggertext: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
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
export default Bills;
