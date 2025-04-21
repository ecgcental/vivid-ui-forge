
import React from 'react';
import { useFormContext } from '@/hooks/useControlOutageForm';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FaultType } from '@/lib/types';

export function OutageDetailsSection() {
  const { 
    faultType, 
    setFaultType, 
    specificFaultType, 
    setSpecificFaultType,
    reason,
    setReason,
    occurrenceDate,
    setOccurrenceDate,
    restorationDate, 
    setRestorationDate,
    indications,
    setIndications,
    areaAffected,
    setAreaAffected,
    loadMW,
    setLoadMW,
    durationHours,
    unservedEnergyMWh
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Outage Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="faultType">Outage Type</Label>
          <Select 
            value={faultType} 
            onValueChange={(value: FaultType) => setFaultType(value)}
          >
            <SelectTrigger id="faultType">
              <SelectValue placeholder="Select outage type" />
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

        {faultType && (
          <div className="space-y-2">
            <Label htmlFor="specificFaultType">Specific Outage Type</Label>
            <Select 
              value={specificFaultType || ''} 
              onValueChange={(value) => setSpecificFaultType(value)}
            >
              <SelectTrigger id="specificFaultType">
                <SelectValue placeholder="Select specific outage type" />
              </SelectTrigger>
              <SelectContent>
                {faultType === 'GridCo Outages' && (
                  <>
                    <SelectItem value="TRANSMISSION LINE FAULT">Transmission Line Fault</SelectItem>
                    <SelectItem value="SUBSTATION EQUIPMENT FAILURE">Substation Equipment Failure</SelectItem>
                    <SelectItem value="PLANNED MAINTENANCE">Planned Maintenance</SelectItem>
                    <SelectItem value="SYSTEM DISTURBANCE">System Disturbance</SelectItem>
                  </>
                )}
                {faultType === 'Unplanned' && (
                  <>
                    <SelectItem value="JUMPER CUT">Jumper Cut</SelectItem>
                    <SelectItem value="CONDUCTOR CUT">Conductor Cut</SelectItem>
                    <SelectItem value="MERGED CONDUCTOR">Merged Conductor</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

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
          <Label htmlFor="restorationDate">Restoration Date & Time</Label>
          <Input
            id="restorationDate"
            type="datetime-local"
            value={restorationDate || ''}
            onChange={(e) => setRestorationDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Outage</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for outage"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="indications">Control Panel Indications</Label>
          <Textarea
            id="indications"
            value={indications}
            onChange={(e) => setIndications(e.target.value)}
            placeholder="Enter control panel indications"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="areaAffected">Area Affected</Label>
          <Input
            id="areaAffected"
            value={areaAffected}
            onChange={(e) => setAreaAffected(e.target.value)}
            placeholder="Area affected by outage"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="loadMW">Load (MW)</Label>
          <Input
            id="loadMW"
            type="number"
            min="0"
            step="0.1"
            value={loadMW || ''}
            onChange={(e) => setLoadMW(parseFloat(e.target.value) || 0)}
            placeholder="Enter load in MW"
          />
        </div>
      </div>

      {durationHours !== null && unservedEnergyMWh !== null && (
        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Outage Duration</p>
              <p className="text-lg">{durationHours.toFixed(2)} hours</p>
            </div>
            <div>
              <p className="text-sm font-medium">Unserved Energy</p>
              <p className="text-lg">{unservedEnergyMWh.toFixed(2)} MWh</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
