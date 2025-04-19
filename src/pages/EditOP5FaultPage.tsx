import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData, DataContextType } from "@/contexts/DataContext";
import { useAuth, AuthContextType } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, InfoIcon, Users, Clock, ActivityIcon, FileText, Calculator, PlusCircle, X } from "lucide-react";
import { FaultType, OP5Fault, AffectedPopulation, ReliabilityIndices, MaterialUsed } from "@/lib/types";
import { 
  calculateOutageDuration, 
  calculateMTTR, 
  calculateCustomerLostHours,
  calculateReliabilityIndicesByType
} from "@/lib/calculations";
import { toast } from "@/components/ui/sonner";
import { Layout } from "@/components/layout/Layout";
import { formatDuration } from "@/utils/calculations";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";

// Enhanced Helper function to format date for input field safely
const formatDateForInput = (dateString: string | null | undefined): string => {
  // console.log(`[formatDateForInput] Input: '${dateString}' (Type: ${typeof dateString})`); // Log input
  if (dateString === null || dateString === undefined || dateString === "") {
     return "";
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.warn(`[formatDateForInput] Invalid date string parsed as NaN: '${dateString}'`);
        return ""; 
    }
    const formatted = date.toISOString().slice(0, 16); 
    // console.log(`[formatDateForInput] Output: '${formatted}'`); // Log output
    return formatted;
  } catch (error) {
    console.error(`[formatDateForInput] Error formatting date string: '${dateString}'`, error);
    return "";
  }
};

// Type for calculated values state
interface CalculatedState {
  outageDuration: number | null;
  mttr: number | null;
  customerLostHours: number | null;
  reliabilityIndices: {
    rural: ReliabilityIndices;
    urban: ReliabilityIndices;
    metro: ReliabilityIndices;
    total: ReliabilityIndices;
  };
}

export default function EditOP5FaultPage() {
  const { id } = useParams<{ id: string }>();
  const { getOP5FaultById, updateOP5Fault, regions, districts } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [fault, setFault] = useState<OP5Fault | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use Partial for formData as it might not be complete initially
  const [formData, setFormData] = useState<Partial<OP5Fault>>({});

  // Derived values state
  const [calculatedValues, setCalculatedValues] = useState<CalculatedState>({
    outageDuration: null,
    mttr: null,
    customerLostHours: null,
    reliabilityIndices: {
      rural: { saidi: 0, saifi: 0, caidi: 0 },
      urban: { saidi: 0, saifi: 0, caidi: 0 },
      metro: { saidi: 0, saifi: 0, caidi: 0 },
      total: { saidi: 0, saifi: 0, caidi: 0 }
    }
  });

  // Material state
  const [currentMaterialType, setCurrentMaterialType] = useState<string>("");
  const [currentMaterialDetails, setCurrentMaterialDetails] = useState<Partial<MaterialUsed>>({});

  // Fetch fault data
  useEffect(() => {
    if (id && typeof getOP5FaultById === 'function') {
      const fetchedFault = getOP5FaultById(id);
      if (fetchedFault) {
        setFault(fetchedFault);
        // Log dates *before* formatting
        // console.log("[Fetch Effect] Fetched Dates:", { 
        //     occ: fetchedFault.occurrenceDate, 
        //     rep: fetchedFault.repairDate, 
        //     res: fetchedFault.restorationDate 
        // });
        
        const formattedOcc = formatDateForInput(fetchedFault.occurrenceDate);
        const formattedRep = formatDateForInput(fetchedFault.repairDate);
        const formattedRes = formatDateForInput(fetchedFault.restorationDate);
        
        // Log formatted dates *before* setting state
        // console.log("[Fetch Effect] Formatted Dates for State:", { formattedOcc, formattedRep, formattedRes });

        setFormData({
          ...fetchedFault,
          occurrenceDate: formattedOcc,
          repairDate: formattedRep,
          restorationDate: formattedRes,
          affectedPopulation: fetchedFault.affectedPopulation || { rural: 0, urban: 0, metro: 0 },
          materialsUsed: fetchedFault.materialsUsed || [] // Ensure materials are initialized
        });
      } else {
         console.error(`[EditOP5FaultPage] Fault with ID ${id} not found.`);
         toast.error("Fault not found.");
         navigate("/dashboard");
      }
      setIsLoading(false);
    } else {
       console.error("[EditOP5FaultPage] No fault ID provided in URL.");
      navigate("/dashboard"); // Redirect if no ID
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getOP5FaultById, navigate]);

  // Calculate metrics when form data changes
  useEffect(() => {
    const { 
      occurrenceDate: occStr, 
      repairDate: repStr,
      restorationDate: resStr,
      affectedPopulation,
      districtId
    } = formData;
    
    // Log input strings for calculation
    // console.log("[Calc Effect] Date Strings from formData:", { occStr, repStr, resStr });

    let duration: number | null = null;
    let mttrValue: number | null = null;
    let lostHours: number | null = null;
    let ruralIndices: ReliabilityIndices = { saidi: 0, saifi: 0, caidi: 0 };
    let urbanIndices: ReliabilityIndices = { saidi: 0, saifi: 0, caidi: 0 };
    let metroIndices: ReliabilityIndices = { saidi: 0, saifi: 0, caidi: 0 };
    let totalIndices: ReliabilityIndices = { saidi: 0, saifi: 0, caidi: 0 };

    // --- Safely create Date objects --- 
    let occDate: Date | null = null;
    let repDate: Date | null = null;
    let resDate: Date | null = null;

    // Safely parse dates, logging potential issues
    if (occStr) { try { occDate = new Date(occStr); if(isNaN(occDate.getTime())) { /* console.warn("[Calc Effect] Invalid Occurrence Date string:", occStr); */ occDate = null; } } catch { occDate = null; } }
    if (repStr) { try { repDate = new Date(repStr); if(isNaN(repDate.getTime())) { /* console.warn("[Calc Effect] Invalid Repair Date string:", repStr); */ repDate = null; } } catch { repDate = null; } }
    if (resStr) { try { resDate = new Date(resStr); if(isNaN(resDate.getTime())) { /* console.warn("[Calc Effect] Invalid Restoration Date string:", resStr); */ resDate = null; } } catch { resDate = null; } }
    
    // Log parsed Date objects
    // console.log("[Calc Effect] Parsed Date Objects:", { occDate, repDate, resDate });

    // Calculate duration only if both dates are valid and in correct order
    if (occDate && resDate && resDate > occDate) {
       duration = calculateOutageDuration(occStr!, resStr!); // Pass original strings
    }

    // Calculate MTTR only if both dates are valid and in correct order
    if (occDate && repDate && repDate > occDate) {
        mttrValue = calculateMTTR(occStr!, repStr!); // Pass original strings
    }
    
    // Calculate lost hours if duration is valid and population exists
    if (duration !== null && affectedPopulation) {
      lostHours = calculateCustomerLostHours(duration, affectedPopulation);
    }
      
    // Calculate indices if district, population, and duration are valid
    const selectedDistrict = districts.find(d => d.id === districtId);
    if (selectedDistrict?.population && duration !== null && affectedPopulation) {
      const totalPopulation = (selectedDistrict.population.rural || 0) + 
                              (selectedDistrict.population.urban || 0) + 
                              (selectedDistrict.population.metro || 0);
      const pop = selectedDistrict.population;
      const affPop = affectedPopulation;

      // Calculate indices, checking population > 0
      if (pop.rural && pop.rural > 0) {
          ruralIndices = calculateReliabilityIndicesByType(duration, { rural: affPop.rural || 0, urban: 0, metro: 0 }, pop.rural);
      }
      if (pop.urban && pop.urban > 0) {
          urbanIndices = calculateReliabilityIndicesByType(duration, { rural: 0, urban: affPop.urban || 0, metro: 0 }, pop.urban);
      }
      if (pop.metro && pop.metro > 0) {
          metroIndices = calculateReliabilityIndicesByType(duration, { rural: 0, urban: 0, metro: affPop.metro || 0 }, pop.metro);
      }
        if (totalPopulation > 0) {
         totalIndices = calculateReliabilityIndicesByType(duration, affPop, totalPopulation);
      }
    }

    // Update the calculated values state
    setCalculatedValues({
      outageDuration: duration,
      mttr: mttrValue,
      customerLostHours: lostHours,
      reliabilityIndices: { rural: ruralIndices, urban: urbanIndices, metro: metroIndices, total: totalIndices }
    });

  }, [formData, districts]); // Dependency array

  // Generic handler for most inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Generic handler for Select components
  const handleSelectChange = (id: keyof OP5Fault, value: string) => {
    // Reset specificFaultType if faultType changes
    if (id === 'faultType') {
        // Correctly cast value to FaultType
        setFormData(prev => ({ ...prev, faultType: value as FaultType, specificFaultType: undefined }));
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  // Specific handler for affected population inputs
  const handleAffectedPopulationChange = (type: keyof AffectedPopulation, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10); // Ensure radix 10
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData(prev => ({
        ...prev,
        affectedPopulation: {
          ...(prev.affectedPopulation || { rural: 0, urban: 0, metro: 0 }),
          [type]: numValue
        }
      }));
    } else if (value === "") { // Allow clearing the input, treat as 0
       setFormData(prev => ({
         ...prev,
         affectedPopulation: {
           ...(prev.affectedPopulation || { rural: 0, urban: 0, metro: 0 }),
           [type]: 0
         }
       }));
    }
    // Ignore invalid inputs (e.g., negative numbers, non-numeric strings)
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fault) {
      toast.error("Cannot submit: Fault data not loaded.");
      return;
    }
    
    if (typeof updateOP5Fault !== 'function') {
        toast.error("Cannot submit: Update function is not available.");
        return;
    }
    
    if (!formData.regionId || !formData.districtId) {
      toast.error("Please select region and district");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Log initial form data
      console.log("[handleSubmit] Initial form data:", formData);
      console.log("[handleSubmit] Materials in form data:", formData.materialsUsed);

      // Parse dates from form data
      const occurrenceDateTime = formData.occurrenceDate ? new Date(formData.occurrenceDate) : null;
      const repairDateTime = formData.repairDate ? new Date(formData.repairDate) : null;
      const restorationDateTime = formData.restorationDate ? new Date(formData.restorationDate) : null;

      // Format dates to ISO strings
      const formattedOccurrenceDate = occurrenceDateTime ? occurrenceDateTime.toISOString() : null;
      const formattedRepairDate = repairDateTime ? repairDateTime.toISOString() : null;
      const formattedRestorationDate = restorationDateTime ? restorationDateTime.toISOString() : null;

      const mttrValue = calculatedValues.mttr ?? 0;
      const totalIndices = calculatedValues.reliabilityIndices.total ?? { saidi: 0, saifi: 0, caidi: 0 };

      // Create the form data to submit
      const formDataToSubmit: Partial<OP5Fault> = {
        regionId: formData.regionId || fault.regionId,
        districtId: formData.districtId || fault.districtId,
        occurrenceDate: formattedOccurrenceDate || fault.occurrenceDate,
        repairDate: formattedRepairDate || fault.repairDate,
        faultType: formData.faultType || fault.faultType,
        specificFaultType: formData.specificFaultType || fault.specificFaultType,
        faultLocation: formData.faultLocation || fault.faultLocation,
        restorationDate: formattedRestorationDate,
        affectedPopulation: formData.affectedPopulation || fault.affectedPopulation,
        mttr: mttrValue,
        reliabilityIndices: totalIndices,
        materialsUsed: formData.materialsUsed || [], // Ensure materials are included
        outageDescription: formData.outageDescription || null
      };

      // Log the form data before submission
      console.log("[handleSubmit] Submitting form data:", formDataToSubmit);
      console.log("[handleSubmit] Materials in submission:", formDataToSubmit.materialsUsed);

      await updateOP5Fault(fault.id, formDataToSubmit);
      toast.success("Fault updated successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error("[handleSubmit] Error updating fault:", error);
      toast.error(`Failed to update fault: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter districts based on selected region and user role
  const filteredDistricts = formData.regionId && Array.isArray(districts)
    ? districts.filter(d => {
        // Basic check: Must belong to the selected region
        if (d.regionId !== formData.regionId) return false;
        
        // Role-based filtering
        if (user?.role === "district_engineer") {
          // District engineer sees only their assigned district
          return d.name === user.district;
        } else if (user?.role === "regional_engineer") {
           // Regional engineer sees all districts within their assigned region
           // Find the region object corresponding to the user's region name
           const userRegionObj = Array.isArray(regions) ? regions.find(r => r.name === user.region) : null;
           // Check if the district's regionId matches the user's region ID
           return userRegionObj ? d.regionId === userRegionObj.id : false; // If user region not found, show no districts
        }
        
        // Other roles (e.g., admin) see all districts in the selected region
        return true; 
      })
    : []; // Return empty array if no region selected or districts not loaded

  // Material handlers
  const handleMaterialTypeChange = (value: string) => {
    setCurrentMaterialType(value);
    setCurrentMaterialDetails({ type: value }); // Reset details when type changes
  };

  const handleMaterialDetailChange = (field: keyof MaterialUsed, value: string | number) => {
    setCurrentMaterialDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleAddMaterial = () => {
    if (!currentMaterialType) {
      toast.error("Please select a material type.");
      return;
    }

    let materialToAdd: MaterialUsed | null = null;
    const id = uuidv4(); // Generate unique ID

    switch (currentMaterialType) {
      case "Fuse":
        if (!currentMaterialDetails.rating || !currentMaterialDetails.quantity || currentMaterialDetails.quantity <= 0) {
          toast.error("Please enter valid fuse rating and quantity (> 0).");
          return;
        }
        materialToAdd = { 
          id,
          type: "Fuse", 
          rating: currentMaterialDetails.rating, 
          quantity: Number(currentMaterialDetails.quantity) 
        };
        break;
      case "Conductor":
        if (!currentMaterialDetails.conductorType || !currentMaterialDetails.length || currentMaterialDetails.length <= 0) {
          toast.error("Please enter valid conductor type and length (> 0).");
          return;
        }
        materialToAdd = { 
          id,
          type: "Conductor", 
          conductorType: currentMaterialDetails.conductorType, 
          length: Number(currentMaterialDetails.length) 
        };
        break;
      case "Others":
        if (!currentMaterialDetails.description || !currentMaterialDetails.quantity || currentMaterialDetails.quantity <= 0) {
          toast.error("Please enter a description and quantity (> 0) for other materials.");
          return;
        }
        materialToAdd = { 
          id,
          type: "Others", 
          description: currentMaterialDetails.description, 
          quantity: Number(currentMaterialDetails.quantity) 
        };
        break;
      default:
        toast.error("Invalid material type selected.");
        return;
    }

    if (materialToAdd) {
      setFormData(prev => ({
        ...prev,
        materialsUsed: [...(prev.materialsUsed || []), materialToAdd!]
      }));
      // Reset inputs
      setCurrentMaterialType("");
      setCurrentMaterialDetails({});
    }
  };

  const handleRemoveMaterial = (idToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed?.filter(material => material.id !== idToRemove) || []
    }));
  };

  // Loading state display
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  // Fault not found state (should have been handled by useEffect navigation, but good fallback)
  if (!fault) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <p className="text-lg text-muted-foreground mb-4">Fault not found.</p>
           <Button onClick={() => navigate("/dashboard")} variant="outline">Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }
  
  // Main component render
  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 max-w-4xl"> {/* Added max-width */} 
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Edit OP5 Fault Report</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
            </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-8"> {/* Increased spacing */} 
              {/* --- Section 1: Identification --- */}
              <div className="space-y-4 p-4 border rounded-md bg-background/30"> 
                 <h2 className="text-lg font-semibold border-b pb-2">Identification</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select
                        value={formData.regionId || ''} 
                        onValueChange={(value) => handleSelectChange('regionId', value)}
                        disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
                      >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(region => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                    <Select 
                        value={formData.districtId || ''} 
                        onValueChange={(value) => handleSelectChange('districtId', value)}
                        disabled={user?.role === "district_engineer" || !formData.regionId}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                          {filteredDistricts.map(district => (
                            <SelectItem key={district.id} value={district.id}>
                              {district.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                       <Label htmlFor="faultLocation">Fault Location</Label>
                    <Input
                         id="faultLocation"
                         value={formData.faultLocation || ""} 
                         onChange={handleInputChange}
                         placeholder="E.g., Near transformer XYZ, Pole #123"
                      className="h-10"
                    />
                     </div>
                 </div>
                  </div>
                  
               {/* --- Section 2: Fault Details --- */}
               <div className="space-y-4 p-4 border rounded-md bg-background/30">
                  <h2 className="text-lg font-semibold border-b pb-2">Fault Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                      <Label htmlFor="faultType">Fault Type</Label>
                      <Select
                        value={formData.faultType || ''} 
                        onValueChange={(value) => handleSelectChange('faultType', value as FaultType)}
                      >
                      <SelectTrigger className="h-10">
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

                   {(formData.faultType === "Unplanned" || formData.faultType === "Emergency") && (
                     <div className="space-y-2">
                       <Label htmlFor="specificFaultType">Specific Fault Type</Label>
                       <Select
                         value={formData.specificFaultType || ''}
                         onValueChange={(value) => handleSelectChange('specificFaultType', value)}
                       >
                         <SelectTrigger className="h-10">
                           <SelectValue placeholder="Select specific fault type" />
                         </SelectTrigger>
                         <SelectContent>
                           {/* Options based on faultType */}
                           {formData.faultType === "Unplanned" ? (
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
                           ) : formData.faultType === "Emergency" ? (
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
                           ) : null}
                         </SelectContent>
                       </Select>
                     </div>
                   )}
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="outageDescription">Fault Description</Label>
                   <Textarea
                     id="outageDescription"
                     value={formData.outageDescription || ''}
                     onChange={handleInputChange}
                     placeholder="Describe the fault"
                     className="h-20"
                   />
                 </div>
               </div>

               {/* --- Materials Used Section --- */}
               <div className="space-y-4 p-4 border rounded-md bg-background/30">
                 <h2 className="text-lg font-semibold border-b pb-2">Materials Used</h2>
                 
                 {/* Material Input Row */}
                 <div className="flex flex-col sm:flex-row gap-4 items-end">
                   {/* Material Type Select */}
                   <div className="space-y-1 flex-1">
                     <Label htmlFor="materialType">Material Type</Label>
                     <Select 
                       value={currentMaterialType} 
                       onValueChange={handleMaterialTypeChange}
                     >
                       <SelectTrigger className="h-10">
                         <SelectValue placeholder="Select Type" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="Fuse">Fuse</SelectItem>
                         <SelectItem value="Conductor">Conductor</SelectItem>
                         <SelectItem value="Others">Others</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                   
                   {/* Conditional Detail Inputs */}
                   {currentMaterialType === "Fuse" && (
                     <>
                       <div className="space-y-1 flex-1">
                         <Label htmlFor="fuseRating">Rating</Label>
                         <Input 
                           id="fuseRating" 
                           type="number"
                           min="0"
                           step="1"
                           value={currentMaterialDetails.rating || ""} 
                           onChange={(e) => handleMaterialDetailChange('rating', e.target.value)} 
                           placeholder="e.g., 100" 
                           className="h-10" 
                         />
                       </div>
                       <div className="space-y-1" style={{ flexBasis: '100px' }}>
                         <Label htmlFor="fuseQuantity">Quantity</Label>
                         <Input 
                           id="fuseQuantity" 
                           type="number" 
                           value={currentMaterialDetails.quantity || ""} 
                           onChange={(e) => handleMaterialDetailChange('quantity', e.target.value)} 
                           placeholder="Qty" 
                           min="1" 
                           className="h-10" 
                         />
                       </div>
                     </>
                   )}
                   
                   {currentMaterialType === "Conductor" && (
                     <>
                       <div className="space-y-1 flex-1">
                         <Label htmlFor="conductorType">Conductor Type</Label>
                         <Input 
                           id="conductorType" 
                           value={currentMaterialDetails.conductorType || ""} 
                           onChange={(e) => handleMaterialDetailChange('conductorType', e.target.value)} 
                           placeholder="e.g., ACSR 150mm²" 
                           className="h-10" 
                         />
                       </div>
                       <div className="space-y-1" style={{ flexBasis: '120px' }}>
                         <Label htmlFor="conductorLength">Length (m)</Label>
                         <Input 
                           id="conductorLength" 
                           type="number" 
                           value={currentMaterialDetails.length || ""} 
                           onChange={(e) => handleMaterialDetailChange('length', e.target.value)} 
                           placeholder="Length" 
                           min="0.1" 
                           step="0.1" 
                           className="h-10" 
                         />
                       </div>
                     </>
                   )}
                   
                   {currentMaterialType === "Others" && (
                     <>
                       <div className="space-y-1 flex-1">
                         <Label htmlFor="otherDescription">Description</Label>
                         <Input 
                           id="otherDescription" 
                           value={currentMaterialDetails.description || ""} 
                           onChange={(e) => handleMaterialDetailChange('description', e.target.value)} 
                           placeholder="Material description" 
                           className="h-10" 
                         />
                       </div>
                       <div className="space-y-1" style={{ flexBasis: '100px' }}>
                         <Label htmlFor="otherQuantity">Quantity</Label>
                         <Input 
                           id="otherQuantity" 
                           type="number" 
                           value={currentMaterialDetails.quantity || ""} 
                           onChange={(e) => handleMaterialDetailChange('quantity', e.target.value)} 
                           placeholder="Qty" 
                           min="1" 
                           className="h-10" 
                         />
                       </div>
                     </>
                   )}

                   {/* Add Button */}
                   <Button 
                     type="button" 
                     onClick={handleAddMaterial} 
                     disabled={!currentMaterialType}
                     variant="outline"
                     size="icon"
                     className="h-10 w-10 flex-shrink-0"
                     title="Add Material"
                   >
                     <PlusCircle className="h-5 w-5" />
                   </Button>
                 </div>

                 {/* Display Added Materials */}
                 {formData.materialsUsed && formData.materialsUsed.length > 0 && (
                   <div className="mt-4 space-y-2 border-t pt-4">
                     <h4 className="text-sm font-medium text-muted-foreground">Added Materials:</h4>
                     <ul className="list-none space-y-1">
                       {formData.materialsUsed.map((material) => (
                         <li key={material.id} className="flex items-center justify-between bg-muted/30 p-2 rounded text-sm">
                           <span>
                             {material.type === "Fuse" && `Fuse: ${material.rating}, Qty: ${material.quantity}`}
                             {material.type === "Conductor" && `Conductor: ${material.conductorType}, Length: ${material.length}m`}
                             {material.type === "Others" && `Other: ${material.description}, Qty: ${material.quantity}`}
                           </span>
                           <Button 
                             type="button" 
                             onClick={() => handleRemoveMaterial(material.id)} 
                             variant="ghost"
                             size="icon"
                             className="h-6 w-6"
                           >
                             <X className="h-4 w-4 text-destructive" />
                           </Button>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>

               {/* --- Section 3: Timing --- */}
               <div className="space-y-4 p-4 border rounded-md bg-background/30">
                  <h2 className="text-lg font-semibold border-b pb-2">Timing</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="occurrenceDate">Occurrence Date & Time</Label>
                      <Input
                        id="occurrenceDate"
                        type="datetime-local"
                        value={formData.occurrenceDate || ""} 
                        onChange={handleInputChange}
                        className="w-full h-10"
                      />
                 </div>

                <div className="space-y-2">
                     <Label htmlFor="repairDate">Repair Start Date & Time</Label>
                  <Input
                       id="repairDate"
                       type="datetime-local"
                       value={formData.repairDate || ""} 
                       onChange={handleInputChange}
                       className="w-full h-10"
                  />
                </div>

                <div className="space-y-2">
                     <Label htmlFor="restorationDate">Restoration Date & Time</Label>
                  <Input
                    id="restorationDate"
                    type="datetime-local"
                       value={formData.restorationDate || ""} 
                       onChange={handleInputChange}
                       className="w-full h-10"
                     />
                  </div>
                </div>
              </div>

              {/* --- Section 4: Impact & Calculations (Tabs) --- */} 
              <Tabs defaultValue="affected" className="w-full">
                 <TabsList className="grid w-full grid-cols-2 gap-1"> 
                   <TabsTrigger value="affected" className="flex items-center justify-center gap-1 text-sm py-2">
                     <Users className="h-4 w-4" />
                     <span>Affected Population</span>
                   </TabsTrigger>
                   <TabsTrigger value="calculations" className="flex items-center justify-center gap-1 text-sm py-2">
                     <Calculator className="h-4 w-4" />
                     <span>Calculations</span>
                   </TabsTrigger>
                 </TabsList>

                 {/* Affected Population Tab */}
                 <TabsContent value="affected" className="space-y-6 pt-6 border rounded-b-md p-4">
                    <div className="space-y-4">
                       {/* <Label className="font-medium text-lg">Affected Population</Label> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                           <Label htmlFor="ruralAffected">Rural Population</Label>
                    <Input
                      id="ruralAffected"
                      type="number"
                      min="0"
                             value={formData.affectedPopulation?.rural ?? ''} 
                             onChange={(e) => handleAffectedPopulationChange('rural', e.target.value)}
                             placeholder="Number affected"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                           <Label htmlFor="urbanAffected">Urban Population</Label>
                    <Input
                      id="urbanAffected"
                      type="number"
                      min="0"
                             value={formData.affectedPopulation?.urban ?? ''}
                             onChange={(e) => handleAffectedPopulationChange('urban', e.target.value)}
                             placeholder="Number affected"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                           <Label htmlFor="metroAffected">Metro Population</Label>
                    <Input
                      id="metroAffected"
                      type="number"
                      min="0"
                             value={formData.affectedPopulation?.metro ?? ''}
                             onChange={(e) => handleAffectedPopulationChange('metro', e.target.value)}
                             placeholder="Number affected"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
                 </TabsContent>

                 {/* Calculations Tab */}
                 <TabsContent value="calculations" className="pt-6 space-y-6 border rounded-b-md p-4">
              <div className="space-y-6">
                     {/* Row 1: Duration & MTTR */} 
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <Label htmlFor="outageDuration" className="font-medium text-sm flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground"/> Outage Duration
                         </Label>
                         <div className="bg-muted/50 rounded-md p-3 text-sm border border-muted min-h-[44px] flex items-center">
                           {calculatedValues.outageDuration !== null 
                             ? formatDuration(calculatedValues.outageDuration)
                             : <span className="text-muted-foreground italic text-xs">Requires valid Occurrence & Restoration Dates</span>}
                         </div>
                       </div>
                  <div className="space-y-2">
                         <Label htmlFor="mttr" className="font-medium text-sm flex items-center gap-1">
                            <ActivityIcon className="h-4 w-4 text-muted-foreground"/> MTTR
                    </Label>
                         <div className="bg-muted/50 rounded-md p-3 text-sm border border-muted min-h-[44px] flex items-center">
                           {calculatedValues.mttr !== null 
                             ? formatDuration(calculatedValues.mttr)
                             : <span className="text-muted-foreground italic text-xs">Requires valid Occurrence & Repair Dates</span>}
                         </div>
                    </div>
                  </div>
                  
                      {/* Row 2: Customer Lost Hours */} 
                  <div className="space-y-2">
                       <Label htmlFor="customerLostHours" className="font-medium text-sm flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground"/> Customer Lost Hours
                    </Label>
                       <div className="bg-muted/50 rounded-md p-3 text-sm border border-muted min-h-[44px] flex items-center">
                         {calculatedValues.customerLostHours !== null 
                           ? `${calculatedValues.customerLostHours.toFixed(2)} Cshr`
                           : <span className="text-muted-foreground italic text-xs">Requires valid Duration & Affected Pop.</span>}
                    </div>
                  </div>
                  
                     {/* Row 3: Reliability Indices */} 
                     <div className="space-y-4">
                       <Label className="font-medium text-sm">Reliability Indices</Label>
                       <div className="text-xs text-muted-foreground italic mb-2">Calculated based on selected district population, valid duration, and affected population.</div>
                       
                       {/* Combined Indices Table-like structure */} 
                       <div className="border rounded-md overflow-hidden">
                         <table className="w-full text-sm">
                           <thead className="bg-muted/50">
                             <tr className="text-left">
                               <th className="p-2 font-medium">Population</th>
                               <th className="p-2 font-medium">SAIDI</th>
                               <th className="p-2 font-medium">SAIFI</th>
                               <th className="p-2 font-medium">CAIDI</th>
                             </tr>
                           </thead>
                           <tbody>
                             {/* Rural */}
                             <tr className="border-b">
                               <td className="p-2 font-medium">Rural</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.rural.saidi ?? 0).toFixed(3)}</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.rural.saifi ?? 0).toFixed(3)}</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.rural.caidi ?? 0).toFixed(3)}</td>
                             </tr>
                              {/* Urban */}
                             <tr className="border-b">
                               <td className="p-2 font-medium">Urban</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.urban.saidi ?? 0).toFixed(3)}</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.urban.saifi ?? 0).toFixed(3)}</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.urban.caidi ?? 0).toFixed(3)}</td>
                             </tr>
                              {/* Metro */}
                             <tr className="border-b">
                               <td className="p-2 font-medium">Metro</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.metro.saidi ?? 0).toFixed(3)}</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.metro.saifi ?? 0).toFixed(3)}</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.metro.caidi ?? 0).toFixed(3)}</td>
                             </tr>
                             {/* Total */}
                             <tr className="bg-muted/50 font-semibold">
                               <td className="p-2">Total (District)</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.total.saidi ?? 0).toFixed(3)}</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.total.saifi ?? 0).toFixed(3)}</td>
                               <td className="p-2">{(calculatedValues.reliabilityIndices.total.caidi ?? 0).toFixed(3)}</td>
                             </tr>
                           </tbody>
                         </table>
                    </div>
                  </div>
                </div>
                 </TabsContent>
              </Tabs>

              {/* Submit Button */}
              <div className="pt-4"> {/* Add padding top */} 
                  <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base font-medium">
                    {isSubmitting ? (
                        <>
                         <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                         Updating...
                        </>
                     ) : (
                        "Update Fault Report"
                     )}
                  </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 