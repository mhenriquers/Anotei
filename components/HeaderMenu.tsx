import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

interface HeaderMenuProps {
  onMenuPress: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ onMenuPress }) => {
  return (
    <TouchableOpacity
      onPress={onMenuPress}
      style={styles.button}
      hitSlop={10}
      accessibilityLabel="Abrir menu"
    >
      <Ionicons name="ellipsis-vertical" size={22} color={colors.hero} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 6,
  },
});

export default HeaderMenu;
