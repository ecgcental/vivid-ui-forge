
import React from 'react';
import { useFormContext } from '@/hooks/useOP5Form';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FaultType, UnplannedFaultType, EmergencyFaultType } from '@/lib/types';

export function FaultDetailsSection() {
  const { 
    faultType, 
    setFaultType, 
    specificFaultType, 
    setSpecificFaultType,
    faultLocation,
    setFaultLocation,
    occurrenceDate,
    setOccurrenceDate,
    restorationDate, 
    setRestorationDate
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Fault Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="faultType">Fault Type</Label>
          <Select 
            value={faultType} 
            onValueChange={(value: FaultType) => setFaultType(value)}
          >
            <SelectTrigger id="faultType">
              <SelectValue placeholder="Select fault type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Unplanned">Unplanned</SelectItem>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
              <SelectItem value="Load Shedding">Load Shedding</SelectItem>
              <SelectItem value="GridCo Outages">GridCo Outages</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specificFaultType">Specific Fault Type</Label>
          <Select 
            value={specificFaultType || ''} 
            onValueChange={(value) => setSpecificFaultType(value)}
            disabled={!faultType}
          >
            <SelectTrigger id="specificFaultType">
              <SelectValue placeholder="Select specific fault type" />
            </SelectTrigger>
            <SelectContent>
              {faultType === 'Unplanned' && (
                <>
                  <SelectItem value="JUMPER CUT">Jumper Cut</SelectItem>
                  <SelectItem value="CONDUCTOR CUT">Conductor Cut</SelectItem>
                  <SelectItem value="MERGED CONDUCTOR">Merged Conductor</SelectItem>
                  <SelectItem value="HV/LV LINE CONTACT">HV/LV Line Contact</SelectItem>
                  <SelectItem value="VEGETATION">Vegetation</SelectItem>
                </>
              )}
              {faultType === 'Emergency' && (
                <>
                  <SelectItem value="MEND CABLE">Mend Cable</SelectItem>
                  <SelectItem value="WORK ON EQUIPMENT">Work on Equipment</SelectItem>
                  <SelectItem value="FIRE">Fire</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="faultLocation">Fault Location</Label>
          <Input
            id="faultLocation"
            value={faultLocation}
            onChange={(e) => setFaultLocation(e.target.value)}
            placeholder="Enter location (e.g., SS-001, substation name)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occurrenceDate">Occurrence Date & Time</Label>
          <Input
            id="occurrenceDate"
            type="datetime-local"
            value={occurrenceDate}
            onChange={(e) => setOccurrenceDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restorationDate">Restoration Date & Time (if resolved)</Label>
          <Input
            id="restorationDate"
            type="datetime-local"
            value={restorationDate || ''}
            onChange={(e) => setRestorationDate(e.target.value || null)}
          />
        </div>
      </div>
    </div>
  );
}
