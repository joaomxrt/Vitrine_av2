import AsyncStorage from '@react-native-async-storage/async-storage';
import { Business, Product } from '../types';

const PRODUCTS_KEY = '@vitrine:products';
const BUSINESSES_CACHE_KEY = '@vitrine:businesses_cache';

/**
 * Valida o formato dos dados lidos do dispositivo.
 * O AsyncStorage é uma fronteira do sistema: o conteúdo pode ter sido gravado
 * por uma versão anterior do app, então nada é assumido como confiável.
 */
const isProduct = (value: unknown): value is Product => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.price === 'number' &&
    Number.isFinite(candidate.price) &&
    typeof candidate.category === 'string' &&
    typeof candidate.quantity === 'number' &&
    Number.isFinite(candidate.quantity) &&
    typeof candidate.isPurchased === 'boolean'
  );
};

const isBusiness = (value: unknown): value is Business => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.category === 'string'
  );
};

/**
 * Lê uma lista do AsyncStorage validando cada item.
 * Conteúdo corrompido e irrecuperável é descartado para o app continuar
 * utilizável, em vez de travar em um estado de erro permanente.
 */
const readList = async <T>(key: string, isValid: (value: unknown) => value is T): Promise<T[]> => {
  const json = await AsyncStorage.getItem(key);

  if (!json) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    await AsyncStorage.removeItem(key);
    return [];
  }

  if (!Array.isArray(parsed)) {
    await AsyncStorage.removeItem(key);
    return [];
  }

  return parsed.filter(isValid);
};

/**
 * Persistência local. O dispositivo é a fonte da verdade da lista de compras:
 * ela funciona 100% offline. Os comerciantes têm apenas um cache de apoio.
 */
export const storageService = {
  async getProducts(): Promise<Product[]> {
    return readList(PRODUCTS_KEY, isProduct);
  },

  async saveProducts(products: Product[]): Promise<void> {
    await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  async addProduct(product: Product): Promise<void> {
    const products = await storageService.getProducts();
    await storageService.saveProducts([...products, product]);
  },

  async updateProduct(id: string, changes: Partial<Product>): Promise<void> {
    const products = await storageService.getProducts();
    const updated = products.map((product) =>
      product.id === id ? { ...product, ...changes, id: product.id } : product,
    );

    await storageService.saveProducts(updated);
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await storageService.getProducts();
    await storageService.saveProducts(products.filter((product) => product.id !== id));
  },

  // --- Cache offline-first dos comerciantes ---

  async getCachedBusinesses(): Promise<Business[]> {
    return readList(BUSINESSES_CACHE_KEY, isBusiness);
  },

  async saveBusinessesCache(businesses: Business[]): Promise<void> {
    await AsyncStorage.setItem(BUSINESSES_CACHE_KEY, JSON.stringify(businesses));
  },
};
