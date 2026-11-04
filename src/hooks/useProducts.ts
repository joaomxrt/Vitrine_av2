import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { storageService } from '../services/storage';
import { Product, ProductDraft, ProductTotals, RequestStatus } from '../types';
import { calculateTotals, createProduct, EMPTY_TOTALS } from '../utils/products';

const LOAD_ERROR = 'Não foi possível carregar os produtos salvos no dispositivo.';
const SAVE_ERROR = 'Não foi possível salvar no dispositivo. Tente novamente.';

interface UseProductsResult {
  products: Product[];
  totals: ProductTotals;
  status: RequestStatus;
  error: string | null;
  reload: () => Promise<void>;
  findProduct: (id: string) => Product | undefined;
  addProduct: (draft: ProductDraft) => Promise<void>;
  updateProduct: (id: string, changes: Partial<Product>) => Promise<void>;
  togglePurchased: (product: Product) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
}

/**
 * Custom hook que concentra o estado da lista de compras.
 * A leitura é recarregada sempre que a tela ganha foco, para que uma alteração
 * feita no formulário apareça imediatamente na lista ao voltar.
 */
export const useProducts = (): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<RequestStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  // Só a primeira leitura mostra o indicador de carregamento. Nas recargas por
  // foco a lista já está na tela, e piscar o spinner a cada volta incomoda.
  const hasLoadedRef = useRef(false);

  const reload = useCallback(async () => {
    if (!hasLoadedRef.current) {
      setStatus('loading');
    }

    try {
      const stored = await storageService.getProducts();
      setProducts(stored);
      setError(null);
      setStatus('success');
      hasLoadedRef.current = true;
    } catch {
      setError(LOAD_ERROR);
      setStatus('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const addProduct = useCallback(async (draft: ProductDraft) => {
    const product = createProduct(draft);

    try {
      await storageService.addProduct(product);
    } catch {
      throw new Error(SAVE_ERROR);
    }

    setProducts((previous) => [...previous, product]);
  }, []);

  const updateProduct = useCallback(async (id: string, changes: Partial<Product>) => {
    try {
      await storageService.updateProduct(id, changes);
    } catch {
      throw new Error(SAVE_ERROR);
    }

    setProducts((previous) =>
      previous.map((product) => (product.id === id ? { ...product, ...changes } : product)),
    );
  }, []);

  const togglePurchased = useCallback(async (product: Product) => {
    const isPurchased = !product.isPurchased;

    try {
      await storageService.updateProduct(product.id, { isPurchased });
    } catch {
      throw new Error(SAVE_ERROR);
    }

    setProducts((previous) =>
      previous.map((item) => (item.id === product.id ? { ...item, isPurchased } : item)),
    );
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    try {
      await storageService.deleteProduct(id);
    } catch {
      throw new Error(SAVE_ERROR);
    }

    setProducts((previous) => previous.filter((product) => product.id !== id));
  }, []);

  const findProduct = useCallback(
    (id: string): Product | undefined => products.find((product) => product.id === id),
    [products],
  );

  const totals = useMemo(
    () => (products.length > 0 ? calculateTotals(products) : EMPTY_TOTALS),
    [products],
  );

  return {
    products,
    totals,
    status,
    error,
    reload,
    findProduct,
    addProduct,
    updateProduct,
    togglePurchased,
    removeProduct,
  };
};
