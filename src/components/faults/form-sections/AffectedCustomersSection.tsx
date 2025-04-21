
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InfoIcon } from "lucide-react";
import { useFormContext } from '@/hooks/useControlOutageForm';

export const AffectedCustomersSection = () => {
  const { 
    ruralAffected, 
    setRuralAffected,
    urbanAffected,
    setUrbanAffected,
    metroAffected,
    setMetroAffected
  } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg border border-muted">
        <h4 className="font-medium mb-2">Enter Number of Customers Affected by this Outage</h4>
        <p className="text-sm text-muted-foreground">
          Please enter the number of customers affected in each population category. 
          At least one category must have affected customers to proceed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="ruralAffected" className="font-medium flex items-center text-sm">
            Rural Customers Affected *
            <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-muted-foreground" />
          </Label>
          <Input
            id="ruralAffected"
            type="number"
            min="0"
            value={ruralAffected === null ? "" : ruralAffected}
            onChange={(e) => setRuralAffected(e.target.value === "" ? null : parseInt(e.target.value))}
            className="bg-background/50 border-muted h-9 sm:h-10"
            required
            placeholder="Enter number of affected customers"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="urbanAffected" className="font-medium flex items-center text-sm">
            Urban Customers Affected *
            <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-muted-foreground" />
          </Label>
          <Input
            id="urbanAffected"
            type="number"
            min="0"
            value={urbanAffected === null ? "" : urbanAffected}
            onChange={(e) => setUrbanAffected(e.target.value === "" ? null : parseInt(e.target.value))}
            className="bg-background/50 border-muted h-9 sm:h-10"
            required
            placeholder="Enter number of affected customers"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="metroAffected" className="font-medium flex items-center text-sm">
            Metro Customers Affected *
            <InfoIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 text-muted-foreground" />
          </Label>
          <Input
            id="metroAffected"
            type="number"
            min="0"
            value={metroAffected === null ? "" : metroAffected}
            onChange={(e) => setMetroAffected(e.target.value === "" ? null : parseInt(e.target.value))}
            className="bg-background/50 border-muted h-9 sm:h-10"
            required
            placeholder="Enter number of affected customers"
          />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        * At least one population type must have affected customers
      </p>
    </div>
  );
};
