/**
 * Máscaras e validações para formulários
 */

// ==================== MÁSCARAS ====================

/**
 * Aplica máscara de CNPJ: 12.345.678/0001-90
 */
export const maskCNPJ = (value) => {
  if (!value) return '';

  // Remove tudo que não é dígito
  const cleaned = value.replace(/\D/g, '');

  // Aplica a máscara
  return cleaned
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18); // Limita ao tamanho máximo
};

/**
 * Aplica máscara de CPF: 123.456.789-00
 */
export const maskCPF = (value) => {
  if (!value) return '';

  // Remove tudo que não é dígito
  const cleaned = value.replace(/\D/g, '');

  // Aplica a máscara
  return cleaned
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
    .slice(0, 14); // Limita ao tamanho máximo
};

/**
 * Aplica máscara de telefone: +55 (11) 98765-4321
 */
export const maskPhone = (value) => {
  if (!value) return '';

  // Remove tudo que não é dígito
  let cleaned = value.replace(/\D/g, '');

  // Se começa com 55, adiciona +
  if (cleaned.startsWith('55')) {
    cleaned = cleaned.slice(2);
  }

  // Aplica a máscara
  if (cleaned.length <= 10) {
    // (11) 9876-5432
    return cleaned
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // (11) 98765-4321
    return cleaned
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  }
};

// ==================== VALIDAÇÕES ====================

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ com ou sem máscara
 * @returns {boolean}
 */
export const validateCNPJ = (cnpj) => {
  if (!cnpj) return false;

  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');

  // Valida tamanho
  if (cleaned.length !== 14) return false;

  // Valida se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação dos dígitos verificadores
  let length = cleaned.length - 2;
  let numbers = cleaned.substring(0, length);
  const digits = cleaned.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(0)) return false;

  length = length + 1;
  numbers = cleaned.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result != digits.charAt(1)) return false;

  return true;
};

/**
 * Valida CPF
 * @param {string} cpf - CPF com ou sem máscara
 * @returns {boolean}
 */
export const validateCPF = (cpf) => {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');

  // Valida tamanho
  if (cleaned.length !== 11) return false;

  // Valida se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder >= 10 ? 0 : remainder;

  if (digit1 !== parseInt(cleaned.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder >= 10 ? 0 : remainder;

  if (digit2 !== parseInt(cleaned.charAt(10))) return false;

  return true;
};

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone com ou sem máscara
 * @returns {boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false;

  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');

  // Remove +55 se presente
  const phoneNumber = cleaned.startsWith('55') ? cleaned.slice(2) : cleaned;

  // Valida tamanho (10 ou 11 dígitos)
  if (phoneNumber.length < 10 || phoneNumber.length > 11) return false;

  // Valida DDD (código de área)
  const ddd = parseInt(phoneNumber.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  return true;
};

// ==================== UTILITÁRIOS ====================

/**
 * Remove máscara deixando apenas números
 */
export const removeMask = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '');
};
