
import React from 'react';
import { useFormContext } from '@/hooks/useOP5Form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReliabilityIndicesSection() {
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
      <h3 className="text-lg font-medium">Reliability Indices</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="saidi">SAIDI</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="saidi"
              type="number"
              min="0"
              step="0.01"
              value={saidi || 0}
              onChange={(e) => setSaidi(parseFloat(e.target.value) || 0)}
              placeholder="Enter SAIDI value"
            />
            <span className="text-sm text-muted-foreground">hrs/cust</span>
          </div>
          <p className="text-xs text-muted-foreground">System Average Interruption Duration Index</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="saifi">SAIFI</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="saifi"
              type="number"
              min="0"
              step="0.01"
              value={saifi || 0}
              onChange={(e) => setSaifi(parseFloat(e.target.value) || 0)}
              placeholder="Enter SAIFI value"
            />
            <span className="text-sm text-muted-foreground">int/cust</span>
          </div>
          <p className="text-xs text-muted-foreground">System Average Interruption Frequency Index</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="caidi">CAIDI</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="caidi"
              type="number"
              min="0"
              step="0.01"
              value={caidi || 0}
              onChange={(e) => setCaidi(parseFloat(e.target.value) || 0)}
              placeholder="Enter CAIDI value"
            />
            <span className="text-sm text-muted-foreground">hrs/int</span>
          </div>
          <p className="text-xs text-muted-foreground">Customer Average Interruption Duration Index</p>
        </div>
      </div>
    </div>
  );
}
