import { getPendingSyncItems, clearPendingSyncItem } from './db';

let isOnline = navigator.onLine;
let syncInProgress = false;

// Listen for online/offline events
window.addEventListener('online', () => {
  isOnline = true;
  syncPendingChanges();
});

window.addEventListener('offline', () => {
  isOnline = false;
});

export async function syncPendingChanges() {
  if (!isOnline || syncInProgress) return;

  syncInProgress = true;
  try {
    const pendingItems = await getPendingSyncItems();
    
    for (const item of pendingItems) {
      try {
        // Here you would implement your actual API calls
        // For example:
        // await api[item.type][item.action](item.data);
        
        // After successful sync, remove from pending
        await clearPendingSyncItem(item.timestamp);
      } catch (error) {
        console.error(`Failed to sync ${item.type} ${item.action}:`, error);
        // Keep the item in pending sync for retry later
      }
    }
  } finally {
    syncInProgress = false;
  }
}

// Start periodic sync when online
setInterval(() => {
  if (isOnline) {
    syncPendingChanges();
  }
}, 30000); // Check every 30 seconds

export function isAppOnline() {
  return isOnline;
} 