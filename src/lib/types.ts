
export type UserRole = "district_engineer" | "regional_engineer" | "global_engineer" | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  region?: string;
  district?: string;
}

export type RegionData = {
  id: string;
  name: string;
  districts: DistrictData[];
};

export type DistrictData = {
  id: string;
  name: string;
  regionId: string; // Added regionId field
  population: {
    rural: number;
    urban: number;
    metro: number;
  }
};

export type FaultType = "Planned" | "Unplanned" | "Emergency" | "Load Shedding";

export interface FaultBase {
  id: string;
  regionId: string;
  districtId: string;
  occurrenceDate: string;
  faultType: FaultType;
  restorationDate: string;
  createdBy: string;
  createdAt: string;
  status: "active" | "resolved";
}

export interface OP5Fault extends FaultBase {
  faultLocation: string;
  affectedPopulation: {
    rural: number;
    urban: number;
    metro: number;
  };
  outrageDuration?: number; // in minutes
  mttr?: number; // Mean Time To Repair in minutes
  reliabilityIndices?: {
    saidi?: number; // System Average Interruption Duration Index
    saifi?: number; // System Average Interruption Frequency Index
    caidi?: number; // Customer Average Interruption Duration Index
  };
}

export interface ControlSystemOutage extends FaultBase {
  customersAffected: {
    rural: number;
    urban: number;
    metro: number;
  };
  reason: string;
  controlPanelIndications: string;
  areaAffected: string;
  loadMW: number;
  unservedEnergyMWh?: number;
}

// Add StatsOverviewProps interface to fix the DashboardPage typing issue
export interface StatsOverviewProps {
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
}

// Add FilterBarProps interface to fix the FilterBar typing issue
export interface FilterBarProps {
  setFilterRegion: React.Dispatch<React.SetStateAction<string>>;
  setFilterDistrict: React.Dispatch<React.SetStateAction<string>>;
  setFilterStatus: React.Dispatch<React.SetStateAction<"active" | "resolved" | "all">>;
  filterStatus: "active" | "resolved" | "all";
  onRefresh: () => void;
  isRefreshing: boolean;
}
