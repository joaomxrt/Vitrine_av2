import { Product, ProductDraft, ProductTotals } from '../types';

/**
 * Regras de domínio da lista de compras.
 * Funções puras, sem dependência de React, navegação ou persistência.
 */

export const EMPTY_TOTALS: ProductTotals = {
  itemCount: 0,
  purchasedCount: 0,
  estimatedTotal: 0,
  purchasedTotal: 0,
  pendingTotal: 0,
};

/** Arredonda para 2 casas, evitando acúmulo de erro de ponto flutuante nas somas. */
const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Subtotal do produto: quantidade x preço unitário. */
export const getProductSubtotal = (product: Product): number =>
  roundCurrency(product.quantity * product.price);

/** Cria um produto novo a partir dos dados do formulário. */
export const createProduct = (draft: ProductDraft): Product => ({
  ...draft,
  id: generateId(),
  isPurchased: false,
});

/** Calcula o resumo financeiro da lista de compras. */
export const calculateTotals = (products: Product[]): ProductTotals => {
  const totals = products.reduce<ProductTotals>((accumulated, product) => {
    const subtotal = getProductSubtotal(product);

    return {
      itemCount: accumulated.itemCount + 1,
      purchasedCount: accumulated.purchasedCount + (product.isPurchased ? 1 : 0),
      estimatedTotal: accumulated.estimatedTotal + subtotal,
      purchasedTotal: accumulated.purchasedTotal + (product.isPurchased ? subtotal : 0),
      pendingTotal: accumulated.pendingTotal + (product.isPurchased ? 0 : subtotal),
    };
  }, EMPTY_TOTALS);

  return {
    ...totals,
    estimatedTotal: roundCurrency(totals.estimatedTotal),
    purchasedTotal: roundCurrency(totals.purchasedTotal),
    pendingTotal: roundCurrency(totals.pendingTotal),
  };
};
