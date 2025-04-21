
// Fix the population property issue at line 116
// From: population: district.population ||
// To: population: (district as any).population || { rural: 10000, urban: 50000, metro: 200000 }

// Fix the missing properties when setting OP5Faults at line 269
// Add the missing properties repairDate, specificFaultType, mttr
setOP5Faults(mockOP5FaultsData.map(fault => ({
  id: fault.id,
  regionId: fault.regionId,
  districtId: fault.districtId,
  occurrenceDate: new Date().toISOString(),
  restorationDate: null,
  repairDate: null,
  faultType: fault.faultType as FaultType,
  specificFaultType: "",
  faultLocation: fault.substationNumber,
  status: "active",
  affectedPopulation: fault.affectedPopulation,
  mttr: 0,
  reliabilityIndices: fault.reliabilityIndices,
  createdBy: fault.createdBy,
  createdAt: fault.createdAt
})));
