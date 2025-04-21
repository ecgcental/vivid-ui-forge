
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FaultType, UnplannedFaultType, EmergencyFaultType } from '@/lib/types';
import { calculateDurationHours, calculateUnservedEnergy } from '@/utils/calculations';

interface ControlOutageFormContext {
  // Location
  regionId: string;
  setRegionId: (value: string) => void;
  districtId: string;
  setDistrictId: (value: string) => void;
  
  // Dates and Times
  occurrenceDate: string;
  setOccurrenceDate: (value: string) => void;
  restorationDate: string;
  setRestorationDate: (value: string) => void;
  
  // Fault Details
  faultType: FaultType;
  setFaultType: (value: FaultType) => void;
  specificFaultType: string;
  setSpecificFaultType: (value: string) => void;
  
  // Affected Population
  ruralAffected: number | null;
  setRuralAffected: (value: number | null) => void;
  urbanAffected: number | null;
  setUrbanAffected: (value: number | null) => void;
  metroAffected: number | null;
  setMetroAffected: (value: number | null) => void;
  
  // Additional Details
  reason: string;
  setReason: (value: string) => void;
  indications: string;
  setIndications: (value: string) => void;
  areaAffected: string;
  setAreaAffected: (value: string) => void;
  loadMW: number;
  setLoadMW: (value: number) => void;
  
  // Calculated Values
  durationHours: number | null;
  unservedEnergyMWh: number | null;
}

const ControlOutageFormContext = createContext<ControlOutageFormContext | undefined>(undefined);

export const ControlOutageFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Location state
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  
  // Dates and Times
  const [occurrenceDate, setOccurrenceDate] = useState("");
  const [restorationDate, setRestorationDate] = useState("");
  
  // Fault Details
  const [faultType, setFaultType] = useState<FaultType>("Unplanned");
  const [specificFaultType, setSpecificFaultType] = useState("");
  
  // Affected Population
  const [ruralAffected, setRuralAffected] = useState<number | null>(null);
  const [urbanAffected, setUrbanAffected] = useState<number | null>(null);
  const [metroAffected, setMetroAffected] = useState<number | null>(null);
  
  // Additional Details
  const [reason, setReason] = useState("");
  const [indications, setIndications] = useState("");
  const [areaAffected, setAreaAffected] = useState("");
  const [loadMW, setLoadMW] = useState(0);
  
  // Calculated Values
  const [durationHours, setDurationHours] = useState<number | null>(null);
  const [unservedEnergyMWh, setUnservedEnergyMWh] = useState<number | null>(null);
  
  // Calculate metrics when dates or load changes
  useEffect(() => {
    if (occurrenceDate && restorationDate && loadMW > 0) {
      const duration = calculateDurationHours(occurrenceDate, restorationDate);
      setDurationHours(duration);
      
      const unservedEnergy = calculateUnservedEnergy(loadMW, duration);
      setUnservedEnergyMWh(unservedEnergy);
    } else {
      setDurationHours(null);
      setUnservedEnergyMWh(null);
    }
  }, [occurrenceDate, restorationDate, loadMW]);

  const value = {
    regionId,
    setRegionId,
    districtId,
    setDistrictId,
    occurrenceDate,
    setOccurrenceDate,
    restorationDate,
    setRestorationDate,
    faultType,
    setFaultType,
    specificFaultType,
    setSpecificFaultType,
    ruralAffected,
    setRuralAffected,
    urbanAffected,
    setUrbanAffected,
    metroAffected,
    setMetroAffected,
    reason,
    setReason,
    indications,
    setIndications,
    areaAffected,
    setAreaAffected,
    loadMW,
    setLoadMW,
    durationHours,
    unservedEnergyMWh
  };

  return (
    <ControlOutageFormContext.Provider value={value}>
      {children}
    </ControlOutageFormContext.Provider>
  );
};

export const useFormContext = () => {
  const context = useContext(ControlOutageFormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a ControlOutageFormProvider');
  }
  return context;
};
