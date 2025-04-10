// Outage Duration Calculation (in minutes)
export const calculateOutageDuration = (occurrenceDate: string, restorationDate: string): number => {
  const start = new Date(occurrenceDate).getTime();
  const end = new Date(restorationDate).getTime();
  return Math.floor((end - start) / (1000 * 60)); // Convert milliseconds to minutes
};

// MTTR Calculation (Mean Time To Repair) in minutes
export const calculateMTTR = (outages: { occurrenceDate: string; restorationDate: string }[]): number => {
  if (outages.length === 0) return 0;
  
  const totalMinutes = outages.reduce((sum, outage) => {
    return sum + calculateOutageDuration(outage.occurrenceDate, outage.restorationDate);
  }, 0);
  
  return totalMinutes / outages.length;
};

// Calculate SAIDI (System Average Interruption Duration Index)
export const calculateSAIDI = (
  outages: { occurrenceDate: string; restorationDate: string; affectedCustomers: number }[],
  totalCustomers: number
): number => {
  if (outages.length === 0 || totalCustomers === 0) return 0;
  
  const totalCustomerMinutes = outages.reduce((sum, outage) => {
    const duration = calculateOutageDuration(outage.occurrenceDate, outage.restorationDate);
    return sum + (duration * outage.affectedCustomers);
  }, 0);
  
  return totalCustomerMinutes / totalCustomers;
};

// Calculate SAIFI (System Average Interruption Frequency Index)
export const calculateSAIFI = (
  outages: { affectedCustomers: number }[],
  totalCustomers: number
): number => {
  if (outages.length === 0 || totalCustomers === 0) return 0;
  
  const totalCustomerInterruptions = outages.reduce((sum, outage) => {
    return sum + outage.affectedCustomers;
  }, 0);
  
  return totalCustomerInterruptions / totalCustomers;
};

// Calculate CAIDI (Customer Average Interruption Duration Index) = SAIDI/SAIFI
export const calculateCAIDI = (saidi: number, saifi: number): number => {
  if (saifi === 0) return 0;
  return saidi / saifi;
};

// Calculate Unserved Energy (MWh)
export const calculateUnservedEnergy = (loadMW: number, durationHours: number): number => {
  return loadMW * durationHours;
};

// Calculate Duration in Hours from dates
export const calculateDurationHours = (occurrenceDate: string, restorationDate: string): number => {
  const start = new Date(occurrenceDate).getTime();
  const end = new Date(restorationDate).getTime();
  return (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
};

// Format a date object to a readable string
export const formatDate = (date: string | Date): string => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return date;
};

// Format duration in minutes to hours and minutes
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} minutes`;
  } else if (mins === 0) {
    return `${hours} hours`;
  } else {
    return `${hours} hours ${mins} minutes`;
  }
};
