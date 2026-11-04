import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing } from '../theme/colors';
import { Product } from '../types';
import { formatCurrency } from '../utils/format';
import { getProductSubtotal } from '../utils/products';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onTogglePurchased?: () => void;
  onRemove?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onTogglePurchased,
  onRemove,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, product.isPurchased && styles.cardPurchased]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Editar ${product.name}`}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, product.isPurchased && styles.textPurchased]}>
            {product.name}
          </Text>

          {onTogglePurchased && (
            <TouchableOpacity
              onPress={onTogglePurchased}
              style={styles.checkbox}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: product.isPurchased }}
              accessibilityLabel={
                product.isPurchased
                  ? `Marcar ${product.name} como não comprado`
                  : `Marcar ${product.name} como comprado`
              }
            >
              <View style={[styles.checkboxBox, product.isPurchased && styles.checkboxBoxChecked]}>
                {product.isPurchased && <View style={styles.checkboxMark} />}
              </View>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.category}>{product.category}</Text>

        {product.businessName && (
          <Text style={styles.business} numberOfLines={1}>
            {product.businessName}
          </Text>
        )}

        <View style={styles.priceRow}>
          <Text style={styles.quantity}>
            {product.quantity} x {formatCurrency(product.price)}
          </Text>
          <Text style={styles.subtotal}>{formatCurrency(getProductSubtotal(product))}</Text>
        </View>

        {product.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}

        {onRemove && (
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            accessibilityRole="button"
            accessibilityLabel={`Remover ${product.name} da lista`}
          >
            <Text style={styles.removeText}>Remover</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardPurchased: {
    opacity: 0.7,
    backgroundColor: '#E8F5E9',
  },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  textPurchased: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  checkbox: {
    paddingLeft: spacing.sm,
    minWidth: 44,
    minHeight: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // Caixa e traço desenhados com View: independem da fonte de emoji do aparelho
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkboxMark: {
    width: 6,
    height: 11,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.white,
    transform: [{ rotate: '45deg' }],
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  business: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  quantity: { fontSize: 13, color: colors.textLight },
  subtotal: { fontSize: 15, color: colors.secondary, fontWeight: '700' },
  description: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  removeButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: 32,
    justifyContent: 'center',
  },
  removeText: { fontSize: 12, color: colors.error, fontWeight: '700' },
});
