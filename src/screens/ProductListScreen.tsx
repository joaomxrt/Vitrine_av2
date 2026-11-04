import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { SelectableChip } from '../components/SelectableChip';
import { ShoppingSummary } from '../components/ShoppingSummary';
import { useProducts } from '../hooks/useProducts';
import { colors, spacing } from '../theme/colors';
import { Product, ProductListScreenProps } from '../types';
import { calculateTotals } from '../utils/products';

type ListFilter = 'Todos' | 'Pendentes' | 'Comprados';

const FILTERS: ListFilter[] = ['Todos', 'Pendentes', 'Comprados'];

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const ProductListScreen: React.FC<ProductListScreenProps> = ({ navigation, route }) => {
  const businessId = route.params?.businessId;
  const businessName = route.params?.businessName;

  const { products, totals, status, error, reload, togglePurchased, removeProduct } = useProducts();
  const [filter, setFilter] = useState<ListFilter>('Todos');

  // Quando a tela é aberta a partir de um comerciante, mostra só os produtos dele.
  const scopedProducts = useMemo(
    () => (businessId ? products.filter((product) => product.businessId === businessId) : products),
    [products, businessId],
  );

  const scopedTotals = useMemo(
    () => (businessId ? calculateTotals(scopedProducts) : totals),
    [businessId, scopedProducts, totals],
  );

  const visibleProducts = useMemo(() => {
    if (filter === 'Pendentes') {
      return scopedProducts.filter((product) => !product.isPurchased);
    }

    if (filter === 'Comprados') {
      return scopedProducts.filter((product) => product.isPurchased);
    }

    return scopedProducts;
  }, [scopedProducts, filter]);

  const handleTogglePurchased = async (product: Product) => {
    try {
      await togglePurchased(product);
    } catch (toggleError) {
      Alert.alert('Erro', getErrorMessage(toggleError, 'Não foi possível atualizar o produto.'));
    }
  };

  const confirmRemove = (product: Product) => {
    Alert.alert('Remover produto', `Deseja remover "${product.name}" da lista?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          void removeProduct(product.id).catch((removeError: unknown) => {
            Alert.alert(
              'Erro',
              getErrorMessage(removeError, 'Não foi possível remover o produto.'),
            );
          });
        },
      },
    ]);
  };

  const emptyMessage =
    scopedProducts.length === 0
      ? 'Nenhum produto cadastrado'
      : `Nenhum produto ${filter === 'Pendentes' ? 'pendente' : 'comprado'} no momento`;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        {businessName && <Text style={styles.scopeLabel}>Comerciante: {businessName}</Text>}

        <ShoppingSummary totals={scopedTotals} />

        <View style={styles.filters}>
          {FILTERS.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={filter === item}
              onPress={() => setFilter(item)}
              accessibilityLabel={`Filtrar por ${item}`}
            />
          ))}
        </View>

        {status === 'loading' && (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        )}

        {status === 'error' && error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                void reload();
              }}
              accessibilityRole="button"
              accessibilityLabel="Tentar carregar a lista novamente"
            >
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {status !== 'loading' && status !== 'error' && (
          <FlatList
            data={visibleProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
                onTogglePurchased={() => {
                  void handleTogglePurchased(item);
                }}
                onRemove={() => confirmRemove(item)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
                <Text style={styles.emptySubtext}>
                  Toque no botão + para adicionar um produto
                </Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ProductForm', { businessId, businessName })}
        accessibilityRole="button"
        accessibilityLabel="Adicionar produto à lista"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.md },
  scopeLabel: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  filters: { flexDirection: 'row', marginBottom: spacing.md },
  // Espaço para o botão flutuante não cobrir o último cartão
  listContent: { paddingBottom: 88 },
  loader: { marginTop: 50 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 15,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  retryText: { color: colors.white, fontWeight: '600' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  fabText: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '300',
  },
});
