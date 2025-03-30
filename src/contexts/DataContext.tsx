import React, { createContext, useContext, useState, useEffect } from "react";
import { RegionData, DistrictData, OP5Fault, ControlSystemOutage, FaultType, User } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

interface DataContextType {
  regions: RegionData[];
  districts: DistrictData[];
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
  loading: boolean;
  addOP5Fault: (fault: Omit<OP5Fault, "id" | "createdBy" | "createdAt" | "status">) => void;
  addControlOutage: (outage: Omit<ControlSystemOutage, "id" | "createdBy" | "createdAt" | "status">) => void;
  updateDistrict: (districtId: string, data: Partial<DistrictData>) => void;
  getFilteredFaults: (regionId?: string, districtId?: string) => {
    op5Faults: OP5Fault[];
    controlOutages: ControlSystemOutage[];
  };
  resolveFault: (id: string, type: "op5" | "control") => void;
}

// Mock data with regionId added to each district
const MOCK_REGIONS: RegionData[] = [
  {
    id: "1",
    name: "Greater Accra",
    districts: [
      {
        id: "1",
        name: "Accra Metro",
        regionId: "1", // Added regionId
        population: {
          rural: 25000,
          urban: 180000,
          metro: 950000
        }
      },
      {
        id: "2",
        name: "Tema",
        regionId: "1", // Added regionId
        population: {
          rural: 18000,
          urban: 120000,
          metro: 480000
        }
      }
    ]
  },
  {
    id: "2",
    name: "Ashanti",
    districts: [
      {
        id: "3",
        name: "Kumasi Metro",
        regionId: "2", // Added regionId
        population: {
          rural: 45000,
          urban: 220000,
          metro: 820000
        }
      },
      {
        id: "4",
        name: "Obuasi",
        regionId: "2", // Added regionId
        population: {
          rural: 35000,
          urban: 85000,
          metro: 0
        }
      }
    ]
  },
  {
    id: "3",
    name: "Western",
    districts: [
      {
        id: "5",
        name: "Sekondi-Takoradi",
        regionId: "3", // Added regionId
        population: {
          rural: 32000,
          urban: 105000,
          metro: 380000
        }
      },
      {
        id: "6",
        name: "Tarkwa",
        regionId: "3", // Added regionId
        population: {
          rural: 42000,
          urban: 78000,
          metro: 0
        }
      }
    ]
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to generate random date in the past 30 days
const randomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Helper to generate random date after a given date
const randomDateAfter = (startDate: string, hoursLater: number = 24) => {
  const date = new Date(startDate);
  date.setHours(date.getHours() + Math.floor(Math.random() * hoursLater));
  return date.toISOString();
};

// Generate sample faults
const generateSampleOP5Faults = (): OP5Fault[] => {
  const faults: OP5Fault[] = [];
  const faultTypes: FaultType[] = ["Planned", "Unplanned", "Emergency", "Load Shedding"];
  const statuses: ("active" | "resolved")[] = ["active", "resolved"];
  const locations = ["Transformer T1", "Distribution Line D45", "Substation S12", "Feeder F23"];
  
  for (let i = 0; i < 15; i++) {
    const regionIndex = Math.floor(Math.random() * MOCK_REGIONS.length);
    const region = MOCK_REGIONS[regionIndex];
    const districtIndex = Math.floor(Math.random() * region.districts.length);
    const district = region.districts[districtIndex];
    
    const occurrenceDate = randomDate();
    const restorationDate = randomDateAfter(occurrenceDate);
    const duration = Math.floor((new Date(restorationDate).getTime() - new Date(occurrenceDate).getTime()) / (1000 * 60));
    
    faults.push({
      id: `op5-${i+1}`,
      regionId: region.id,
      districtId: district.id,
      occurrenceDate,
      faultType: faultTypes[Math.floor(Math.random() * faultTypes.length)],
      faultLocation: locations[Math.floor(Math.random() * locations.length)],
      restorationDate,
      affectedPopulation: {
        rural: Math.floor(Math.random() * district.population.rural * 0.5),
        urban: Math.floor(Math.random() * district.population.urban * 0.3),
        metro: Math.floor(Math.random() * (district.population.metro || 0) * 0.2)
      },
      createdBy: "system",
      createdAt: new Date().toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      outrageDuration: duration,
      mttr: duration * 0.8,
      reliabilityIndices: {
        saidi: Math.random() * 10,
        saifi: Math.random() * 5,
        caidi: Math.random() * 3
      }
    });
  }
  
  return faults;
};

const generateSampleControlOutages = (): ControlSystemOutage[] => {
  const outages: ControlSystemOutage[] = [];
  const faultTypes: FaultType[] = ["Planned", "Unplanned", "Emergency", "Load Shedding"];
  const statuses: ("active" | "resolved")[] = ["active", "resolved"];
  const reasons = [
    "System overload", 
    "Equipment failure", 
    "Scheduled maintenance", 
    "Weather-related damage"
  ];
  const indications = [
    "Red alarm on panel", 
    "System voltage drop", 
    "Circuit breaker trip", 
    "Communication failure"
  ];
  const areas = [
    "North sector", 
    "Industrial zone", 
    "Residential district", 
    "Commercial area"
  ];
  
  for (let i = 0; i < 15; i++) {
    const regionIndex = Math.floor(Math.random() * MOCK_REGIONS.length);
    const region = MOCK_REGIONS[regionIndex];
    const districtIndex = Math.floor(Math.random() * region.districts.length);
    const district = region.districts[districtIndex];
    
    const occurrenceDate = randomDate();
    const restorationDate = randomDateAfter(occurrenceDate);
    const loadMW = Math.floor(Math.random() * 120) + 10;
    const durationHours = (new Date(restorationDate).getTime() - new Date(occurrenceDate).getTime()) / (1000 * 60 * 60);
    
    outages.push({
      id: `control-${i+1}`,
      regionId: region.id,
      districtId: district.id,
      occurrenceDate,
      faultType: faultTypes[Math.floor(Math.random() * faultTypes.length)],
      restorationDate,
      customersAffected: {
        rural: Math.floor(Math.random() * district.population.rural * 0.5),
        urban: Math.floor(Math.random() * district.population.urban * 0.3),
        metro: Math.floor(Math.random() * (district.population.metro || 0) * 0.2)
      },
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      controlPanelIndications: indications[Math.floor(Math.random() * indications.length)],
      areaAffected: areas[Math.floor(Math.random() * areas.length)],
      loadMW,
      unservedEnergyMWh: loadMW * durationHours,
      createdBy: "system",
      createdAt: new Date().toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }
  
  return outages;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [regions, setRegions] = useState<RegionData[]>(MOCK_REGIONS);
  const [districts, setDistricts] = useState<DistrictData[]>([]);
  const [op5Faults, setOP5Faults] = useState<OP5Fault[]>([]);
  const [controlOutages, setControlOutages] = useState<ControlSystemOutage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Initialize data with regionId
    const allDistricts = regions.flatMap(region => 
      region.districts.map(district => ({
        ...district,
        regionId: region.id
      }))
    );
    setDistricts(allDistricts);
    
    // Load sample faults
    setOP5Faults(generateSampleOP5Faults());
    setControlOutages(generateSampleControlOutages());
    
    setLoading(false);
  }, []);

  const addOP5Fault = (fault: Omit<OP5Fault, "id" | "createdBy" | "createdAt" | "status">) => {
    if (!user) return;
    
    const newFault: OP5Fault = {
      ...fault,
      id: `op5-${Date.now()}`,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    
    setOP5Faults(prev => [...prev, newFault]);
    toast.success("OP5 fault reported successfully!");
  };

  const addControlOutage = (outage: Omit<ControlSystemOutage, "id" | "createdBy" | "createdAt" | "status">) => {
    if (!user) return;
    
    const newOutage: ControlSystemOutage = {
      ...outage,
      id: `control-${Date.now()}`,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      status: "active"
    };
    
    setControlOutages(prev => [...prev, newOutage]);
    toast.success("Control system outage reported successfully!");
  };

  const updateDistrict = (districtId: string, data: Partial<DistrictData>) => {
    setRegions(prev => 
      prev.map(region => ({
        ...region,
        districts: region.districts.map(district => 
          district.id === districtId 
            ? { ...district, ...data }
            : district
        )
      }))
    );
    
    setDistricts(prev => 
      prev.map(district => 
        district.id === districtId 
          ? { ...district, ...data }
          : district
      )
    );
    
    toast.success("District information updated successfully!");
  };

  const getFilteredFaults = (regionId?: string, districtId?: string) => {
    let filteredOP5 = op5Faults;
    let filteredControl = controlOutages;
    
    if (regionId) {
      filteredOP5 = filteredOP5.filter(fault => fault.regionId === regionId);
      filteredControl = filteredControl.filter(outage => outage.regionId === regionId);
    }
    
    if (districtId) {
      filteredOP5 = filteredOP5.filter(fault => fault.districtId === districtId);
      filteredControl = filteredControl.filter(outage => outage.districtId === districtId);
    }
    
    return { op5Faults: filteredOP5, controlOutages: filteredControl };
  };

  const resolveFault = (id: string, type: "op5" | "control") => {
    if (type === "op5") {
      setOP5Faults(prev => 
        prev.map(fault => 
          fault.id === id 
            ? { ...fault, status: "resolved", restorationDate: new Date().toISOString() }
            : fault
        )
      );
    } else {
      setControlOutages(prev => 
        prev.map(outage => 
          outage.id === id 
            ? { ...outage, status: "resolved", restorationDate: new Date().toISOString() }
            : outage
        )
      );
    }
    
    toast.success("Fault marked as resolved!");
  };

  return (
    <DataContext.Provider
      value={{
        regions,
        districts,
        op5Faults,
        controlOutages,
        loading,
        addOP5Fault,
        addControlOutage,
        updateDistrict,
        getFilteredFaults,
        resolveFault
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
