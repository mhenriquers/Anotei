import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { colors } from "../theme";

interface ProgressBarProps {
  progress: number; // 0 a 100
  label?: string;
  compact?: boolean; // só a barra, sem título
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label = "Progresso",
  compact = false,
}) => {
  const getBarColor = (): string => {
    if (progress < 33) return colors.danger;
    if (progress < 66) return colors.warning;
    return colors.primary;
  };

  const animatedWidth = React.useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View>
      {!compact && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.percentage, { color: getBarColor() }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}
      <View style={styles.barBackground}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: getBarColor(),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  percentage: {
    fontSize: 14,
    fontWeight: "700",
  },
  barBackground: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
});

export default ProgressBar;
