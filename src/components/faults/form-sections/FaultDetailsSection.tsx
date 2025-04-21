
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaultType } from '@/lib/types';
import { useFormContext } from '@/hooks/useOP5Form';

export const FaultDetailsSection = () => {
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
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Fault Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="faultType">Fault Type</Label>
          <Select 
            value={faultType} 
            onValueChange={(value) => setFaultType(value as FaultType)}
          >
            <SelectTrigger id="faultType" className="h-10">
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
          <Label htmlFor="faultLocation">Fault Location</Label>
          <Input
            id="faultLocation"
            value={faultLocation}
            onChange={(e) => setFaultLocation(e.target.value)}
            className="h-10"
            placeholder="Enter substation, feeder, or location"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Occurrence Date & Time</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !occurrenceDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {occurrenceDate ? format(new Date(occurrenceDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={occurrenceDate ? new Date(occurrenceDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const currentDate = new Date(occurrenceDate || new Date());
                      date.setHours(currentDate.getHours());
                      date.setMinutes(currentDate.getMinutes());
                      setOccurrenceDate(date.toISOString());
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={occurrenceDate ? format(new Date(occurrenceDate), "HH:mm") : ""}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const date = new Date(occurrenceDate || new Date());
                date.setHours(hours);
                date.setMinutes(minutes);
                setOccurrenceDate(date.toISOString());
              }}
              className="w-24 h-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Restoration Date & Time (if resolved)</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !restorationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {restorationDate ? format(new Date(restorationDate), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={restorationDate ? new Date(restorationDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const currentDate = new Date(restorationDate || new Date());
                      date.setHours(currentDate.getHours());
                      date.setMinutes(currentDate.getMinutes());
                      setRestorationDate(date.toISOString());
                    } else {
                      setRestorationDate(null);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={restorationDate ? format(new Date(restorationDate), "HH:mm") : ""}
              onChange={(e) => {
                const [hours, minutes] = e.target.value.split(':').map(Number);
                const date = new Date(restorationDate || new Date());
                date.setHours(hours);
                date.setMinutes(minutes);
                setRestorationDate(date.toISOString());
              }}
              className="w-24 h-10"
              disabled={!restorationDate}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="specificFaultType">Specific Fault Type</Label>
        <Textarea
          id="specificFaultType"
          value={specificFaultType}
          onChange={(e) => setSpecificFaultType(e.target.value)}
          placeholder="Enter detailed description of the fault type"
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
};
