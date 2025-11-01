const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const fs = require('fs').promises;
const path = require('path');

class TranslationService {
  // ==================== LANGUAGES ====================

  async getAllLanguages() {
    return await prisma.language.findMany({
      orderBy: { isDefault: 'desc' },
    });
  }

  async getActiveLanguages() {
    return await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { isDefault: 'desc' },
    });
  }

  async getLanguageById(id) {
    return await prisma.language.findUnique({
      where: { id },
    });
  }

  async createLanguage(data) {
    return await prisma.language.create({
      data,
    });
  }

  async updateLanguage(id, data) {
    return await prisma.language.update({
      where: { id },
      data,
    });
  }

  async deleteLanguage(id) {
    return await prisma.language.delete({
      where: { id },
    });
  }

  async setDefaultLanguage(id) {
    await prisma.language.updateMany({
      data: { isDefault: false },
    });

    return await prisma.language.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  // ==================== NAMESPACES ====================

  async getAllNamespaces() {
    return await prisma.translationNamespace.findMany({
      orderBy: { key: 'asc' },
      include: {
        _count: {
          select: { translations: true },
        },
      },
    });
  }

  async getNamespaceById(id) {
    return await prisma.translationNamespace.findUnique({
      where: { id },
    });
  }

  async createNamespace(data) {
    return await prisma.translationNamespace.create({
      data,
    });
  }

  async updateNamespace(id, data) {
    return await prisma.translationNamespace.update({
      where: { id },
      data,
    });
  }

  async deleteNamespace(id) {
    return await prisma.translationNamespace.delete({
      where: { id },
    });
  }

  // ==================== TRANSLATIONS ====================

  async getTranslationsByNamespaceAndLanguage(namespaceKey, languageCode) {
    const namespace = await prisma.translationNamespace.findUnique({
      where: { key: namespaceKey },
    });

    const language = await prisma.language.findUnique({
      where: { code: languageCode },
    });

    if (!namespace || !language) {
      return [];
    }

    return await prisma.translation.findMany({
      where: {
        namespaceId: namespace.id,
        languageId: language.id,
      },
      orderBy: { key: 'asc' },
    });
  }

  async getAllTranslationsByLanguage(languageCode) {
    const language = await prisma.language.findUnique({
      where: { code: languageCode },
    });

    if (!language) {
      return [];
    }

    return await prisma.translation.findMany({
      where: { languageId: language.id },
      include: {
        namespace: true,
      },
      orderBy: [
        { namespace: { key: 'asc' } },
        { key: 'asc' },
      ],
    });
  }

  async getTranslationsGroupedByNamespace(languageCode) {
    const translations = await this.getAllTranslationsByLanguage(languageCode);

    const grouped = {};
    translations.forEach(t => {
      if (!grouped[t.namespace.key]) {
        grouped[t.namespace.key] = {};
      }
      grouped[t.namespace.key][t.key] = t.value;
    });

    return grouped;
  }

  async createTranslation(data) {
    return await prisma.translation.create({
      data,
    });
  }

  async updateTranslation(id, data) {
    return await prisma.translation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async upsertTranslation(namespaceKey, languageCode, key, value, userId = null) {
    const namespace = await prisma.translationNamespace.findUnique({
      where: { key: namespaceKey },
    });

    const language = await prisma.language.findUnique({
      where: { code: languageCode },
    });

    if (!namespace || !language) {
      throw new Error('Namespace or language not found');
    }

    return await prisma.translation.upsert({
      where: {
        unique_translation: {
          namespaceId: namespace.id,
          languageId: language.id,
          key,
        },
      },
      update: {
        value,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      create: {
        namespaceId: namespace.id,
        languageId: language.id,
        key,
        value,
        createdBy: userId,
      },
    });
  }

  async bulkUpsertTranslations(data) {
    const results = [];
    for (const item of data) {
      const result = await this.upsertTranslation(
        item.namespaceKey,
        item.languageCode,
        item.key,
        item.value,
        item.userId
      );
      results.push(result);
    }
    return results;
  }

  async deleteTranslation(id) {
    return await prisma.translation.delete({
      where: { id },
    });
  }

  async getMissingTranslations(languageCode) {
    const language = await prisma.language.findUnique({
      where: { code: languageCode },
    });

    if (!language) {
      return [];
    }

    const defaultLanguage = await prisma.language.findFirst({
      where: { isDefault: true },
    });

    if (!defaultLanguage) {
      return [];
    }

    const defaultTranslations = await prisma.translation.findMany({
      where: { languageId: defaultLanguage.id },
      include: { namespace: true },
    });

    const targetTranslations = await prisma.translation.findMany({
      where: { languageId: language.id },
    });

    const targetKeys = new Set(
      targetTranslations.map(t => `${t.namespaceId}:${t.key}`)
    );

    return defaultTranslations.filter(
      t => !targetKeys.has(`${t.namespaceId}:${t.key}`)
    );
  }

  // ==================== EXPORT/IMPORT ====================

  async exportTranslationsToJSON(languageCode) {
    const grouped = await this.getTranslationsGroupedByNamespace(languageCode);
    return grouped;
  }

  async importTranslationsFromJSON(languageCode, jsonData, userId = null) {
    const results = [];

    for (const [namespaceKey, translations] of Object.entries(jsonData)) {
      for (const [key, value] of Object.entries(translations)) {
        const result = await this.upsertTranslation(
          namespaceKey,
          languageCode,
          key,
          value,
          userId
        );
        results.push(result);
      }
    }

    return results;
  }

  // Helper function to unflatten dot notation back to nested objects
  unflattenObject(obj) {
    const result = {};

    // Sort keys by length to process shorter paths first
    // This ensures parent keys are processed before nested keys
    const sortedEntries = Object.entries(obj).sort((a, b) => a[0].length - b[0].length);

    for (const [key, value] of sortedEntries) {
      const keys = key.split('.');
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];

        // If current[k] exists and is NOT an object (it's a string/primitive),
        // we have a conflict. Convert it to an object with a special '_value' key
        if (current[k] !== undefined && typeof current[k] !== 'object') {
          const existingValue = current[k];
          current[k] = { _value: existingValue };
          console.warn(`[unflattenObject] Conflict detected: "${key}" - converted parent to object with _value`);
        } else if (!current[k]) {
          current[k] = {};
        }

        current = current[k];
      }

      // Set the final value
      const lastKey = keys[keys.length - 1];

      // If the target already exists as an object, we need to preserve it
      // and add this value as _value
      if (current[lastKey] !== undefined && typeof current[lastKey] === 'object') {
        current[lastKey]._value = value;
        console.warn(`[unflattenObject] Conflict detected: "${key}" already has nested properties - added as _value`);
      } else {
        current[lastKey] = value;
      }
    }

    return result;
  }

  // ==================== SYNC WITH FILES ====================

  async syncToFiles(frontendPath = '../../../frontend/public/locales') {
    try {
      const languages = await this.getActiveLanguages();

      // Resolve the absolute path
      const resolvedPath = path.resolve(__dirname, frontendPath);
      console.log(`[syncToFiles] Resolved path: ${resolvedPath}`);

      let totalSynced = 0;

      for (const language of languages) {
        const grouped = await this.getTranslationsGroupedByNamespace(language.code);

        const languageDir = path.join(resolvedPath, language.code);

        // Create directory if it doesn't exist
        await fs.mkdir(languageDir, { recursive: true });
        console.log(`[syncToFiles] Created/verified directory: ${languageDir}`);

        for (const [namespace, translations] of Object.entries(grouped)) {
          // Unflatten the translations back to nested structure
          const unflattened = this.unflattenObject(translations);

          const filePath = path.join(languageDir, `${namespace}.json`);
          await fs.writeFile(filePath, JSON.stringify(unflattened, null, 2), 'utf-8');
          totalSynced++;
          console.log(`[syncToFiles] Wrote ${language.code}/${namespace}.json`);
        }
      }

      const message = `Synced ${totalSynced} files for ${languages.length} languages to ${resolvedPath}`;
      console.log(`[syncToFiles] ${message}`);

      return {
        success: true,
        message,
        totalFiles: totalSynced,
        totalLanguages: languages.length,
        path: resolvedPath,
      };
    } catch (error) {
      console.error('[syncToFiles] Error:', error);
      throw new Error(`Failed to sync to files: ${error.message}`);
    }
  }

  // Helper function to flatten nested objects into dot notation
  flattenObject(obj, prefix = '') {
    const flattened = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        // Convert arrays and primitives to string
        flattened[newKey] = typeof value === 'string' ? value : JSON.stringify(value);
      }
    }

    return flattened;
  }

  async syncFromFiles(frontendPath = '../../../frontend/public/locales') {
    const localesDir = path.resolve(__dirname, frontendPath);

    try {
      const languageDirs = await fs.readdir(localesDir);
      let totalImported = 0;

      for (const languageCode of languageDirs) {
        const languageDir = path.join(localesDir, languageCode);
        const stat = await fs.stat(languageDir);

        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(languageDir);

        for (const file of files) {
          if (!file.endsWith('.json')) continue;

          const namespaceKey = file.replace('.json', '');
          const filePath = path.join(languageDir, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const translations = JSON.parse(content);

          // Flatten nested translations
          const flattenedTranslations = this.flattenObject(translations);

          for (const [key, value] of Object.entries(flattenedTranslations)) {
            await this.upsertTranslation(namespaceKey, languageCode, key, value);
            totalImported++;
          }
        }
      }

      return {
        success: true,
        message: `Imported ${totalImported} translations`,
      };
    } catch (error) {
      throw new Error(`Failed to sync from files: ${error.message}`);
    }
  }

  // ==================== STATISTICS ====================

  async getStatistics() {
    const languages = await this.getAllLanguages();
    const namespaces = await this.getAllNamespaces();
    const totalTranslations = await prisma.translation.count();

    const stats = {
      languages: languages.length,
      activeLanguages: languages.filter(l => l.isActive).length,
      namespaces: namespaces.length,
      totalTranslations,
      byLanguage: {},
      byNamespace: {},
      coverage: {},
    };

    for (const language of languages) {
      const count = await prisma.translation.count({
        where: { languageId: language.id },
      });
      stats.byLanguage[language.code] = count;
    }

    for (const namespace of namespaces) {
      stats.byNamespace[namespace.key] = namespace._count.translations;
    }

    const defaultLanguage = languages.find(l => l.isDefault);
    if (defaultLanguage) {
      const defaultCount = stats.byLanguage[defaultLanguage.code];

      for (const language of languages) {
        if (language.code !== defaultLanguage.code) {
          const count = stats.byLanguage[language.code];
          stats.coverage[language.code] = defaultCount > 0
            ? Math.round((count / defaultCount) * 100)
            : 0;
        }
      }
    }

    return stats;
  }
}

module.exports = new TranslationService();
