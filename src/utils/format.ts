/**
 * Formatação e leitura de valores digitados pelo usuário (pt-BR).
 * Funções puras: não dependem de estado, UI ou plataforma.
 */

const DECIMAL_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;
const INTEGER_PATTERN = /^\d+$/;

/** Formata um número como moeda brasileira. Ex: 1234.5 -> "R$ 1.234,50". */
export const formatCurrency = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const [integerPart, decimalPart] = Math.abs(safeValue).toFixed(2).split('.');
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = safeValue < 0 ? '-' : '';

  return `${sign}R$ ${groupedInteger},${decimalPart}`;
};

/**
 * Converte texto digitado em número decimal, aceitando vírgula ou ponto.
 * Retorna null quando o texto não representa um decimal válido.
 */
export const parseDecimalInput = (input: string): number | null => {
  const trimmed = input.trim();

  if (!DECIMAL_PATTERN.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed.replace(',', '.'));

  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Converte texto digitado em número inteiro.
 * Retorna null quando o texto não representa um inteiro válido.
 */
export const parseIntegerInput = (input: string): number | null => {
  const trimmed = input.trim();

  if (!INTEGER_PATTERN.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isSafeInteger(parsed) ? parsed : null;
};

/** Converte um número decimal para o formato de digitação pt-BR ("12,50"). */
export const toDecimalInput = (value: number): string =>
  (Number.isFinite(value) ? value : 0).toFixed(2).replace('.', ',');
