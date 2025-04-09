
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

export type ConditionStatus = 'good' | 'bad' | 'unset';
export type YesNoStatus = 'yes' | 'no' | 'unset';
export type GoodBadStatus = 'good' | 'bad' | 'unset';

export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  status: ConditionStatus;
  remarks: string;
}

export interface SubstationInspectionData {
  id: string;
  region: string;
  district: string;
  date: string;
  substationNo: string;
  substationName?: string;
  type: 'indoor' | 'outdoor';
  items: InspectionItem[];
  createdAt: string;
  createdBy: string;
}

export interface VITItem {
  id: string;
  name: string;
  status: YesNoStatus | GoodBadStatus;
  remarks: string;
}

export interface VITInspectionData {
  id: string;
  region: string;
  district: string;
  date: string;
  voltageLevel: '11KV' | '33KV';
  typeOfUnit: string;
  serialNumber: string;
  location: string;
  gpsLocation: string;
  status: string;
  protection: string;
  photoUrl?: string;
  items: VITItem[];
  createdAt: string;
  createdBy: string;
}
