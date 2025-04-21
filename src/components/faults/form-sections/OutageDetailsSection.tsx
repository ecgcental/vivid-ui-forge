
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFormContext } from '@/hooks/useControlOutageForm';
import { FaultType } from '@/lib/types';

export const OutageDetailsSection = () => {
  const { 
    occurrenceDate, 
    setOccurrenceDate,
    faultType,
    setFaultType,
    specificFaultType,
    setSpecificFaultType
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <Label htmlFor="occurrenceDate" className="text-base font-medium">
          Outage Occurrence Date & Time
        </Label>
        <Input
          id="occurrenceDate"
          type="datetime-local"
          value={occurrenceDate}
          onChange={(e) => setOccurrenceDate(e.target.value)}
          required
          className="h-12 text-base bg-background/50 border-muted"
        />
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="faultType" className="text-base font-medium">Type of Fault</Label>
        <Select value={faultType} onValueChange={(value) => setFaultType(value as FaultType)} required>
          <SelectTrigger className="h-12 text-base bg-background/50 border-muted">
            <SelectValue placeholder="Select fault type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Planned">Planned</SelectItem>
            <SelectItem value="Unplanned">Unplanned</SelectItem>
            <SelectItem value="Emergency">Emergency</SelectItem>
            <SelectItem value="Load Shedding">Load Shedding</SelectItem>
            <SelectItem value="GridCo Outages">GridCo Outages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(faultType === "Unplanned" || faultType === "Emergency") && (
        <div className="space-y-3 col-span-2">
          <Label htmlFor="specificFaultType" className="text-base font-medium">
            Specific Fault Type
          </Label>
          <Select 
            value={specificFaultType} 
            onValueChange={setSpecificFaultType}
            required
          >
            <SelectTrigger className="h-12 text-base bg-background/50 border-muted">
              <SelectValue placeholder="Select specific fault type" />
            </SelectTrigger>
            <SelectContent>
              {faultType === "Unplanned" ? (
                <>
                  <SelectItem value="JUMPER CUT">Jumper Cut</SelectItem>
                  <SelectItem value="CONDUCTOR CUT">Conductor Cut</SelectItem>
                  <SelectItem value="MERGED CONDUCTOR">Merged Conductor</SelectItem>
                  <SelectItem value="HV/LV LINE CONTACT">HV/LV Line Contact</SelectItem>
                  <SelectItem value="VEGETATION">Vegetation</SelectItem>
                  <SelectItem value="CABLE FAULT">Cable Fault</SelectItem>
                  <SelectItem value="TERMINATION FAILURE">Termination Failure</SelectItem>
                  <SelectItem value="BROKEN POLES">Broken Poles</SelectItem>
                  <SelectItem value="BURNT POLE">Burnt Pole</SelectItem>
                  <SelectItem value="FAULTY ARRESTER/INSULATOR">Faulty Arrester/Insulator</SelectItem>
                  <SelectItem value="EQIPMENT FAILURE">Equipment Failure</SelectItem>
                  <SelectItem value="PUNCTURED CABLE">Punctured Cable</SelectItem>
                  <SelectItem value="ANIMAL INTERRUPTION">Animal Interruption</SelectItem>
                  <SelectItem value="BAD WEATHER">Bad Weather</SelectItem>
                  <SelectItem value="TRANSIENT FAULTS">Transient Faults</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="MEND CABLE">Mend Cable</SelectItem>
                  <SelectItem value="WORK ON EQUIPMENT">Work on Equipment</SelectItem>
                  <SelectItem value="FIRE">Fire</SelectItem>
                  <SelectItem value="IMPROVE HV">Improve HV</SelectItem>
                  <SelectItem value="JUMPER REPLACEMENT">Jumper Replacement</SelectItem>
                  <SelectItem value="MEND BROKEN">Mend Broken</SelectItem>
                  <SelectItem value="MEND JUMPER">Mend Jumper</SelectItem>
                  <SelectItem value="MEND TERMINATION">Mend Termination</SelectItem>
                  <SelectItem value="BROKEN POLE">Broken Pole</SelectItem>
                  <SelectItem value="BURNT POLE">Burnt Pole</SelectItem>
                  <SelectItem value="ANIMAL CONTACT">Animal Contact</SelectItem>
                  <SelectItem value="VEGETATION SAFETY">Vegetation Safety</SelectItem>
                  <SelectItem value="TRANSFER/RESTORE">Transfer/Restore</SelectItem>
                  <SelectItem value="TROUBLE SHOOTING">Trouble Shooting</SelectItem>
                  <SelectItem value="MEND LOOSE">Mend Loose</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="REPLACE FUSE">Replace Fuse</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
