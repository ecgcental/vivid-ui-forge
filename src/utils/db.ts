
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

// For line 100 and similar places, convert the store name to the correct type
const storeName = store as StoreNames;

// Now we can use storeName instead of store in all IDB operations
