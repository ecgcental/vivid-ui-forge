
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InfoIcon } from "lucide-react";
import { useFormContext } from '@/hooks/useOP5Form';

export const ReliabilityIndicesSection = () => {
  const { 
    saidi, 
    setSaidi,
    saifi,
    setSaifi,
    caidi,
    setCaidi
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg border border-muted">
        <h4 className="font-medium mb-2">Reliability Indices</h4>
        <p className="text-sm text-muted-foreground">
          These indices help measure the reliability of the electrical system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="saidi" className="font-medium flex items-center text-sm">
            SAIDI Value
            <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-muted-foreground" />
          </Label>
          <Input
            id="saidi"
            type="number"
            min="0"
            step="0.01"
            value={saidi}
            onChange={(e) => setSaidi(parseFloat(e.target.value) || 0)}
            className="bg-background/50 border-muted h-9 sm:h-10"
            placeholder="System Average Interruption Duration Index"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="saifi" className="font-medium flex items-center text-sm">
            SAIFI Value
            <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-muted-foreground" />
          </Label>
          <Input
            id="saifi"
            type="number"
            min="0"
            step="0.01"
            value={saifi}
            onChange={(e) => setSaifi(parseFloat(e.target.value) || 0)}
            className="bg-background/50 border-muted h-9 sm:h-10"
            placeholder="System Average Interruption Frequency Index"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="caidi" className="font-medium flex items-center text-sm">
            CAIDI Value
            <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-muted-foreground" />
          </Label>
          <Input
            id="caidi"
            type="number"
            min="0"
            step="0.01"
            value={caidi}
            onChange={(e) => setCaidi(parseFloat(e.target.value) || 0)}
            className="bg-background/50 border-muted h-9 sm:h-10"
            placeholder="Customer Average Interruption Duration Index"
          />
        </div>
      </div>
    </div>
  );
};
