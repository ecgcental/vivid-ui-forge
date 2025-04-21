
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OP5Fault, FaultType } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/sonner';

interface OP5FaultFormProps {
  onSubmit: (formData: Partial<OP5Fault>) => void;
  initialData?: Partial<OP5Fault>;
}

const OP5FaultForm: React.FC<OP5FaultFormProps> = ({ onSubmit, initialData }) => {
  const { regions, districts } = useData();
  const [selectedRegion, setSelectedRegion] = useState(initialData?.regionId || '');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<OP5Fault>>({
    defaultValues: initialData || {
      faultType: 'Unplanned' as FaultType,
      affectedPopulation: {
        rural: 0,
        urban: 0,
        metro: 0
      },
      reliabilityIndices: {
        saidi: 0,
        saifi: 0,
        caidi: 0
      }
    }
  });
  
  const filteredDistricts = districts.filter(d => d.regionId === selectedRegion);
  
  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setValue('regionId', regionId);
    // Reset district when region changes
    setValue('districtId', '');
  };
  
  const handleFormSubmit = (data: Partial<OP5Fault>) => {
    try {
      onSubmit(data);
      toast.success("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again.");
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Region Selection */}
        <div className="space-y-2">
          <Label htmlFor="regionId">Region</Label>
          <Select 
            value={selectedRegion} 
            onValueChange={handleRegionChange}
          >
            <SelectTrigger id="regionId">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.regionId && <p className="text-red-500 text-sm">Region is required</p>}
        </div>
        
        {/* District Selection */}
        <div className="space-y-2">
          <Label htmlFor="districtId">District</Label>
          <Select 
            value={watch('districtId') || ''} 
            onValueChange={(value) => setValue('districtId', value)}
            disabled={!selectedRegion}
          >
            <SelectTrigger id="districtId">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {filteredDistricts.map(district => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.districtId && <p className="text-red-500 text-sm">District is required</p>}
        </div>
        
        {/* Fault Type */}
        <div className="space-y-2">
          <Label htmlFor="faultType">Fault Type</Label>
          <Select
            value={watch('faultType') || 'Unplanned'}
            onValueChange={(value) => setValue('faultType', value as FaultType)}
          >
            <SelectTrigger id="faultType">
              <SelectValue placeholder="Select Fault Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="Unplanned">Unplanned</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
              <SelectItem value="Load Shedding">Load Shedding</SelectItem>
              <SelectItem value="GridCo Outages">GridCo Outages</SelectItem>
            </SelectContent>
          </Select>
          {errors.faultType && <p className="text-red-500 text-sm">Fault type is required</p>}
        </div>
        
        {/* Specific Fault Type */}
        <div className="space-y-2">
          <Label htmlFor="specificFaultType">Specific Fault Type</Label>
          <Input
            id="specificFaultType"
            placeholder="E.g., JUMPER CUT, CONDUCTOR CUT"
            {...register('specificFaultType')}
          />
        </div>
        
        {/* Occurrence Date */}
        <div className="space-y-2">
          <Label htmlFor="occurrenceDate">Occurrence Date</Label>
          <Input
            id="occurrenceDate"
            type="datetime-local"
            {...register('occurrenceDate', { required: true })}
          />
          {errors.occurrenceDate && <p className="text-red-500 text-sm">Occurrence date is required</p>}
        </div>
        
        {/* Restoration Date (optional) */}
        <div className="space-y-2">
          <Label htmlFor="restorationDate">Restoration Date (if resolved)</Label>
          <Input
            id="restorationDate"
            type="datetime-local"
            {...register('restorationDate')}
          />
        </div>
        
        {/* Repair Date (optional) */}
        <div className="space-y-2">
          <Label htmlFor="repairDate">Repair Date (if applicable)</Label>
          <Input
            id="repairDate"
            type="datetime-local"
            {...register('repairDate')}
          />
        </div>
        
        {/* Fault Location */}
        <div className="space-y-2">
          <Label htmlFor="faultLocation">Fault Location</Label>
          <Input
            id="faultLocation"
            placeholder="E.g., SS-001, SUBSTATION A"
            {...register('faultLocation', { required: true })}
          />
          {errors.faultLocation && <p className="text-red-500 text-sm">Fault location is required</p>}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Affected Population</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ruralPopulation">Rural</Label>
            <Input
              id="ruralPopulation"
              type="number"
              {...register('affectedPopulation.rural', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="urbanPopulation">Urban</Label>
            <Input
              id="urbanPopulation"
              type="number"
              {...register('affectedPopulation.urban', { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="metroPopulation">Metro</Label>
            <Input
              id="metroPopulation"
              type="number"
              {...register('affectedPopulation.metro', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>
      
      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="outageDescription">Outage Description</Label>
        <textarea
          id="outageDescription"
          className="w-full h-24 p-2 border rounded-md"
          placeholder="Enter detailed description of the fault..."
          {...register('outageDescription')}
        />
      </div>
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default OP5FaultForm;
