
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Use the correct hook depending on which form is using this component
export function AffectedCustomersSection() {
  // We need to handle both form contexts, so we'll do a runtime check
  const context = 
    typeof (window as any).__OP5_FORM_CONTEXT__ !== 'undefined'
      ? (window as any).__OP5_FORM_CONTEXT__
      : (window as any).__CONTROL_OUTAGE_FORM_CONTEXT__;

  const {
    ruralAffected,
    setRuralAffected,
    urbanAffected,
    setUrbanAffected,
    metroAffected,
    setMetroAffected
  } = context || {
    ruralAffected: 0,
    setRuralAffected: () => {},
    urbanAffected: 0,
    setUrbanAffected: () => {},
    metroAffected: 0,
    setMetroAffected: () => {}
  };

  const totalAffected = 
    (ruralAffected || 0) + 
    (urbanAffected || 0) + 
    (metroAffected || 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Affected Customers</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ruralAffected">Rural Customers</Label>
          <Input
            id="ruralAffected"
            type="number"
            min="0"
            value={ruralAffected || ''}
            onChange={(e) => setRuralAffected(parseInt(e.target.value) || null)}
            placeholder="Number of rural customers"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="urbanAffected">Urban Customers</Label>
          <Input
            id="urbanAffected"
            type="number"
            min="0"
            value={urbanAffected || ''}
            onChange={(e) => setUrbanAffected(parseInt(e.target.value) || null)}
            placeholder="Number of urban customers"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="metroAffected">Metro Customers</Label>
          <Input
            id="metroAffected"
            type="number"
            min="0"
            value={metroAffected || ''}
            onChange={(e) => setMetroAffected(parseInt(e.target.value) || null)}
            placeholder="Number of metro customers"
          />
        </div>
      </div>
      
      <div className="p-3 bg-muted rounded-md">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Affected Customers:</span>
          <span className="text-lg font-semibold">{totalAffected.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
