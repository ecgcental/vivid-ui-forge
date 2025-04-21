
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useFormContext } from '@/hooks/useOP5Form';
import { Material } from '@/types/faults';
import { Textarea } from '@/components/ui/textarea';

export const MaterialsUsedSection = () => {
  const { materials, addMaterial, removeMaterial } = useFormContext();
  const [materialType, setMaterialType] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [conductorType, setConductorType] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleAddMaterial = () => {
    if (!materialType) return;

    const newMaterial: Material = {
      type: materialType,
      rating: rating || undefined,
      conductorType: conductorType || undefined,
      quantity: quantity ? parseInt(quantity) : undefined,
      length: length ? parseInt(length) : undefined,
      description: description || undefined
    };
    
    addMaterial(newMaterial);
    
    // Reset form
    setMaterialType('');
    setRating('');
    setConductorType('');
    setQuantity('');
    setLength('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Materials Used</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="materialType">Material Type</Label>
            <Select 
              value={materialType} 
              onValueChange={setMaterialType}
            >
              <SelectTrigger id="materialType">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fuse">Fuse</SelectItem>
                <SelectItem value="Conductor">Conductor</SelectItem>
                <SelectItem value="Pole">Pole</SelectItem>
                <SelectItem value="Transformer">Transformer</SelectItem>
                <SelectItem value="Insulator">Insulator</SelectItem>
                <SelectItem value="Terminal">Terminal</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {materialType === 'Fuse' && (
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="Enter rating"
              />
            </div>
          )}
          
          {materialType === 'Conductor' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="conductorType">Conductor Type</Label>
                <Input
                  id="conductorType"
                  value={conductorType}
                  onChange={(e) => setConductorType(e.target.value)}
                  placeholder="E.g., AAC, ACSR, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length (m)</Label>
                <Input
                  id="length"
                  type="number"
                  min="0"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="Enter length in meters"
                />
              </div>
            </>
          )}
          
          {materialType && (
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          )}
          
          {materialType === 'Others' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter material description"
              />
            </div>
          )}
        </div>
        
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleAddMaterial}
          disabled={!materialType}
          className="mt-2"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>
      
      {materials.length > 0 && (
        <div className="border rounded-md">
          <h4 className="text-sm font-medium p-3 border-b bg-muted/50">Added Materials</h4>
          <div className="p-2">
            {materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                <div>
                  <span className="font-medium">{material.type}</span>
                  {material.rating && <span className="text-sm text-muted-foreground ml-2">Rating: {material.rating}</span>}
                  {material.conductorType && <span className="text-sm text-muted-foreground ml-2">{material.conductorType}</span>}
                  {material.quantity && <span className="text-sm text-muted-foreground ml-2">Qty: {material.quantity}</span>}
                  {material.length && <span className="text-sm text-muted-foreground ml-2">Length: {material.length}m</span>}
                  {material.description && <span className="text-sm text-muted-foreground ml-2">{material.description}</span>}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeMaterial(index)}
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
