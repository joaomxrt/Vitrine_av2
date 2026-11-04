import { Business } from '../types';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com/users';

/** DTO: formato bruto devolvido pela API. */
interface BusinessDTO {
  id: number;
  name: string;
  address?: { street?: string };
  phone?: string;
}

/** Converte o DTO da API para o modelo usado pelo app. */
const toBusiness = (dto: BusinessDTO): Business => ({
  id: dto.id.toString(),
  name: dto.name,
  category: 'Comércio Local',
  address: dto.address?.street ?? 'Endereço não disponível',
  phone: dto.phone ?? 'Telefone não disponível',
});

export const apiService = {
  async getBusinesses(): Promise<Business[]> {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status} ao buscar comerciantes.`);
    }

    const data: BusinessDTO[] = await response.json();

    return data.map(toBusiness);
  },

  async getBusinessById(id: string): Promise<Business | null> {
    const businesses = await apiService.getBusinesses();

    return businesses.find((business) => business.id === id) ?? null;
  },
};
