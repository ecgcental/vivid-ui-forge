import React, { createContext, useContext, useState, useEffect } from "react";
import { RegionData, DistrictData, OP5Fault, ControlSystemOutage, FaultType, User } from "@/lib/types";
import { SubstationInspectionData, InspectionItem, ConditionStatus, VITInspectionData, VITItem } from "@/lib/asset-types";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

interface DataContextType {
  regions: RegionData[];
  districts: DistrictData[];
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
  loading: boolean;
  savedInspections: SubstationInspectionData[];
  savedVITInspections: VITInspectionData[];
  addOP5Fault: (fault: Omit<OP5Fault, "id" | "createdBy" | "createdAt" | "status">) => void;
  addControlOutage: (outage: Omit<ControlSystemOutage, "id" | "createdBy" | "createdAt" | "status">) => void;
  updateDistrict: (districtId: string, data: Partial<DistrictData>) => void;
  getFilteredFaults: (regionId?: string, districtId?: string) => {
    op5Faults: OP5Fault[];
    controlOutages: ControlSystemOutage[];
  };
  resolveFault: (id: string, type: "op5" | "control") => void;
  deleteFault: (id: string, type: "op5" | "control") => void;
  canEditFault: (fault: OP5Fault | ControlSystemOutage) => boolean;
  editFault: (id: string, type: "op5" | "control", data: Partial<OP5Fault | ControlSystemOutage>) => void;
  
  // Substation inspection methods
  saveInspection: (inspection: Omit<SubstationInspectionData, "id" | "createdAt" | "createdBy">) => void;
  updateInspection: (id: string, data: Partial<SubstationInspectionData>) => void;
  deleteInspection: (id: string) => void;
  getSavedInspection: (id: string) => SubstationInspectionData | undefined;
  
  // VIT inspection methods
  saveVITInspection: (inspection: Omit<VITInspectionData, "id" | "createdAt" | "createdBy">) => void;
  updateVITInspection: (id: string, data: Partial<VITInspectionData>) => void;
  deleteVITInspection: (id: string) => void;
  getSavedVITInspection: (id: string) => VITInspectionData | undefined;
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
  const [savedInspections, setSavedInspections] = useState<SubstationInspectionData[]>([]);
  const [savedVITInspections, setSavedVITInspections] = useState<VITInspectionData[]>([]);
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
    
    // Generate some sample inspections
    const sampleInspections = generateSampleInspections(regions);
    setSavedInspections(sampleInspections);

    // Generate sample VIT inspections
    const sampleVITInspections = generateSampleVITInspections(regions);
    setSavedVITInspections(sampleVITInspections);
    
    setLoading(false);
  }, []);

  // Generate sample inspections
  const generateSampleInspections = (regions: RegionData[]): SubstationInspectionData[] => {
    const inspections: SubstationInspectionData[] = [];
    
    for (let i = 0; i < 5; i++) {
      const regionIndex = Math.floor(Math.random() * regions.length);
      const region = regions[regionIndex];
      const districtIndex = Math.floor(Math.random() * region.districts.length);
      const district = region.districts[districtIndex];
      
      const types: ('indoor' | 'outdoor')[] = ['indoor', 'outdoor'];
      const categories = ['general', 'control', 'transformer', 'outdoor'];
      
      const items: InspectionItem[] = [];
      
      // Generate 30 random items
      for (let j = 0; j < 30; j++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const status: ConditionStatus = Math.random() > 0.8 ? 'bad' : 'good';
        
        items.push({
          id: `item-${i}-${j}`,
          category,
          name: `${category.charAt(0).toUpperCase() + category.slice(1)} Item ${j + 1}`,
          status,
          remarks: status === 'bad' ? `Issue found with ${category} item ${j + 1}` : ''
        });
      }
      
      inspections.push({
        id: `inspection-${i + 1}`,
        region: region.name,
        district: district.name,
        date: randomDate(),
        substationNo: `SUB-${1000 + i}`,
        substationName: `${region.name} Substation ${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        items,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }
    
    return inspections;
  };

  // Generate sample VIT inspections
  const generateSampleVITInspections = (regions: RegionData[]): VITInspectionData[] => {
    const inspections: VITInspectionData[] = [];
    const voltageLevels: ('11KV' | '33KV')[] = ['11KV', '33KV'];
    const units = ['RMU', 'Switchgear', 'Recloser', 'Autorecloser'];
    const statuses = ['Operational', 'Under Maintenance', 'Faulty'];
    const protections = ['Overcurrent', 'Earth Fault', 'Hybrid'];
    
    for (let i = 0; i < 5; i++) {
      const regionIndex = Math.floor(Math.random() * regions.length);
      const region = regions[regionIndex];
      const districtIndex = Math.floor(Math.random() * region.districts.length);
      const district = region.districts[districtIndex];
      
      const items: VITItem[] = [
        { id: `vit-item-${i}-1`, name: "Rodent/termite encroachments of cubicle", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-2`, name: "Clean and dust free compartments", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-3`, name: "Is protection button enabled", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-4`, name: "Is recloser button enabled", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-5`, name: "Is GROUND/EARTH button enabled", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-6`, name: "Is AC power ON/OFF", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-7`, name: "Is Battery Power Low", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-8`, name: "Is Handle Luck ON", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-9`, name: "Is remote button enabled", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-10`, name: "Is Gas Level Low?", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-11`, name: "Earthling arrangement adequate", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-12`, name: "No fuses blown in control cubicle", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-13`, name: "No damage to bushings or insulators any cub, equipment", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-14`, name: "No damage to H.V.connections i.e., unraveling strands, caging of conductors heating", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-15`, name: "Insulators clean", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-16`, name: "Paintwork adequate", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-17`, name: "PT fuse link intact", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-18`, name: "No corrosion on equipment", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" },
        { id: `vit-item-${i}-19`, name: "Condition of silica gel", status: Math.random() > 0.5 ? 'good' : 'bad', remarks: "" },
        { id: `vit-item-${i}-20`, name: "Check for correct labelling and warning notices", status: Math.random() > 0.5 ? 'yes' : 'no', remarks: "" }
      ];
      
      inspections.push({
        id: `vit-inspection-${i + 1}`,
        region: region.name,
        district: district.name,
        date: randomDate(),
        voltageLevel: voltageLevels[Math.floor(Math.random() * voltageLevels.length)],
        typeOfUnit: units[Math.floor(Math.random() * units.length)],
        serialNumber: `SN-${10000 + Math.floor(Math.random() * 90000)}`,
        location: `${district.name} Area ${i + 1}`,
        gpsLocation: `${5 + Math.random() * 5}°N, ${-1 - Math.random() * 2}°W`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        protection: protections[Math.floor(Math.random() * protections.length)],
        items,
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      });
    }
    
    return inspections;
  };

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

  const canEditFault = (fault: OP5Fault | ControlSystemOutage): boolean => {
    if (!user) return false;
    
    // Check if the fault belongs to the user's district/region
    const district = districts.find(d => d.id === fault.districtId);
    const region = regions.find(r => r.id === fault.regionId);
    
    // District engineers can only edit faults in their district
    if (user.role === "district_engineer") {
      return user.district === district?.name;
    }
    
    // Regional engineers can edit faults in their region
    if (user.role === "regional_engineer") {
      return user.region === region?.name;
    }
    
    // Global engineers can edit faults anywhere
    return user.role === "global_engineer";
  };

  const deleteFault = (id: string, type: "op5" | "control") => {
    if (type === "op5") {
      const faultToDelete = op5Faults.find(fault => fault.id === id);
      if (!faultToDelete) {
        toast.error("Fault not found");
        return;
      }
      
      // Check if user has permission to delete this fault
      if (canEditFault(faultToDelete)) {
        setOP5Faults(prev => prev.filter(fault => fault.id !== id));
        toast.success("Fault deleted successfully");
      } else {
        toast.error("You don't have permission to delete this fault");
      }
    } else {
      const outageToDelete = controlOutages.find(outage => outage.id === id);
      if (!outageToDelete) {
        toast.error("Outage not found");
        return;
      }
      
      // Check if user has permission to delete this outage
      if (canEditFault(outageToDelete)) {
        setControlOutages(prev => prev.filter(outage => outage.id !== id));
        toast.success("Outage deleted successfully");
      } else {
        toast.error("You don't have permission to delete this outage");
      }
    }
  };

  const editFault = (id: string, type: "op5" | "control", data: Partial<OP5Fault | ControlSystemOutage>) => {
    if (type === "op5") {
      const faultToEdit = op5Faults.find(fault => fault.id === id);
      if (!faultToEdit) {
        toast.error("Fault not found");
        return;
      }
      
      // Check if user has permission to edit this fault
      if (canEditFault(faultToEdit)) {
        setOP5Faults(prev => 
          prev.map(fault => 
            fault.id === id 
              ? { ...fault, ...data, lastUpdatedAt: new Date().toISOString() }
              : fault
          )
        );
        toast.success("Fault updated successfully");
      } else {
        toast.error("You don't have permission to edit this fault");
      }
    } else {
      const outageToEdit = controlOutages.find(outage => outage.id === id);
      if (!outageToEdit) {
        toast.error("Outage not found");
        return;
      }
      
      // Check if user has permission to edit this outage
      if (canEditFault(outageToEdit)) {
        setControlOutages(prev => 
          prev.map(outage => 
            outage.id === id 
              ? { ...outage, ...data, lastUpdatedAt: new Date().toISOString() }
              : outage
          )
        );
        toast.success("Outage updated successfully");
      } else {
        toast.error("You don't have permission to edit this outage");
      }
    }
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
    
    // If the user is a district engineer, restrict to their district
    if (user?.role === "district_engineer" && user.district) {
      const userDistrict = districts.find(d => d.name === user.district);
      if (userDistrict) {
        filteredOP5 = filteredOP5.filter(fault => fault.districtId === userDistrict.id);
        filteredControl = filteredControl.filter(outage => outage.districtId === userDistrict.id);
      }
    }
    
    // If the user is a regional engineer, restrict to their region
    if (user?.role === "regional_engineer" && user.region && !regionId) {
      const userRegion = regions.find(r => r.name === user.region);
      if (userRegion) {
        filteredOP5 = filteredOP5.filter(fault => fault.regionId === userRegion.id);
        filteredControl = filteredControl.filter(outage => outage.regionId === userRegion.id);
      }
    }
    
    return { op5Faults: filteredOP5, controlOutages: filteredControl };
  };

  const resolveFault = (id: string, type: "op5" | "control") => {
    if (type === "op5") {
      const faultToResolve = op5Faults.find(fault => fault.id === id);
      if (!faultToResolve) {
        toast.error("Fault not found");
        return;
      }
      
      // Check if user has permission to resolve this fault
      if (canEditFault(faultToResolve)) {
        setOP5Faults(prev => 
          prev.map(fault => 
            fault.id === id 
              ? { ...fault, status: "resolved", restorationDate: new Date().toISOString() }
              : fault
          )
        );
        toast.success("Fault marked as resolved!");
      } else {
        toast.error("You don't have permission to resolve this fault");
      }
    } else {
      const outageToResolve = controlOutages.find(outage => outage.id === id);
      if (!outageToResolve) {
        toast.error("Outage not found");
        return;
      }
      
      // Check if user has permission to resolve this outage
      if (canEditFault(outageToResolve)) {
        setControlOutages(prev => 
          prev.map(outage => 
            outage.id === id 
              ? { ...outage, status: "resolved", restorationDate: new Date().toISOString() }
              : outage
          )
        );
        toast.success("Outage marked as resolved!");
      } else {
        toast.error("You don't have permission to resolve this outage");
      }
    }
  };

  // Add a new inspection
  const saveInspection = (inspection: Omit<SubstationInspectionData, "id" | "createdAt" | "createdBy">) => {
    if (!user) return;
    
    const newInspection: SubstationInspectionData = {
      ...inspection,
      id: `inspection-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };
    
    setSavedInspections(prev => [...prev, newInspection]);
    toast.success("Inspection saved successfully!");
  };

  // Update an existing inspection
  const updateInspection = (id: string, data: Partial<SubstationInspectionData>) => {
    setSavedInspections(prev => 
      prev.map(inspection => 
        inspection.id === id 
          ? { ...inspection, ...data }
          : inspection
      )
    );
    
    toast.success("Inspection updated successfully!");
  };

  // Delete an inspection
  const deleteInspection = (id: string) => {
    setSavedInspections(prev => prev.filter(inspection => inspection.id !== id));
  };

  // Get a specific inspection by ID
  const getSavedInspection = (id: string) => {
    return savedInspections.find(inspection => inspection.id === id);
  };
  
  // VIT inspection methods
  const saveVITInspection = (inspection: Omit<VITInspectionData, "id" | "createdAt" | "createdBy">) => {
    if (!user) return;
    
    const newInspection: VITInspectionData = {
      ...inspection,
      id: `vit-inspection-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };
    
    setSavedVITInspections(prev => [...prev, newInspection]);
    toast.success("VIT inspection saved successfully!");
  };

  // Update an existing VIT inspection
  const updateVITInspection = (id: string, data: Partial<VITInspectionData>) => {
    setSavedVITInspections(prev => 
      prev.map(inspection => 
        inspection.id === id 
          ? { ...inspection, ...data }
          : inspection
      )
    );
    
    toast.success("VIT inspection updated successfully!");
  };

  // Delete a VIT inspection
  const deleteVITInspection = (id: string) => {
    setSavedVITInspections(prev => prev.filter(inspection => inspection.id !== id));
    toast.success("VIT inspection deleted successfully!");
  };

  // Get a specific VIT inspection by ID
  const getSavedVITInspection = (id: string) => {
    return savedVITInspections.find(inspection => inspection.id === id);
  };

  return (
    <DataContext.Provider
      value={{
        regions,
        districts,
        op5Faults,
        controlOutages,
        loading,
        savedInspections,
        savedVITInspections,
        addOP5Fault,
        addControlOutage,
        updateDistrict,
        getFilteredFaults,
        resolveFault,
        deleteFault,
        canEditFault,
        editFault,
        saveInspection,
        updateInspection,
        deleteInspection,
        getSavedInspection,
        saveVITInspection,
        updateVITInspection,
        deleteVITInspection,
        getSavedVITInspection
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
