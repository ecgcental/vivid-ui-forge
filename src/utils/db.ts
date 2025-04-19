import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FaultMasterDB extends DBSchema {
  'op5-faults': {
    key: string;
    value: any;
    indexes: { 'by-date': string };
  };
  'control-outages': {
    key: string;
    value: any;
    indexes: { 'by-date': string };
  };
  'vit-assets': {
    key: string;
    value: any;
    indexes: { 'by-region': string };
  };
  'vit-inspections': {
    key: string;
    value: any;
    indexes: { 'by-asset': string };
  };
  'substation-inspections': {
    key: string;
    value: any;
    indexes: { 'by-date': string };
  };
  'load-monitoring': {
    key: string;
    value: any;
    indexes: { 'by-date': string };
  };
  'pending-sync': {
    key: string;
    value: {
      type: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
}

let db: IDBPDatabase<FaultMasterDB> | null = null;

export async function initDB() {
  if (!db) {
    db = await openDB<FaultMasterDB>('faultmaster-db', 1, {
      upgrade(db) {
        // OP5 Faults
        const op5FaultsStore = db.createObjectStore('op5-faults', { keyPath: 'id' });
        op5FaultsStore.createIndex('by-date', 'occurrenceDate');

        // Control Outages
        const controlOutagesStore = db.createObjectStore('control-outages', { keyPath: 'id' });
        controlOutagesStore.createIndex('by-date', 'occurrenceDate');

        // VIT Assets
        const vitAssetsStore = db.createObjectStore('vit-assets', { keyPath: 'id' });
        vitAssetsStore.createIndex('by-region', 'regionId');

        // VIT Inspections
        const vitInspectionsStore = db.createObjectStore('vit-inspections', { keyPath: 'id' });
        vitInspectionsStore.createIndex('by-asset', 'vitAssetId');

        // Substation Inspections
        const substationInspectionsStore = db.createObjectStore('substation-inspections', { keyPath: 'id' });
        substationInspectionsStore.createIndex('by-date', 'date');

        // Load Monitoring
        const loadMonitoringStore = db.createObjectStore('load-monitoring', { keyPath: 'id' });
        loadMonitoringStore.createIndex('by-date', 'date');

        // Pending Sync
        db.createObjectStore('pending-sync', { keyPath: 'timestamp' });
      },
    });
  }
  return db;
}

export async function addToPendingSync(type: string, action: 'create' | 'update' | 'delete', data: any) {
  const db = await initDB();
  await db.add('pending-sync', {
    type,
    action,
    data,
    timestamp: Date.now(),
  });
}

export async function getPendingSyncItems() {
  const db = await initDB();
  return db.getAll('pending-sync');
}

export async function clearPendingSyncItem(timestamp: number) {
  const db = await initDB();
  await db.delete('pending-sync', timestamp);
}

// Generic CRUD operations for each store
export async function addItem(storeName: keyof FaultMasterDB, item: any) {
  const db = await initDB();
  await db.add(storeName, item);
  await addToPendingSync(storeName, 'create', item);
}

export async function updateItem(storeName: keyof FaultMasterDB, item: any) {
  const db = await initDB();
  await db.put(storeName, item);
  await addToPendingSync(storeName, 'update', item);
}

export async function deleteItem(storeName: keyof FaultMasterDB, id: string) {
  const db = await initDB();
  await db.delete(storeName, id);
  await addToPendingSync(storeName, 'delete', { id });
}

export async function getAllItems(storeName: keyof FaultMasterDB) {
  const db = await initDB();
  return db.getAll(storeName);
}

export async function getItem(storeName: keyof FaultMasterDB, id: string) {
  const db = await initDB();
  return db.get(storeName, id);
} 