import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Produto da lista de compras, já persistido no dispositivo. */
export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  quantity: number;
  isPurchased: boolean;
  /** Comerciante do bairro associado ao produto. */
  businessId?: string;
  businessName?: string;
}

/** Dados que o formulário fornece; id e status são gerados pelo domínio. */
export type ProductDraft = Omit<Product, 'id' | 'isPurchased'>;

/** Resumo financeiro da lista, calculado a partir dos produtos. */
export interface ProductTotals {
  itemCount: number;
  purchasedCount: number;
  estimatedTotal: number;
  purchasedTotal: number;
  pendingTotal: number;
}

/** Comerciante do bairro, vindo da API REST. */
export interface Business {
  id: string;
  name: string;
  category: string;
  address?: string;
  phone?: string;
}

/** Estado de uma operação assíncrona. */
export type RequestStatus = 'loading' | 'success' | 'error';

export type RootStackParamList = {
  Home: undefined;
  ProductList: { businessId?: string; businessName?: string } | undefined;
  ProductForm: { productId?: string; businessId?: string; businessName?: string } | undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type ProductListScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductList'>;
export type ProductFormScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductForm'>;
