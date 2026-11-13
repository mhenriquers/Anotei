import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Type } from "../Types";
import { colors, radius, shadow, formatBRL, areValuesHidden } from "../theme";
import { addMonths, filterByMonth, monthName, sumAmounts } from "../months";

interface MonthChartProps {
  expenses: Type[];
  month: string; // mês escolhido ("2026-11"): última barra, destacada
  onSelectMonth?: (month: string) => void; // tocar numa barra escolhe o mês
}

const MONTHS = 6;
const BAR_AREA = 90; // altura máxima da barra

// valor curto em cima da barra: 850 → "850", 1234 → "1,2 mil"
const shortValue = (value: number): string => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".", ",").replace(",0", "")} mil`;
  }
  return Math.round(value).toString();
};

//---------------------- gastos dos últimos 6 meses (barras simples, sem biblioteca) ----------------------
const MonthChart: React.FC<MonthChartProps> = ({
  expenses,
  month,
  onSelectMonth,
}) => {
  const bars = Array.from({ length: MONTHS }, (_, i) => {
    const key = addMonths(month, i - (MONTHS - 1));
    return { key, total: sumAmounts(filterByMonth(expenses, key)) };
  });
  const max = Math.max(...bars.map((bar) => bar.total), 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Últimos 6 meses</Text>
      <View style={styles.chart}>
        {bars.map((bar) => {
          const active = bar.key === month;
          const height = bar.total > 0 ? Math.max(4, (bar.total / max) * BAR_AREA) : 0;
          return (
            <TouchableOpacity
              key={bar.key}
              style={styles.column}
              onPress={() => onSelectMonth?.(bar.key)}
              disabled={!onSelectMonth}
              activeOpacity={0.7}
              accessibilityLabel={`${monthName(bar.key)}: ${formatBRL(bar.total)}`}
            >
              <Text
                style={[styles.value, active && styles.valueActive]}
                numberOfLines={1}
              >
                {bar.total > 0 && !areValuesHidden() ? shortValue(bar.total) : ""}
              </Text>
              <View
                style={[
                  styles.bar,
                  { height },
                  active ? styles.barActive : styles.barIdle,
                ]}
              />
              <Text style={[styles.label, active && styles.labelActive]}>
                {monthName(bar.key).slice(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    marginBottom: 16,
    ...shadow,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 12,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: BAR_AREA + 40,
  },
  value: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  valueActive: {
    color: colors.hero,
    fontWeight: "700",
  },
  bar: {
    width: "60%",
    maxWidth: 32,
    borderRadius: 6,
  },
  barIdle: {
    backgroundColor: colors.creditSoft,
  },
  barActive: {
    backgroundColor: colors.hero,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  labelActive: {
    color: colors.hero,
    fontWeight: "700",
  },
});

export default MonthChart;
