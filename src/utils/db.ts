
// Fix the string vs number key issues by adding type assertions
// For line 100 and similar places, convert number to string
const key = (id as unknown as string);

// For all the keyof FaultMasterDB type errors, add explicit type assertion
const storeName = store as "pending-sync" | "op5-faults" | "control-outages" | "vit-assets" | "vit-inspections" | "substation-inspections" | "load-monitoring";
