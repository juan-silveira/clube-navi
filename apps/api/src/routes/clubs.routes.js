/**
 * Clubs Routes
 * Routes for managing clubs (super admin only)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const clubsController = require('../controllers/clubs.controller');
const clubStatsSyncController = require('../controllers/club-stats-sync.controller');
const { authenticateSuperAdmin } = require('../middleware/authenticateSuperAdmin');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require super admin authentication
router.use(authenticateSuperAdmin);

// Dashboard stats (must come before :id routes)
router.get('/dashboard/stats', clubsController.getDashboardStats);

// Sync all clubs stats (must come before :id routes)
router.post('/sync-stats/all', clubStatsSyncController.syncAll);

// List clubs with pagination and filters
router.get('/', clubsController.list);

// Create complete club with database, branding, and admin (wizard)
router.post('/complete', upload.fields([
  { name: 'logoFile', maxCount: 1 },
  { name: 'iconFile', maxCount: 1 },
  { name: 'splashFile', maxCount: 1 }
]), clubsController.createComplete);

// Create new club (simple)
router.post('/', clubsController.create);

// Get clube by ID
router.get('/:id', clubsController.getById);

// Update club
router.put('/:id', clubsController.update);

// Get clube statistics
router.get('/:id/stats', clubsController.getStats);

// Toggle clube active/inactive status
router.patch('/:id/toggle-status', clubsController.toggleStatus);

// Update club branding
router.put('/:id/branding', clubsController.updateBranding);

// Upload branding asset
router.post('/:id/branding/upload', upload.single('file'), clubsController.uploadBrandingAsset);

// Sync club stats
router.post('/:id/sync-stats', clubStatsSyncController.syncClub);

// Get sync status
router.get('/:id/sync-stats/status', clubStatsSyncController.getSyncStatus);

module.exports = router;
