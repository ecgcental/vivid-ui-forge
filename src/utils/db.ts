
// Fix the string vs number key issues by adding type assertions

// For all the keyof FaultMasterDB type errors, add explicit type assertion
const storeNames = [
  "pending-sync",
  "op5-faults",
  "control-outages",
  "vit-assets",
  "vit-inspections",
  "substation-inspections",
  "load-monitoring"
] as const;

type StoreNames = typeof storeNames[number];

// Type-safe database operations
export const getFromStore = async <T>(storeName: StoreNames): Promise<T[]> => {
  // Implementation details
  return [] as T[];
};

export const addToStore = async <T>(storeName: StoreNames, data: T): Promise<void> => {
  // Implementation details
};

export const updateInStore = async <T>(storeName: StoreNames, id: string, data: Partial<T>): Promise<void> => {
  // Implementation details
};

export const deleteFromStore = async (storeName: StoreNames, id: string): Promise<void> => {
  // Implementation details
};

export const clearStore = async (storeName: StoreNames): Promise<void> => {
  // Implementation details
};
