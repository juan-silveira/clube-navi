const translationService = require('../services/translation.service');

class TranslationController {
  // ==================== LANGUAGES ====================

  async getAllLanguages(req, res) {
    try {
      const languages = await translationService.getAllLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getActiveLanguages(req, res) {
    try {
      const languages = await translationService.getActiveLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createLanguage(req, res) {
    try {
      const language = await translationService.createLanguage(req.body);
      res.status(201).json(language);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateLanguage(req, res) {
    try {
      const { id } = req.params;
      const language = await translationService.updateLanguage(id, req.body);
      res.json(language);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteLanguage(req, res) {
    try {
      const { id } = req.params;
      await translationService.deleteLanguage(id);
      res.json({ message: 'Language deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async setDefaultLanguage(req, res) {
    try {
      const { id } = req.params;
      const language = await translationService.setDefaultLanguage(id);
      res.json(language);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== NAMESPACES ====================

  async getAllNamespaces(req, res) {
    try {
      const namespaces = await translationService.getAllNamespaces();
      res.json(namespaces);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createNamespace(req, res) {
    try {
      const namespace = await translationService.createNamespace(req.body);
      res.status(201).json(namespace);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateNamespace(req, res) {
    try {
      const { id } = req.params;
      const namespace = await translationService.updateNamespace(id, req.body);
      res.json(namespace);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteNamespace(req, res) {
    try {
      const { id } = req.params;
      await translationService.deleteNamespace(id);
      res.json({ message: 'Namespace deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== TRANSLATIONS ====================

  async getTranslationsByNamespaceAndLanguage(req, res) {
    try {
      const { namespace, language } = req.params;
      const translations = await translationService.getTranslationsByNamespaceAndLanguage(
        namespace,
        language
      );
      res.json(translations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllTranslationsByLanguage(req, res) {
    try {
      const { language } = req.params;
      const translations = await translationService.getAllTranslationsByLanguage(language);
      res.json(translations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTranslationsGrouped(req, res) {
    try {
      const { language } = req.params;
      const grouped = await translationService.getTranslationsGroupedByNamespace(language);
      res.json(grouped);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async upsertTranslation(req, res) {
    try {
      const { namespace, language, key } = req.params;
      const { value } = req.body;
      const userId = req.user?.id || null;

      const translation = await translationService.upsertTranslation(
        namespace,
        language,
        key,
        value,
        userId
      );

      res.json(translation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async bulkUpsertTranslations(req, res) {
    try {
      const { translations } = req.body;
      const userId = req.user?.id || null;

      const data = translations.map(t => ({
        ...t,
        userId,
      }));

      const results = await translationService.bulkUpsertTranslations(data);
      res.json({
        message: `${results.length} translations updated`,
        results,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTranslation(req, res) {
    try {
      const { id } = req.params;
      await translationService.deleteTranslation(id);
      res.json({ message: 'Translation deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMissingTranslations(req, res) {
    try {
      const { language } = req.params;
      const missing = await translationService.getMissingTranslations(language);
      res.json({
        language,
        count: missing.length,
        translations: missing,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ==================== EXPORT/IMPORT ====================

  async exportTranslations(req, res) {
    try {
      const { language } = req.params;
      const data = await translationService.exportTranslationsToJSON(language);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=translations-${language}.json`
      );
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async importTranslations(req, res) {
    try {
      const { language } = req.params;
      const jsonData = req.body;
      const userId = req.user?.id || null;

      const results = await translationService.importTranslationsFromJSON(
        language,
        jsonData,
        userId
      );

      res.json({
        message: `Imported ${results.length} translations`,
        results,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ==================== SYNC ====================

  async syncToFiles(req, res) {
    try {
      const result = await translationService.syncToFiles();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async syncFromFiles(req, res) {
    try {
      const result = await translationService.syncFromFiles();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ==================== STATISTICS ====================

  async getStatistics(req, res) {
    try {
      const stats = await translationService.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TranslationController();
