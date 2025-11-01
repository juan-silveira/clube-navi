const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translation.controller');

// ==================== LANGUAGES ====================
router.get('/languages', translationController.getAllLanguages);
router.get('/languages/active', translationController.getActiveLanguages);
router.post('/languages', translationController.createLanguage);
router.put('/languages/:id', translationController.updateLanguage);
router.delete('/languages/:id', translationController.deleteLanguage);
router.patch('/languages/:id/set-default', translationController.setDefaultLanguage);

// ==================== NAMESPACES ====================
router.get('/namespaces', translationController.getAllNamespaces);
router.post('/namespaces', translationController.createNamespace);
router.put('/namespaces/:id', translationController.updateNamespace);
router.delete('/namespaces/:id', translationController.deleteNamespace);

// ==================== TRANSLATIONS ====================
router.get('/:namespace/:language', translationController.getTranslationsByNamespaceAndLanguage);
router.get('/all/:language', translationController.getAllTranslationsByLanguage);
router.get('/grouped/:language', translationController.getTranslationsGrouped);
router.put('/:namespace/:language/:key', translationController.upsertTranslation);
router.post('/bulk', translationController.bulkUpsertTranslations);
router.delete('/translation/:id', translationController.deleteTranslation);
router.get('/missing/:language', translationController.getMissingTranslations);

// ==================== EXPORT/IMPORT ====================
router.get('/export/:language', translationController.exportTranslations);
router.post('/import/:language', translationController.importTranslations);

// ==================== SYNC ====================
router.post('/sync/to-files', translationController.syncToFiles);
router.post('/sync/from-files', translationController.syncFromFiles);

// ==================== STATISTICS ====================
router.get('/statistics', translationController.getStatistics);

module.exports = router;
