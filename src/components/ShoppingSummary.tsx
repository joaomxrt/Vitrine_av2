import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing } from '../theme/colors';
import { ProductTotals } from '../types';
import { formatCurrency } from '../utils/format';

interface ShoppingSummaryProps {
  totals: ProductTotals;
}

/** Resumo financeiro da compra: total estimado, já comprado e o que falta. */
export const ShoppingSummary: React.FC<ShoppingSummaryProps> = ({ totals }) => {
  const itemWord = totals.itemCount === 1 ? 'item comprado' : 'itens comprados';
  const progressLabel =
    totals.itemCount === 0
      ? 'Nenhum produto na lista'
      : `${totals.purchasedCount} de ${totals.itemCount} ${itemWord}`;

  return (
    <View
      style={styles.container}
      accessible
      accessibilityLabel={`Resumo da compra. Total estimado ${formatCurrency(
        totals.estimatedTotal,
      )}. ${progressLabel}.`}
    >
      <Text style={styles.label}>Total estimado</Text>
      <Text style={styles.total}>{formatCurrency(totals.estimatedTotal)}</Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.columnLabel}>Já comprado</Text>
          <Text style={styles.columnValue}>{formatCurrency(totals.purchasedTotal)}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.columnLabel}>Falta comprar</Text>
          <Text style={[styles.columnValue, styles.pendingValue]}>
            {formatCurrency(totals.pendingTotal)}
          </Text>
        </View>
      </View>

      <Text style={styles.progress}>{progressLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: { color: colors.white, fontSize: 13, opacity: 0.85 },
  total: { color: colors.white, fontSize: 30, fontWeight: '700', marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    opacity: 0.25,
    marginVertical: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { flex: 1 },
  columnLabel: { color: colors.white, fontSize: 12, opacity: 0.85 },
  columnValue: { color: colors.white, fontSize: 16, fontWeight: '600', marginTop: 2 },
  pendingValue: { color: colors.primary },
  progress: { color: colors.white, fontSize: 12, marginTop: spacing.sm, opacity: 0.85 },
});
