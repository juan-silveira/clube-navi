/**
 * Utilitários para gerar placeholders de imagem
 */

/**
 * Gera um SVG placeholder como Data URL
 * @param {number} width - Largura da imagem
 * @param {number} height - Altura da imagem
 * @param {string} backgroundColor - Cor de fundo (hex)
 * @param {string} textColor - Cor do texto (hex)
 * @param {string} text - Texto a ser exibido
 * @returns {string} Data URL do SVG
 */
export const generateSVGPlaceholder = (width, height, backgroundColor, textColor, text) => {
  // Remove # das cores se presente
  const bgColor = backgroundColor.replace('#', '');
  const txtColor = textColor.replace('#', '');
  
  // Calcular tamanho da fonte baseado na altura
  const fontSize = Math.min(width, height) * 0.3;
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" 
            font-weight="bold" text-anchor="middle" dominant-baseline="central" 
            fill="#${txtColor}">${text}</text>
    </svg>
  `;
  
  // Converter para Data URL
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
};

/**
 * Gera placeholder para logo da empresa
 * @param {boolean} isDark - Se é tema escuro
 * @param {boolean} isCompact - Se é versão compacta
 * @returns {string} Data URL do placeholder
 */
export const generateLogoPlaceholder = (isDark = false, isCompact = false) => {
  const width = isCompact ? 40 : 200;
  const height = isCompact ? 40 : 60;
  const text = isCompact ? 'C' : 'LOGO';
  
  const backgroundColor = isDark ? '#1E293B' : '#3B82F6';
  const textColor = '#FFFFFF';
  
  return generateSVGPlaceholder(width, height, backgroundColor, textColor, text);
};

/**
 * Gera placeholder personalizado para empresa
 * @param {string} companyName - Nome da empresa
 * @param {boolean} isDark - Se é tema escuro
 * @param {boolean} isCompact - Se é versão compacta
 * @returns {string} Data URL do placeholder
 */
export const generateCompanyPlaceholder = (companyName, isDark = false, isCompact = false) => {
  const width = isCompact ? 40 : 200;
  const height = isCompact ? 40 : 60;
  
  // Pegar primeira letra do nome da empresa
  const text = isCompact 
    ? companyName.charAt(0).toUpperCase()
    : companyName.toUpperCase().substring(0, 8);
  
  // Cores baseadas no nome da empresa para consistência
  let backgroundColor, textColor;
  
  if (companyName.toLowerCase().includes('coinage')) {
    backgroundColor = isDark ? '#059669' : '#10B981';
    textColor = '#FFFFFF';
  } else if (companyName.toLowerCase().includes('navi')) {
    backgroundColor = isDark ? '#1D4ED8' : '#3B82F6';
    textColor = '#FFFFFF';
  } else {
    backgroundColor = isDark ? '#1E293B' : '#6B7280';
    textColor = '#FFFFFF';
  }
  
  return generateSVGPlaceholder(width, height, backgroundColor, textColor, text);
};