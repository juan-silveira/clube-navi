/**
 * Categorias de tokens disponíveis no sistema
 *
 * Estas categorias são usadas para organizar tokens em diferentes grupos
 * no frontend (ex: DigitalAssetsCard) e no backend (banco de dados).
 */

export const TOKEN_CATEGORIES = {
  CRIPTOMOEDAS: 'criptomoedas',
  STARTUPS: 'startups',
  UTILITY: 'utility',
  DIGITAL: 'digital'
};

export const TOKEN_CATEGORY_LABELS = {
  [TOKEN_CATEGORIES.CRIPTOMOEDAS]: 'Criptomoedas',
  [TOKEN_CATEGORIES.STARTUPS]: 'Startups',
  [TOKEN_CATEGORIES.UTILITY]: 'Utility Tokens',
  [TOKEN_CATEGORIES.DIGITAL]: 'Renda Digital'
};

export const TOKEN_CATEGORY_OPTIONS = [
  { value: TOKEN_CATEGORIES.CRIPTOMOEDAS, label: TOKEN_CATEGORY_LABELS[TOKEN_CATEGORIES.CRIPTOMOEDAS] },
  { value: TOKEN_CATEGORIES.STARTUPS, label: TOKEN_CATEGORY_LABELS[TOKEN_CATEGORIES.STARTUPS] },
  { value: TOKEN_CATEGORIES.UTILITY, label: TOKEN_CATEGORY_LABELS[TOKEN_CATEGORIES.UTILITY] },
  { value: TOKEN_CATEGORIES.DIGITAL, label: TOKEN_CATEGORY_LABELS[TOKEN_CATEGORIES.DIGITAL] }
];

export const DEFAULT_TOKEN_CATEGORY = TOKEN_CATEGORIES.CRIPTOMOEDAS;
