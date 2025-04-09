
export interface FeederLeg {
  id: string;
  redPhaseCurrent: number;
  yellowPhaseCurrent: number;
  bluePhaseCurrent: number;
  neutralCurrent: number;
}

export interface LoadMonitoringData {
  date: string;
  time: string;
  region: string;
  district: string;
  
  // Substation Information
  substationName: string;
  substationNumber: string;
  location: string;
  rating: number;
  peakLoadStatus: 'day' | 'night';
  
  // Feeder Information
  feederLegs: FeederLeg[];
  
  // Load Information (calculated values)
  ratedLoad: number;
  redPhaseBulkLoad: number;
  yellowPhaseBulkLoad: number;
  bluePhaseBulkLoad: number;
  averageCurrent: number;
  percentageLoad: number;
  tenPercentFullLoadNeutral: number;
  calculatedNeutral: number;
}

export type ConditionStatus = 'good' | 'bad';

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  status: ConditionStatus;
  remarks: string;
}

export interface SubstationInspectionData {
  region: string;
  district: string;
  date: string;
  substationNo: string;
  type: 'indoor' | 'outdoor';
  items: InspectionItem[];
}
