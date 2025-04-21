
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";

export function LocationSection() {
  const { regions, districts } = useData();
  
  // Use a runtime check to determine which context to use
  const context = 
    typeof (window as any).__OP5_FORM_CONTEXT__ !== 'undefined'
      ? (window as any).__OP5_FORM_CONTEXT__
      : (window as any).__CONTROL_OUTAGE_FORM_CONTEXT__;
  
  const {
    regionId,
    setRegionId,
    districtId,
    setDistrictId
  } = context || {
    regionId: '',
    setRegionId: () => {},
    districtId: '',
    setDistrictId: () => {}
  };

  const filteredDistricts = districts.filter(d => d.regionId === regionId);

  // Reset district when region changes
  useEffect(() => {
    setDistrictId('');
  }, [regionId, setDistrictId]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="region">Region</Label>
          <Select 
            value={regionId} 
            onValueChange={setRegionId}
          >
            <SelectTrigger id="region">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Select 
            value={districtId} 
            onValueChange={setDistrictId}
            disabled={!regionId}
          >
            <SelectTrigger id="district">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {filteredDistricts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
