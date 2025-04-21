
import { openDB } from 'idb';
import { storeNames } from '@/utils/db';

// Define database name
const DB_NAME = 'fault-master-db';
const DB_VERSION = 1;

/**
 * Initialize the IndexedDB database
 */
export const initDatabase = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create all stores if they don't exist
      storeNames.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    },
  });
};

/**
 * Get data from IndexedDB
 */
export const getDataFromIDB = async (storeName: string) => {
  try {
    const db = await initDatabase();
    return await db.getAll(storeName);
  } catch (error) {
    console.error(`Error getting data from ${storeName}:`, error);
    return null;
  }
};

/**
 * Sync data to IndexedDB
 */
export const syncDataToIDB = async (storeName: string, data: any[]) => {
  try {
    const db = await initDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    // Clear existing data
    await store.clear();
    
    // Add new data
    for (const item of data) {
      await store.add(item);
    }
    
    await tx.done;
    return true;
  } catch (error) {
    console.error(`Error syncing data to ${storeName}:`, error);
    return false;
  }
};

/**
 * Queue an item for syncing to the server later
 */
export const queueForSync = async (item: any) => {
  try {
    const db = await initDatabase();
    await db.add('pending-sync', item);
    return true;
  } catch (error) {
    console.error('Error queueing item for sync:', error);
    return false;
  }
};

/**
 * Process pending sync items
 */
export const processPendingSync = async () => {
  try {
    const db = await initDatabase();
    const items = await db.getAll('pending-sync');
    
    if (items.length === 0) {
      return true;
    }
    
    // Process items
    // Here you would implement actual server sync logic
    
    // For now, just clear the queue
    await db.clear('pending-sync');
    return true;
  } catch (error) {
    console.error('Error processing pending sync items:', error);
    return false;
  }
};
