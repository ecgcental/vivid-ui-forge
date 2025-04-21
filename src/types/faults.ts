import { type ClassValue } from "clsx";
import { LoadMonitoringData } from "./asset-types";

export type UserRole = "district_engineer" | "regional_engineer" | "global_engineer" | "technician" | "system_admin" | null;

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  district?: string;
  tempPassword?: string;
  mustChangePassword?: boolean;
  password?: string;
  staffId?: string;
  disabled?: boolean;
};

export type RegionPopulation = {
  rural: number;
  urban: number;
  metro: number;
};

export type Region = {
  id: string;
  name: string;
  code: string;
  districts?: District[];
};

export type District = {
  id: string;
  regionId: string;
  name: string;
  population: RegionPopulation;
};

export type FaultType = "Planned" | "Unplanned" | "Emergency" | "Load Shedding" | "GridCo Outages";

export type GridCoOutageType =
  | "TRANSMISSION LINE FAULT"
  | "SUBSTATION EQUIPMENT FAILURE"
  | "PLANNED MAINTENANCE"
  | "SYSTEM DISTURBANCE"
  | "GENERATION SHORTFALL"
  | "TRANSMISSION CONSTRAINT"
  | "PROTECTION SYSTEM OPERATION"
  | "WEATHER RELATED"
  | "THIRD PARTY DAMAGE"
  | "OTHER";

export type UnplannedFaultType = 
  | "JUMPER CUT"
  | "CONDUCTOR CUT"
  | "MERGED CONDUCTOR"
  | "HV/LV LINE CONTACT"
  | "VEGETATION"
  | "CABLE FAULT"
  | "TERMINATION FAILURE"
  | "BROKEN POLES"
  | "BURNT POLE"
  | "FAULTY ARRESTER/INSULATOR"
  | "EQIPMENT FAILURE"
  | "PUNCTURED CABLE"
  | "ANIMAL INTERRUPTION"
  | "BAD WEATHER"
  | "TRANSIENT FAULTS";

export type EmergencyFaultType =
  | "MEND CABLE"
  | "WORK ON EQUIPMENT"
  | "FIRE"
  | "IMPROVE HV"
  | "JUMPER REPLACEMENT"
  | "MEND BROKEN"
  | "MEND JUMPER"
  | "MEND TERMINATION"
  | "BROKEN POLE"
  | "BURNT POLE"
  | "ANIMAL CONTACT"
  | "VEGETATION SAFETY"
  | "TRANSFER/RESTORE"
  | "TROUBLE SHOOTING"
  | "MEND LOOSE"
  | "MAINTENANCE"
  | "REPLACE FUSE";

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

export interface OP5Fault {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  restorationDate: string | null;
  repairDate: string | null;
  status: "active" | "resolved";
  faultType: FaultType;
  specificFaultType: string;
  faultLocation: string;
  outageDescription?: string;
  affectedPopulation: AffectedPopulation;
  mttr: number;
  reliabilityIndices: ReliabilityIndices;
  materialsUsed?: MaterialUsed[];
  createdAt: string;
  createdBy: string;
}

export type ControlSystemOutage = {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  restorationDate: string;
  faultType: FaultType;
  specificFaultType?: UnplannedFaultType | EmergencyFaultType;
  status: "active" | "resolved";
  reason?: string;
  controlPanelIndications?: string;
  areaAffected?: string;
  loadMW: number;
  unservedEnergyMWh: number;
  customersAffected: RegionPopulation;
  createdBy: string;
  createdAt: string;
}

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
  region: string;
  district: string;
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
  substationName?: string;
  type: 'indoor' | 'outdoor';
  items: InspectionItem[];
  createdAt?: string;
  createdBy?: string;
  inspectionDate: string;
  inspectedBy: string;
  location?: string;
  voltageLevel?: string;
  status?: string;
  cleanDustFree?: string;
  protectionButtonEnabled?: string;
  recloserButtonEnabled?: string;
  groundEarthButtonEnabled?: string;
  acPowerOn?: string;
  batteryPowerLow?: string;
  handleLockOn?: string;
  remoteButtonEnabled?: string;
  gasLevelLow?: string;
  earthingArrangementAdequate?: string;
  noFusesBlown?: string;
  noDamageToBushings?: string;
  noDamageToHVConnections?: string;
  insulatorsClean?: string;
  paintworkAdequate?: string;
  ptFuseLinkIntact?: string;
  noCorrosion?: string;
  silicaGelCondition?: string;
  correctLabelling?: string;
  remarks?: string;
  generalBuilding: InspectionItem[];
  controlEquipment: InspectionItem[];
  powerTransformer: InspectionItem[];
  outdoorEquipment: InspectionItem[];
}

export type Inspection = VITInspectionChecklist | SubstationInspection;

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
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
  regions: Region[];
  districts: District[];
  vitAssets: VITAsset[];
  vitInspections: VITInspectionChecklist[];
  savedInspections?: SubstationInspection[];
  loadMonitoringRecords?: LoadMonitoringData[];
  setOP5Faults: (faults: OP5Fault[]) => void;
  setControlOutages: (outages: ControlSystemOutage[]) => void;
  setRegions: (regions: Region[]) => void;
  setDistricts: (districts: District[]) => void;
  setVITAssets: (assets: VITAsset[]) => void;
  setVITInspections: (inspections: VITInspectionChecklist[]) => void;
  setSavedInspections: (inspections: SubstationInspection[]) => void;
  setLoadMonitoringRecords: (records: LoadMonitoringData[]) => void;
  resolveFault: (id: string, isOP5: boolean) => void;
  deleteFault: (id: string, isOP5: boolean) => void;
  updateOP5Fault: (id: string, data: Partial<OP5Fault>) => void;
  updateControlOutage: (id: string, data: Partial<ControlSystemOutage>) => void;
  canEditFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
  canEditOutage: (outage: ControlSystemOutage) => boolean;
  canEditAsset: (asset: VITAsset) => boolean;
  canEditInspection: (inspection: VITInspectionChecklist | SubstationInspection) => boolean;
  canDeleteFault: (fault: OP5Fault) => boolean;
  canDeleteOutage: (outage: ControlSystemOutage) => boolean;
  canDeleteAsset: (asset: VITAsset) => boolean;
  canDeleteInspection: (inspection: VITInspectionChecklist | SubstationInspection) => boolean;
  canResolveFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
  canAddAsset: (regionId: string, districtId: string) => boolean;
  canAddInspection: (assetId?: string, region?: string, district?: string) => boolean;
  addOP5Fault: (fault: Omit<OP5Fault, "id" | "status">) => void;
  deleteOP5Fault: (id: string) => void;
  addControlOutage: (outage: Omit<ControlSystemOutage, "id" | "status">) => void;
  deleteControlOutage: (id: string) => void;
  getFilteredFaults: (regionId?: string, districtId?: string) => { op5Faults: OP5Fault[]; controlOutages: ControlSystemOutage[] };
  addVITAsset: (asset: Omit<VITAsset, "id" | "createdAt" | "updatedAt">) => void;
  updateVITAsset: (id: string, updates: Partial<VITAsset>) => void;
  deleteVITAsset: (id: string) => void;
  addVITInspection: (inspection: Omit<VITInspectionChecklist, "id">) => void;
  updateVITInspection: (id: string, inspection: Partial<VITInspectionChecklist>) => void;
  deleteVITInspection: (id: string) => void;
  updateDistrict: (id: string, updates: Partial<District>) => void;
  saveInspection: (data: Omit<SubstationInspection, "id">) => string;
  getSavedInspection: (id: string) => SubstationInspection | undefined;
  updateSubstationInspection: (id: string, data: Partial<SubstationInspection>) => void;
  deleteInspection: (id: string) => void;
  saveLoadMonitoringRecord: (data: Omit<LoadMonitoringData, "id">) => string;
  getLoadMonitoringRecord: (id: string) => LoadMonitoringData | undefined;
  updateLoadMonitoringRecord: (id: string, data: Partial<LoadMonitoringData>) => void;
  deleteLoadMonitoringRecord: (id: string) => void;
}

// Exported for use elsewhere
export interface ReliabilityIndices {
  saidi: number;
  saifi: number;
  caidi: number;
}

// Exported for use elsewhere
export interface AffectedPopulation {
  rural: number;
  urban: number;
  metro: number;
}

// Type for materials used
export interface MaterialUsed {
  id: string; // Use UUID for unique key in lists
  type: 'Fuse' | 'Conductor' | 'Others' | string;
  rating?: string;      // For Fuse
  quantity?: number;    // For Fuse and Others
  conductorType?: string; // For Conductor
  length?: number;      // For Conductor (e.g., in meters)
  description?: string; // For Others
}

export type PoleHeight = "8m" | "9m" | "10m" | "11m" | "14m" | "others";

export type PoleType = "CP" | "WP" | "SP" | "ST"; // CP - Concrete, WP - Wood, SP - Steel Tubular, ST - Steel Tower

export interface OverheadLineInspection {
  id: string;
  createdAt: string;
  updatedAt: string;
  date?: string;
  time?: string;
  regionId: string;
  districtId: string;
  feederName: string;
  voltageLevel: string;
  referencePole: string;
  latitude: number;
  longitude: number;
  status: "pending" | "in-progress" | "completed" | "rejected";
  inspector: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  // Pole Information
  poleId: string;
  poleHeight: "8m" | "9m" | "10m" | "11m" | "14m" | "others";
  poleType: "CP" | "WP" | "SP" | "ST";
  poleLocation: string;
  
  // Head Gears Information
  poleCondition: {
    tilted: boolean;
    rotten: boolean;
    burnt: boolean;
    substandard: boolean;
    conflictWithLV: boolean;
    notes: string;
  };
  
  stayCondition: {
    requiredButNotAvailable: boolean;
    cut: boolean;
    misaligned: boolean;
    defectiveStay: boolean;
    notes: string;
  };
  
  crossArmCondition: {
    misaligned: boolean;
    bend: boolean;
    corroded: boolean;
    substandard: boolean;
    others: boolean;
    notes: string;
  };
  
  insulatorCondition: {
    brokenOrCracked: boolean;
    burntOrFlashOver: boolean;
    shattered: boolean;
    defectiveBinding: boolean;
    notes: string;
  };
  
  conductorCondition: {
    looseConnectors: boolean;
    weakJumpers: boolean;
    burntLugs: boolean;
    saggedLine: boolean;
    undersized: boolean;
    linked: boolean;
    notes: string;
  };
  
  lightningArresterCondition: {
    brokenOrCracked: boolean;
    flashOver: boolean;
    missing: boolean;
    noEarthing: boolean;
    bypassed: boolean;
    noArrester: boolean;
    notes: string;
  };
  
  dropOutFuseCondition: {
    brokenOrCracked: boolean;
    flashOver: boolean;
    insufficientClearance: boolean;
    looseOrNoEarthing: boolean;
    corroded: boolean;
    linkedHVFuses: boolean;
    others: boolean;
    notes: string;
  };
  
  transformerCondition: {
    leakingOil: boolean;
    missingEarthLeads: boolean;
    linkedHVFuses: boolean;
    rustedTank: boolean;
    crackedBushing: boolean;
    others: boolean;
    notes: string;
  };
  
  recloserCondition: {
    lowGasLevel: boolean;
    lowBatteryLevel: boolean;
    burntVoltageTransformers: boolean;
    protectionDisabled: boolean;
    bypassed: boolean;
    others: boolean;
    notes: string;
  };
  
  additionalNotes: string;
  images: string[];
}
