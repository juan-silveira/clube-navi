/**
 * Club Stats Sync Cron Job
 * Automatically syncs club statistics every X minutes
 */

const cron = require('node-cron');
const clubStatsSyncService = require('../services/club-stats-sync.service');

// Sync interval in minutes (default: 30 minutes)
const SYNC_INTERVAL_MINUTES = process.env.CLUB_STATS_SYNC_INTERVAL || 30;

/**
 * Initialize the cron job
 */
function initClubStatsSyncJob() {
  // Validate environment
  if (process.env.DISABLE_CLUB_STATS_SYNC === 'true') {
    console.log('⏸️  [Stats Sync Job] Disabled via environment variable');
    return;
  }

  // Convert minutes to cron format
  // Every X minutes: */X * * * *
  const cronExpression = `*/${SYNC_INTERVAL_MINUTES} * * * *`;

  console.log(`📅 [Stats Sync Job] Scheduling sync every ${SYNC_INTERVAL_MINUTES} minutes`);
  console.log(`📅 [Stats Sync Job] Cron expression: ${cronExpression}`);

  // Schedule the job
  const job = cron.schedule(cronExpression, async () => {
    console.log('\n⏰ [Stats Sync Job] Starting scheduled sync...');
    const startTime = Date.now();

    try {
      const results = await clubStatsSyncService.syncAllClubs();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ [Stats Sync Job] Completed in ${duration}s`);
      console.log(`   - Success: ${results.success.length} clubs`);
      console.log(`   - Failed: ${results.failed.length} clubs\n`);

    } catch (error) {
      console.error('❌ [Stats Sync Job] Error during sync:', error);
    }
  });

  // Run initial sync on startup (after 10 seconds)
  setTimeout(async () => {
    console.log('🚀 [Stats Sync Job] Running initial sync on startup...');
    try {
      await clubStatsSyncService.syncAllClubs();
    } catch (error) {
      console.error('❌ [Stats Sync Job] Error during initial sync:', error);
    }
  }, 10000);

  console.log('✅ [Stats Sync Job] Initialized successfully');

  return job;
}

/**
 * Run sync manually (for testing)
 */
async function runManualSync() {
  console.log('🔧 [Stats Sync Job] Running manual sync...');
  try {
    const results = await clubStatsSyncService.syncAllClubs();
    return results;
  } catch (error) {
    console.error('❌ [Stats Sync Job] Error during manual sync:', error);
    throw error;
  }
}

module.exports = {
  initClubStatsSyncJob,
  runManualSync
};
