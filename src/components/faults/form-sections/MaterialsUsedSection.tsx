
import React, { useState } from 'react';
import { useFormContext } from '@/hooks/useOP5Form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash, Plus } from "lucide-react";
import { Material } from '@/types/faults';
import { v4 as uuidv4 } from 'uuid';

export function MaterialsUsedSection() {
  const { materials, addMaterial, removeMaterial } = useFormContext();
  const [materialType, setMaterialType] = useState<string>('');
  const [rating, setRating] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [conductorType, setConductorType] = useState<string>('');
  const [length, setLength] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleAddMaterial = () => {
    if (!materialType) return;

    const newMaterial: Material = {
      id: uuidv4(),
      type: materialType,
      ...(materialType === 'Fuse' && { rating }),
      ...(materialType === 'Fuse' && { quantity: quantity ? parseInt(quantity) : undefined }),
      ...(materialType === 'Conductor' && { conductorType }),
      ...(materialType === 'Conductor' && { length: length ? parseFloat(length) : undefined }),
      ...(materialType === 'Others' && { description }),
      ...(materialType === 'Others' && { quantity: quantity ? parseInt(quantity) : undefined })
    };

    addMaterial(newMaterial);
    
    // Reset form
    setMaterialType('');
    setRating('');
    setQuantity('');
    setConductorType('');
    setLength('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Materials Used</h3>
      
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
              <SelectItem value="Others">Others</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {materialType === 'Fuse' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="rating">Fuse Rating</Label>
              <Input
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="Enter rating"
              />
            </div>
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
          </>
        )}
        
        {materialType === 'Conductor' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="conductorType">Conductor Type</Label>
              <Input
                id="conductorType"
                value={conductorType}
                onChange={(e) => setConductorType(e.target.value)}
                placeholder="Enter type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length (m)</Label>
              <Input
                id="length"
                type="number"
                min="0"
                step="0.1"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="Enter length"
              />
            </div>
          </>
        )}
        
        {materialType === 'Others' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherQuantity">Quantity</Label>
              <Input
                id="otherQuantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
          </>
        )}
      </div>
      
      <Button 
        type="button" 
        onClick={handleAddMaterial}
        disabled={!materialType}
        variant="outline"
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Material
      </Button>
      
      {materials.length > 0 && (
        <div className="space-y-2 mt-4">
          <h4 className="text-sm font-medium">Added Materials</h4>
          <div className="space-y-2">
            {materials.map((material, index) => (
              <div key={material.id} className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <span className="font-medium">{material.type}</span>
                  {material.type === 'Fuse' && (
                    <span className="ml-2 text-sm">
                      {material.rating && `${material.rating}A`}
                      {material.quantity && `, Qty: ${material.quantity}`}
                    </span>
                  )}
                  {material.type === 'Conductor' && (
                    <span className="ml-2 text-sm">
                      {material.conductorType}
                      {material.length && `, ${material.length}m`}
                    </span>
                  )}
                  {material.type === 'Others' && (
                    <span className="ml-2 text-sm">
                      {material.description}
                      {material.quantity && `, Qty: ${material.quantity}`}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMaterial(index)}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
