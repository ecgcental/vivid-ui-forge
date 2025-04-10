import { type ClassValue } from "clsx";

export type UserRole = "district_engineer" | "regional_engineer" | "global_engineer" | null;

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  district?: string;
};

export type RegionPopulation = {
  rural: number;
  urban: number;
  metro: number;
};

export type Region = {
  id: string;
  name: string;
  districts: District[];
};

export type District = {
  id: string;
  regionId: string;
  name: string;
  population: RegionPopulation;
};

export type FaultType = "Planned" | "Unplanned" | "Emergency" | "Load Shedding";

export type StatsOverviewProps = {
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
};

export type FilterBarProps = {
  setFilterRegion: (regionId: string) => void;
  setFilterDistrict: (districtId: string) => void;
  setFilterStatus: (status: "all" | "active" | "resolved") => void;
  filterStatus: "all" | "active" | "resolved";
  onRefresh: () => void;
  isRefreshing: boolean;
};

export type OP5Fault = {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  restorationDate: string;
  faultType: FaultType;
  faultLocation: string;
  status: "active" | "resolved";
  outrageDuration?: number; // in minutes
  mttr?: number; // Mean Time To Repair (in minutes)
  affectedPopulation: RegionPopulation;
  reliabilityIndices?: {
    saidi: number; // System Average Interruption Duration Index
    saifi: number; // System Average Interruption Frequency Index
    caidi: number; // Customer Average Interruption Duration Index
  };
  createdBy: string;
  createdAt: string;
};

export type ControlSystemOutage = {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  restorationDate: string;
  faultType: FaultType;
  status: "active" | "resolved";
  reason?: string;
  controlPanelIndications?: string;
  areaAffected?: string;
  loadMW: number;
  unservedEnergyMWh: number;
  customersAffected: RegionPopulation;
  createdBy: string;
  createdAt: string;
};

// VIT Asset Types
export type VoltageLevel = "11KV" | "33KV";

export type VITStatus = "Operational" | "Under Maintenance" | "Faulty" | "Decommissioned";

export type YesNoOption = "Yes" | "No";

export type GoodBadOption = "Good" | "Bad";

export type ConditionStatus = "good" | "bad";

export type VITAsset = {
  id: string;
  regionId: string;
  districtId: string;
  voltageLevel: VoltageLevel;
  typeOfUnit: string;
  serialNumber: string;
  location: string;
  gpsCoordinates: string;
  status: VITStatus;
  protection: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export type VITInspectionChecklist = {
  id: string;
  vitAssetId: string;
  inspectionDate: string;
  inspectedBy: string;
  rodentTermiteEncroachment: YesNoOption;
  cleanDustFree: YesNoOption;
  protectionButtonEnabled: YesNoOption;
  recloserButtonEnabled: YesNoOption;
  groundEarthButtonEnabled: YesNoOption;
  acPowerOn: YesNoOption;
  batteryPowerLow: YesNoOption;
  handleLockOn: YesNoOption;
  remoteButtonEnabled: YesNoOption;
  gasLevelLow: YesNoOption;
  earthingArrangementAdequate: YesNoOption;
  noFusesBlown: YesNoOption;
  noDamageToBushings: YesNoOption;
  noDamageToHVConnections: YesNoOption;
  insulatorsClean: YesNoOption;
  paintworkAdequate: YesNoOption;
  ptFuseLinkIntact: YesNoOption;
  noCorrosion: YesNoOption;
  silicaGelCondition: GoodBadOption;
  correctLabelling: YesNoOption;
  remarks: string;
  createdBy: string;
  createdAt: string;
};

// Updated to match with asset-types
export interface InspectionItem {
  id: string;
  category: string;
  name: string;
  status: ConditionStatus;
  remarks?: string;
}

export interface InspectionCategory {
  category: string;
  items: InspectionItem[];
}

export interface SubstationInspection {
  id: string;
  region: string;
  district: string;
  date: string;
  substationNo: string;
  type: 'indoor' | 'outdoor';
  items: InspectionCategory[];
  createdAt?: string;
  createdBy?: string;
}

export interface AuthContextType {
  user: {
    name: string;
    email: string;
    role: UserRole;
    region?: string;
    district?: string;
  } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole, region?: string, district?: string) => Promise<void>;
  logout: () => void;
}

export interface DataContextType {
  regions: Region[];
  districts: District[];
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
  vitAssets: VITAsset[];
  vitInspections: VITInspectionChecklist[];
  savedInspections?: SubstationInspection[];
  addOP5Fault: (fault: Omit<OP5Fault, "id" | "status">) => void;
  addControlOutage: (outage: Omit<ControlSystemOutage, "id" | "status">) => void;
  resolveFault: (id: string, type: "op5" | "control") => void;
  deleteFault: (id: string, type: "op5" | "control") => void;
  getFilteredFaults?: (regionId?: string, districtId?: string) => { op5Faults: OP5Fault[], controlOutages: ControlSystemOutage[] };
  canEditFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
  addVITAsset: (asset: Omit<VITAsset, "id" | "createdAt" | "updatedAt">) => void;
  updateVITAsset: (id: string, asset: Partial<VITAsset>) => void;
  deleteVITAsset: (id: string) => void;
  addVITInspection: (inspection: Omit<VITInspectionChecklist, "id">) => void;
  updateVITInspection: (id: string, inspection: Partial<VITInspectionChecklist>) => void;
  deleteVITInspection: (id: string) => void;
  updateDistrict?: (id: string, updates: Partial<District>) => void;
  getSavedInspection?: (id: string) => SubstationInspection | undefined;
  updateInspection?: (id: string, data: Partial<SubstationInspection>) => void;
  saveInspection?: (data: Omit<SubstationInspection, "id">) => string;
  deleteInspection?: (id: string) => void;
}
