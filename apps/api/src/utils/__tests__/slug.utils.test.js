const {
  removeAccents,
  generateSlug,
  generateBundleId,
  generatePackageName,
  generateUrlScheme,
  isValidSlug,
  isValidBundleId
} = require('../slug.utils');

describe('Slug Utils', () => {
  describe('removeAccents', () => {
    it('deve remover acentos de caracteres minúsculos', () => {
      expect(removeAccents('café')).toBe('cafe');
      expect(removeAccents('açúcar')).toBe('acucar');
      expect(removeAccents('são paulo')).toBe('sao paulo');
    });

    it('deve remover acentos de caracteres maiúsculos', () => {
      expect(removeAccents('CAFÉ')).toBe('CAFE');
      expect(removeAccents('AÇÚCAR')).toBe('ACUCAR');
      expect(removeAccents('SÃO PAULO')).toBe('SAO PAULO');
    });

    it('deve manter caracteres sem acentos inalterados', () => {
      expect(removeAccents('abc123')).toBe('abc123');
      expect(removeAccents('teste')).toBe('teste');
    });

    it('deve tratar cedilha corretamente', () => {
      expect(removeAccents('ação')).toBe('acao');
      expect(removeAccents('Ação')).toBe('Acao');
    });
  });

  describe('generateSlug', () => {
    it('deve gerar slug básico', () => {
      expect(generateSlug('Clube Force')).toBe('clube-force');
      expect(generateSlug('Clube Azore')).toBe('clube-azore');
    });

    it('deve remover acentos e caracteres especiais', () => {
      expect(generateSlug('Clube São Paulo')).toBe('clube-sao-paulo');
      expect(generateSlug('Força & Ação')).toBe('forca-acao');
      expect(generateSlug('Café com Açúcar')).toBe('cafe-com-acucar');
    });

    it('deve converter para lowercase', () => {
      expect(generateSlug('CLUBE FORCE')).toBe('clube-force');
      expect(generateSlug('CluBe MiXeD')).toBe('clube-mixed');
    });

    it('deve substituir espaços múltiplos por um hífen', () => {
      expect(generateSlug('Clube   Force')).toBe('clube-force');
      expect(generateSlug('Clube     Force')).toBe('clube-force');
    });

    it('deve remover hífens duplicados', () => {
      expect(generateSlug('Clube--Force')).toBe('clube-force');
      expect(generateSlug('Clube---Force')).toBe('clube-force');
    });

    it('deve remover hífens nas extremidades', () => {
      expect(generateSlug('-Clube Force-')).toBe('clube-force');
      expect(generateSlug('---Clube Force---')).toBe('clube-force');
    });

    it('deve remover símbolos e caracteres especiais', () => {
      expect(generateSlug('Clube @#$% Force')).toBe('clube-force');
      expect(generateSlug('Clube (Test) Force!')).toBe('clube-test-force');
      expect(generateSlug('100% Clube')).toBe('100-clube');
    });

    it('deve tratar strings vazias', () => {
      expect(() => generateSlug('')).toThrow();
      expect(() => generateSlug(null)).toThrow();
      expect(() => generateSlug(undefined)).toThrow();
    });

    it('deve gerar slugs válidos para casos reais', () => {
      expect(generateSlug('Clube Digital Navi')).toBe('clube-digital-navi');
      expect(generateSlug('Associação dos Comerciantes')).toBe('associacao-dos-comerciantes');
      expect(generateSlug('Rede de Benefícios')).toBe('rede-de-beneficios');
    });
  });

  describe('generateBundleId', () => {
    it('deve gerar bundle ID correto', () => {
      expect(generateBundleId('clube-force')).toBe('com.clubedigital.clubeforce');
      expect(generateBundleId('clube-azore')).toBe('com.clubedigital.clubeazore');
    });

    it('deve remover hífens do slug', () => {
      expect(generateBundleId('clube-sao-paulo')).toBe('com.clubedigital.clubesaopaulo');
      expect(generateBundleId('forca-acao')).toBe('com.clubedigital.forcaacao');
    });

    it('deve converter para lowercase', () => {
      expect(generateBundleId('Clube-Force')).toBe('com.clubedigital.clubeforce');
      expect(generateBundleId('CLUBE-FORCE')).toBe('com.clubedigital.clubeforce');
    });

    it('deve rejeitar slugs inválidos', () => {
      expect(() => generateBundleId('')).toThrow();
      expect(() => generateBundleId(null)).toThrow();
      expect(() => generateBundleId(undefined)).toThrow();
    });
  });

  describe('generatePackageName', () => {
    it('deve gerar package name igual ao bundle ID', () => {
      expect(generatePackageName('clube-force')).toBe('com.clubedigital.clubeforce');
      expect(generatePackageName('clube-azore')).toBe('com.clubedigital.clubeazore');
    });

    it('deve seguir mesmo formato do bundle ID', () => {
      const slug = 'clube-sao-paulo';
      expect(generatePackageName(slug)).toBe(generateBundleId(slug));
    });
  });

  describe('generateUrlScheme', () => {
    it('deve gerar URL scheme correto', () => {
      expect(generateUrlScheme('clube-force')).toBe('clubedigitalclubeforce');
      expect(generateUrlScheme('clube-azore')).toBe('clubedigitalclubeazore');
    });

    it('deve remover hífens', () => {
      expect(generateUrlScheme('clube-sao-paulo')).toBe('clubedigitalclubesaopaulo');
      expect(generateUrlScheme('forca-acao')).toBe('clubedigitalforcaacao');
    });

    it('deve converter para lowercase', () => {
      expect(generateUrlScheme('Clube-Force')).toBe('clubedigitalclubeforce');
      expect(generateUrlScheme('CLUBE-FORCE')).toBe('clubedigitalclubeforce');
    });
  });

  describe('isValidSlug', () => {
    it('deve validar slugs corretos', () => {
      expect(isValidSlug('clube-force')).toBe(true);
      expect(isValidSlug('clube-azore')).toBe(true);
      expect(isValidSlug('clube123')).toBe(true);
      expect(isValidSlug('abc')).toBe(true);
      expect(isValidSlug('a-b-c')).toBe(true);
    });

    it('deve rejeitar slugs com caracteres inválidos', () => {
      expect(isValidSlug('clube_force')).toBe(false); // underscore
      expect(isValidSlug('clube.force')).toBe(false); // ponto
      expect(isValidSlug('clube force')).toBe(false); // espaço
      expect(isValidSlug('clube@force')).toBe(false); // @
    });

    it('deve rejeitar slugs que começam ou terminam com hífen', () => {
      expect(isValidSlug('-clube')).toBe(false);
      expect(isValidSlug('clube-')).toBe(false);
      expect(isValidSlug('-clube-')).toBe(false);
    });

    it('deve rejeitar slugs com hífens consecutivos', () => {
      expect(isValidSlug('clube--force')).toBe(false);
      expect(isValidSlug('clube---force')).toBe(false);
    });

    it('deve rejeitar slugs muito curtos ou muito longos', () => {
      expect(isValidSlug('ab')).toBe(false); // muito curto
      expect(isValidSlug('a'.repeat(51))).toBe(false); // muito longo
    });

    it('deve rejeitar slugs com maiúsculas', () => {
      expect(isValidSlug('Clube-Force')).toBe(false);
      expect(isValidSlug('CLUBE')).toBe(false);
    });

    it('deve rejeitar valores vazios ou nulos', () => {
      expect(isValidSlug('')).toBe(false);
      expect(isValidSlug(null)).toBe(false);
      expect(isValidSlug(undefined)).toBe(false);
    });
  });

  describe('isValidBundleId', () => {
    it('deve validar bundle IDs corretos', () => {
      expect(isValidBundleId('com.clubedigital.clubeforce')).toBe(true);
      expect(isValidBundleId('com.clubedigital.abc123')).toBe(true);
    });

    it('deve rejeitar bundle IDs com formato incorreto', () => {
      expect(isValidBundleId('clubeforce')).toBe(false);
      expect(isValidBundleId('com.wrong.clubeforce')).toBe(false);
      expect(isValidBundleId('com.clubedigital')).toBe(false);
    });

    it('deve rejeitar bundle IDs com hífens', () => {
      expect(isValidBundleId('com.clubedigital.clube-force')).toBe(false);
    });

    it('deve rejeitar bundle IDs com maiúsculas', () => {
      expect(isValidBundleId('com.clubedigital.ClubeForce')).toBe(false);
    });

    it('deve rejeitar valores vazios ou nulos', () => {
      expect(isValidBundleId('')).toBe(false);
      expect(isValidBundleId(null)).toBe(false);
      expect(isValidBundleId(undefined)).toBe(false);
    });
  });
});
