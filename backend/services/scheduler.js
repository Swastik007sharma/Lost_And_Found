const cron = require('node-cron');
const {
  markInactiveItemsForDeletion,
  deleteScheduledItems,
  sendItemDeletionWarnings,
  markInactiveUsersForDeletion,
  sendUserDeletionWarnings,
  deleteScheduledUsers,
} = require('./cleanupService');

/**
 * Start the cleanup scheduler
 * Runs daily at 1:00 AM - Send warning emails for items
 * Runs daily at 2:00 AM - Mark inactive items for deletion
 * Runs daily at 3:00 AM - Delete scheduled items after grace period
 * Runs daily at 4:00 AM - Mark inactive users for deletion
 * Runs daily at 5:00 AM - Send warning emails for users
 * Runs daily at 6:00 AM - Delete scheduled users after grace period
 */
function startScheduler() {
  try {
    // Send item deletion warnings - Daily at 1:00 AM
    cron.schedule('0 1 * * *', async () => {
      console.log('\n🕒 [SCHEDULER] Running: Send item deletion warning emails');
      try {
        const results = await sendItemDeletionWarnings();
        const successCount = results.filter((r) => r.emailSent).length;
        console.log(`✅ [SCHEDULER] Sent ${successCount} item deletion warning emails\n`);
      } catch (error) {
        console.error('❌ [SCHEDULER] Error sending item warnings:', error);
      }
    });

    // Mark inactive items - Daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('\n🕒 [SCHEDULER] Running: Mark inactive items for deletion');
      try {
        const results = await markInactiveItemsForDeletion();
        console.log(`✅ [SCHEDULER] Marked ${results.length} items for deletion\n`);
      } catch (error) {
        console.error('❌ [SCHEDULER] Error marking items for deletion:', error);
      }
    });

    // Delete scheduled items - Daily at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
      console.log('\n🕒 [SCHEDULER] Running: Delete scheduled items');
      try {
        const results = await deleteScheduledItems();
        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;
        console.log(
          `✅ [SCHEDULER] Deleted ${successCount} items (${failCount} failed)\n`
        );
      } catch (error) {
        console.error('❌ [SCHEDULER] Error deleting scheduled items:', error);
      }
    });

    // Mark inactive users - Daily at 4:00 AM
    cron.schedule('0 4 * * *', async () => {
      console.log('\n🕒 [SCHEDULER] Running: Mark inactive users for deletion');
      try {
        const results = await markInactiveUsersForDeletion();
        console.log(`✅ [SCHEDULER] Marked ${results.length} users for deletion\n`);
      } catch (error) {
        console.error('❌ [SCHEDULER] Error marking users for deletion:', error);
      }
    });

    // Send user deletion warnings - Daily at 5:00 AM
    cron.schedule('0 5 * * *', async () => {
      console.log('\n🕒 [SCHEDULER] Running: Send user deletion warning emails');
      try {
        const results = await sendUserDeletionWarnings();
        const successCount = results.filter((r) => r.emailSent).length;
        console.log(`✅ [SCHEDULER] Sent ${successCount} user deletion warning emails\n`);
      } catch (error) {
        console.error('❌ [SCHEDULER] Error sending user warnings:', error);
      }
    });

    // Delete scheduled users - Daily at 6:00 AM
    cron.schedule('0 6 * * *', async () => {
      console.log('\n🕒 [SCHEDULER] Running: Delete scheduled users');
      try {
        const results = await deleteScheduledUsers();
        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;
        console.log(
          `✅ [SCHEDULER] Deleted ${successCount} users (${failCount} failed)\n`
        );
      } catch (error) {
        console.error('❌ [SCHEDULER] Error deleting scheduled users:', error);
      }
    });

    console.log('📅 [SCHEDULER] Cleanup scheduler started successfully');
    console.log('   - 1:00 AM: Send item deletion warnings');
    console.log('   - 2:00 AM: Mark inactive items for deletion');
    console.log('   - 3:00 AM: Delete scheduled items');
    console.log('   - 4:00 AM: Mark inactive users for deletion');
    console.log('   - 5:00 AM: Send user deletion warnings');
    console.log('   - 6:00 AM: Delete scheduled users');
  } catch (error) {
    console.error('❌ [SCHEDULER] Failed to start scheduler:', error);
    throw error;
  }
}

module.exports = { startScheduler };
