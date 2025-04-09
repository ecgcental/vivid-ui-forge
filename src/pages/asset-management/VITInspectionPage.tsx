
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, MapPin } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { VITInspectionData, VITItem, YesNoStatus, GoodBadStatus } from "@/lib/asset-types";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

export default function VITInspectionPage() {
  const { user } = useAuth();
  const { saveVITInspection } = useData();
  const navigate = useNavigate();
  
  // Initial list of VIT inspection items
  const initialVITItems: VITItem[] = [
    { id: uuidv4(), name: "Rodent/termite encroachments of cubicle", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Clean and dust free compartments", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Is protection button enabled", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Is recloser button enabled", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Is GROUND/EARTH button enabled", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Is AC power ON/OFF", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Is Battery Power Low", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Is Handle Luck ON", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Is remote button enabled", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Is Gas Level Low?", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Earthling arrangement adequate", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "No fuses blown in control cubicle", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "No damage to bushings or insulators any cub, equipment", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "No damage to H.V.connections i.e., unraveling strands, caging of conductors heating", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Insulators clean", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Paintwork adequate", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "PT fuse link intact", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "No corrosion on equipment", status: "unset" as YesNoStatus, remarks: "" },
    { id: uuidv4(), name: "Condition of silica gel", status: "unset" as GoodBadStatus, remarks: "" },
    { id: uuidv4(), name: "Check for correct labelling and warning notices", status: "unset" as YesNoStatus, remarks: "" }
  ];

  const [formData, setFormData] = useState<Partial<VITInspectionData>>({
    region: user?.region || "",
    district: user?.district || "",
    date: new Date().toISOString().split('T')[0],
    voltageLevel: "11KV",
    typeOfUnit: "",
    serialNumber: "",
    location: "",
    gpsLocation: "",
    status: "Operational",
    protection: "",
    items: initialVITItems
  });

  // Handle generic form input changes
  const handleInputChange = (field: keyof VITInspectionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update inspection item
  const updateVITItem = (id: string, field: keyof VITItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  // Get current GPS location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const gpsString = `${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°W`;
          handleInputChange('gpsLocation', gpsString);
          toast.success("GPS location captured successfully");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  // Validate form before submission
  const validateForm = () => {
    // Basic validation for required fields
    if (!formData.region || !formData.district || !formData.date || !formData.typeOfUnit || 
        !formData.serialNumber || !formData.location) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    // Check if all items have a status
    const hasEmptyStatus = formData.items?.some(item => item.status === "unset");
    if (hasEmptyStatus) {
      toast.error("Please select Yes/No for all inspection items");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Save the VIT inspection data
    saveVITInspection(formData as Omit<VITInspectionData, "id" | "createdAt" | "createdBy">);
    
    // Navigate to the management page
    navigate("/asset-management/vit-inspection-management");
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VITs Inspection</h1>
            <p className="text-muted-foreground mt-2">
              Complete the inspection checklist to ensure VIT equipment safety and performance
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/asset-management/vit-inspection-management")}
          >
            View All VIT Inspections
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>VIT Information</CardTitle>
                <CardDescription>
                  Basic information about the VIT unit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      type="text"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voltageLevel">Voltage Level</Label>
                    <Select
                      value={formData.voltageLevel}
                      onValueChange={(value) => handleInputChange('voltageLevel', value as '11KV' | '33KV')}
                    >
                      <SelectTrigger id="voltageLevel">
                        <SelectValue placeholder="Select voltage level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11KV">11KV</SelectItem>
                        <SelectItem value="33KV">33KV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="typeOfUnit">Type of Unit</Label>
                    <Input
                      id="typeOfUnit"
                      type="text"
                      value={formData.typeOfUnit}
                      onChange={(e) => handleInputChange('typeOfUnit', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Serial Number</Label>
                    <Input
                      id="serialNumber"
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpsLocation">GPS Location</Label>
                    <div className="flex gap-2">
                      <Input
                        id="gpsLocation"
                        type="text"
                        value={formData.gpsLocation}
                        onChange={(e) => handleInputChange('gpsLocation', e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        onClick={getCurrentLocation}
                        variant="outline"
                        className="flex-shrink-0"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Location
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Operational">Operational</SelectItem>
                        <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                        <SelectItem value="Faulty">Faulty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protection">Protection</Label>
                    <Input
                      id="protection"
                      type="text"
                      value={formData.protection}
                      onChange={(e) => handleInputChange('protection', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photoUrl">Photo</Label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <Camera className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Upload Photo</p>
                      <p className="text-xs text-gray-400 mt-1">(Feature coming soon)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>VIT Checklist</CardTitle>
                <CardDescription>
                  Complete the inspection checklist for the VIT unit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.items?.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-4">
                        <h3 className="text-base font-medium flex-1">{item.name}</h3>
                        <div className="flex items-center space-x-6">
                          {item.name === "Condition of silica gel" ? (
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value: GoodBadStatus) => 
                                updateVITItem(item.id, 'status', value)
                              }
                              className="flex items-center space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="good" 
                                  id={`good-${item.id}`} 
                                  className="text-green-500 border-green-500 focus:ring-green-500" 
                                />
                                <Label 
                                  htmlFor={`good-${item.id}`}
                                  className="text-green-600"
                                >
                                  Good
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="bad" 
                                  id={`bad-${item.id}`} 
                                  className="text-red-500 border-red-500 focus:ring-red-500" 
                                />
                                <Label 
                                  htmlFor={`bad-${item.id}`}
                                  className="text-red-600"
                                >
                                  Bad
                                </Label>
                              </div>
                            </RadioGroup>
                          ) : (
                            <RadioGroup
                              value={item.status}
                              onValueChange={(value: YesNoStatus) => 
                                updateVITItem(item.id, 'status', value)
                              }
                              className="flex items-center space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="yes" 
                                  id={`yes-${item.id}`} 
                                  className="text-green-500 border-green-500 focus:ring-green-500" 
                                />
                                <Label 
                                  htmlFor={`yes-${item.id}`}
                                  className="text-green-600"
                                >
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value="no" 
                                  id={`no-${item.id}`} 
                                  className="text-red-500 border-red-500 focus:ring-red-500" 
                                />
                                <Label 
                                  htmlFor={`no-${item.id}`}
                                  className="text-red-600"
                                >
                                  No
                                </Label>
                              </div>
                            </RadioGroup>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label htmlFor={`remarks-${item.id}`} className="text-sm">
                          Remarks
                        </Label>
                        <Textarea
                          id={`remarks-${item.id}`}
                          value={item.remarks}
                          onChange={(e) => updateVITItem(item.id, 'remarks', e.target.value)}
                          placeholder="Add any comments or observations"
                          className="mt-1 h-20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Submit VIT Inspection Report
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
