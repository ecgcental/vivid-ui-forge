
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OP5Fault } from '@/lib/types';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/sonner';

interface OP5FaultFormProps {
  onSubmit: (formData: Partial<OP5Fault>) => void;
  initialData?: Partial<OP5Fault>;
}

const OP5FaultForm: React.FC<OP5FaultFormProps> = ({ onSubmit, initialData }) => {
  const { regions, districts } = useData();
  const [selectedRegion, setSelectedRegion] = React.useState(initialData?.regionId || '');
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<OP5Fault>>({
    defaultValues: initialData || {
      faultType: 'Unplanned',
      affectedPopulation: {
        rural: 0,
        urban: 0,
        metro: 0
      },
      reliabilityIndices: {
        saidi: 0,
        saifi: 0,
        caidi: 0
      },
      materialsUsed: []
    }
  });
  
  const filteredDistricts = districts.filter(d => d.regionId === selectedRegion);
  
  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setValue('regionId', regionId);
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
        
        {/* Basic fields for OP5Fault form */}
        <div className="space-y-2">
          <Label htmlFor="occurrenceDate">Occurrence Date</Label>
          <Input
            id="occurrenceDate"
            type="datetime-local"
            {...register('occurrenceDate', { required: true })}
          />
          {errors.occurrenceDate && <p className="text-red-500 text-sm">Occurrence date is required</p>}
        </div>
        
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
      
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default OP5FaultForm;
