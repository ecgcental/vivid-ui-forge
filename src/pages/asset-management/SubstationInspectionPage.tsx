
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AssetManagementNav } from "@/components/layout/AssetManagementNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useData } from "@/contexts/DataContext";
import { SubstationInspectionData, InspectionItem, ConditionStatus } from "@/lib/asset-types";
import { v4 as uuidv4 } from "uuid";

const tabItems = {
  general: [
    "Access roads and yard free of debris",
    "Adequate lighting in switch yard / control room",
    "No trespassers / animals",
    "Adequate danger warning signs",
    "Adequate fire fighting equipment",
    "Security lights working",
    "Security adequate"
  ],
  control: [
    "Control building structure intact",
    "Batteries functional and housekeeping satisfactory",
    "Faulty indication lamp / display",
    "SCADA equipment functioning properly",
    "Time synch functioning properly"
  ],
  transformer: [
    "Transformer bushing clean",
    "Transformer oil level satisfactory",
    "Transformer breather condition satisfactory",
    "No oil leakage",
    "Silica gel condition satisfactory",
    "Cooling fans function satisfactorily"
  ],
  outdoor: [
    "Switch yard free of vegetation",
    "No broken insulators",
    "Structures intact",
    "Earth wires intact",
    "Earth connections intact",
    "Bus bars intact",
    "Circuit breakers intact"
  ]
};

export default function SubstationInspectionPage() {
  const navigate = useNavigate();
  const { regions, saveInspection } = useData();
  
  const [region, setRegion] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [substationNo, setSubstationNo] = useState<string>("");
  const [substationName, setSubstationName] = useState<string>("");
  const [type, setType] = useState<"indoor" | "outdoor">("indoor");
  
  const [activeTab, setActiveTab] = useState("general");
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

  // Initialize items once when region changes (to get a new inspection)
  useState(() => {
    if (region && inspectionItems.length === 0) {
      const newItems: InspectionItem[] = [];
      
      Object.entries(tabItems).forEach(([category, items]) => {
        items.forEach(item => {
          newItems.push({
            id: uuidv4(),
            category,
            name: item,
            status: "unset" as ConditionStatus,
            remarks: ""
          });
        });
      });
      
      setInspectionItems(newItems);
    }
  });

  // Get districts for selected region
  const districts = region 
    ? regions.find(r => r.name === region)?.districts.map(d => d.name) || []
    : [];

  // Get items for the active tab
  const activeItems = inspectionItems.filter(item => item.category === activeTab);
  
  // Update status of an item
  const updateItemStatus = (id: string, status: ConditionStatus) => {
    setInspectionItems(prev => 
      prev.map(item => 
        item.id === id
          ? { ...item, status }
          : item
      )
    );
  };
  
  // Update remarks of an item
  const updateItemRemarks = (id: string, remarks: string) => {
    setInspectionItems(prev => 
      prev.map(item => 
        item.id === id
          ? { ...item, remarks }
          : item
      )
    );
  };
  
  // Validate the form before submission
  const validateForm = () => {
    if (!region) {
      toast.error("Please select a region");
      return false;
    }
    
    if (!district) {
      toast.error("Please select a district");
      return false;
    }
    
    if (!substationNo) {
      toast.error("Please enter a substation number");
      return false;
    }
    
    // Check if all items have a status
    const unsetItems = inspectionItems.filter(item => item.status === "unset");
    if (unsetItems.length > 0) {
      toast.error(`Please set status for all items (${unsetItems.length} remaining)`);
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const inspection: Omit<SubstationInspectionData, "id" | "createdAt" | "createdBy"> = {
      region,
      district,
      date,
      substationNo,
      substationName,
      type,
      items: inspectionItems
    };
    
    saveInspection(inspection);
    toast.success("Substation inspection saved successfully!");
    navigate("/asset-management/inspection-management");
  };

  return (
    <Layout>
      <AssetManagementNav />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Substation Inspection</h1>
          <p className="text-muted-foreground mt-2">
            Perform routine inspection of substation equipment and conditions
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Substation Information</CardTitle>
              <CardDescription>
                Enter the basic information about the substation being inspected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select 
                    value={region} 
                    onValueChange={setRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(r => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <Select 
                    value={district} 
                    onValueChange={setDistrict}
                    disabled={!region}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={region ? "Select district" : "Select region first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Inspection Date</label>
                  <Input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Substation Number</label>
                  <Input 
                    placeholder="Enter substation number" 
                    value={substationNo}
                    onChange={e => setSubstationNo(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Substation Name (Optional)</label>
                  <Input 
                    placeholder="Enter substation name" 
                    value={substationName}
                    onChange={e => setSubstationName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Substation Type</label>
                  <Select 
                    value={type} 
                    onValueChange={(value) => setType(value as "indoor" | "outdoor")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Indoor</SelectItem>
                      <SelectItem value="outdoor">Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inspection Checklist</CardTitle>
              <CardDescription>
                Check the condition of each item and add remarks if necessary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="control">Control Equipment</TabsTrigger>
                  <TabsTrigger value="transformer">Transformers</TabsTrigger>
                  <TabsTrigger value="outdoor">Outdoor Equipment</TabsTrigger>
                </TabsList>
                
                {["general", "control", "transformer", "outdoor"].map(tabValue => (
                  <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                    {activeItems.map(item => (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4">
                          <p className="text-sm font-medium">{item.name}</p>
                        </div>
                        <div className="md:col-span-3">
                          <Select 
                            value={item.status} 
                            onValueChange={(value) => updateItemStatus(item.id, value as ConditionStatus)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="bad">Bad</SelectItem>
                              <SelectItem value="unset">Not Checked</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-5">
                          <Input 
                            placeholder="Add remarks if needed" 
                            value={item.remarks}
                            onChange={e => updateItemRemarks(item.id, e.target.value)}
                          />
                        </div>
                        {item !== activeItems[activeItems.length - 1] && (
                          <Separator className="md:col-span-12 my-2" />
                        )}
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
              
              <div className="mt-8 flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Inspection
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Layout>
  );
}
