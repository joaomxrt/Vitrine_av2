import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { Business } from '../types';

const OFFLINE_MESSAGE = 'Você está offline. Mostrando os comerciantes salvos.';
const NO_CACHE_MESSAGE =
  'Não foi possível carregar os comerciantes e não há dados salvos no dispositivo.';

interface UseBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Carregamento dos comerciantes com estratégia offline-first:
 * 1. tenta a API REST e atualiza o cache local;
 * 2. em caso de falha, usa o cache gravado no dispositivo;
 * 3. sem cache, informa o erro ao usuário.
 */
export const useBusinesses = (): UseBusinessesResult => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const remoteData = await apiService.getBusinesses();
      setBusinesses(remoteData);
      await storageService.saveBusinessesCache(remoteData);
    } catch {
      const cachedData = await storageService.getCachedBusinesses();

      setBusinesses(cachedData);
      setError(cachedData.length > 0 ? OFFLINE_MESSAGE : NO_CACHE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { businesses, loading, error, reload };
};
