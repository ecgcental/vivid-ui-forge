import { useState } from "react";
import { OP5Fault, ControlSystemOutage } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatDuration } from "@/utils/calculations";
import { AlertTriangle, BarChart, Clock, MapPin, Users, CheckCircle2, XCircle, Edit, Trash2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

type FaultCardProps = {
  fault: OP5Fault | ControlSystemOutage;
  type: "op5" | "control";
};

export function FaultCard({ fault, type }: FaultCardProps) {
  const { regions, districts, resolveFault, deleteFault, canEditFault } = useData();
  const { user } = useAuth();
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const navigate = useNavigate();
  
  const region = regions.find(r => r.id === fault.regionId);
  const district = districts.find(d => d.id === fault.districtId);
  
  const isOP5 = type === "op5";
  const op5Fault = isOP5 ? fault as OP5Fault : null;
  const controlOutage = !isOP5 ? fault as ControlSystemOutage : null;
  
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Planned":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Unplanned":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Emergency":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "Load Shedding":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };
  
  const statusClass = fault.status === "active" 
    ? "bg-red-100 text-red-800" 
    : "bg-green-100 text-green-800";
  
  const durationText = fault.occurrenceDate && fault.restorationDate 
    ? formatDuration(Math.floor((new Date(fault.restorationDate).getTime() - new Date(fault.occurrenceDate).getTime()) / (1000 * 60)))
    : "Ongoing";
  
  const handleResolve = () => {
    resolveFault(fault.id, type);
    setIsResolveOpen(false);
    toast.success("Fault has been marked as resolved");
  };

  const handleDelete = () => {
    deleteFault(fault.id, type);
    setIsDeleteOpen(false);
    toast.success("Fault has been deleted");
  };
  
  const handleEdit = () => {
    // For now, just show a toast - in a real implementation, this would navigate to an edit form
    toast.info(`Edit functionality for ${isOP5 ? "OP5 fault" : "Control System Outage"} ${fault.id} will be implemented soon`);
  };
  
  const canResolve = () => {
    if (fault.status === "resolved") return false;
    
    // Only district engineers for their district or higher roles can resolve
    if (user?.role === "district_engineer") {
      return user.district === district?.name;
    }
    
    // Regional engineers can resolve in their region
    if (user?.role === "regional_engineer") {
      return user.region === region?.name;
    }
    
    // Global engineers can resolve anywhere
    return user?.role === "global_engineer";
  };

  const canEdit = canEditFault(fault);
  
  const affectedPopulation = op5Fault?.affectedPopulation || { rural: 0, urban: 0, metro: 0 };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            {isOP5 ? "OP5 Fault" : "Control System Outage"}
          </CardTitle>
          <Badge className={statusClass}>
            {fault.status === "active" ? "Active" : "Resolved"}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin size={14} className="text-muted-foreground" />
          {region?.name}, {district?.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getBadgeColor(fault.faultType)}>
              {fault.faultType}
            </Badge>
            
            <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
              ID: {fault.id.substring(0, 10)}
            </Badge>
          </div>
          
          {isOP5 && (
            <p className="flex items-center gap-1 text-sm">
              <AlertTriangle size={14} className="text-orange-500" />
              <span className="font-medium">Location:</span> {op5Fault?.faultLocation}
            </p>
          )}
          
          {!isOP5 && (
            <p className="flex items-center gap-1 text-sm">
              <BarChart size={14} className="text-blue-500" />
              <span className="font-medium">Load:</span> {controlOutage?.loadMW} MW
            </p>
          )}
          
          <div className="flex items-center gap-1 text-sm">
            <Clock size={14} className="text-muted-foreground" />
            <span className="font-medium">Duration:</span> {durationText}
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <Users size={14} className="text-muted-foreground" />
            <span className="font-medium">Affected:</span>{" "}
            {affectedPopulation.rural + affectedPopulation.urban + affectedPopulation.metro} customers
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="details" className="border-b-0">
              <AccordionTrigger className="text-sm py-2">View Details</AccordionTrigger>
              <AccordionContent className="text-xs space-y-2">
                <div>
                  <div className="font-medium">Occurred:</div>
                  <div>{formatDate(fault.occurrenceDate)}</div>
                </div>
                
                {fault.restorationDate && fault.status === "resolved" && (
                  <div>
                    <div className="font-medium">Restored:</div>
                    <div>{formatDate(fault.restorationDate)}</div>
                  </div>
                )}
                
                {isOP5 ? (
                  <>
                    {op5Fault?.mttr && (
                      <div>
                        <div className="font-medium">MTTR:</div>
                        <div>{formatDuration(op5Fault.mttr)}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {controlOutage?.reason && (
                      <div>
                        <div className="font-medium">Reason:</div>
                        <div>{controlOutage.reason}</div>
                      </div>
                    )}
                    
                    {controlOutage?.areaAffected && (
                      <div>
                        <div className="font-medium">Area Affected:</div>
                        <div>{controlOutage.areaAffected}</div>
                      </div>
                    )}
                    
                    {controlOutage?.unservedEnergyMWh !== undefined && (
                      <div>
                        <div className="font-medium">Unserved Energy:</div>
                        <div>{controlOutage.unservedEnergyMWh.toFixed(2)} MWh</div>
                      </div>
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
      <CardFooter className="pt-4 flex flex-wrap gap-2">
        {canResolve() && fault.status === "active" ? (
          <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <CheckCircle2 size={16} className="mr-2" />
                Mark as Resolved
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Resolution</DialogTitle>
                <DialogDescription>
                  Are you sure you want to mark this fault as resolved? This will set the restoration time to now.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsResolveOpen(false)}>
                  <XCircle size={16} className="mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleResolve}>
                  <CheckCircle2 size={16} className="mr-2" />
                  Confirm Resolution
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button variant="outline" className="flex-1" disabled>
            {fault.status === "active" ? (
              <>
                <XCircle size={16} className="mr-2" />
                Cannot Resolve
              </>
            ) : (
              <>
                <CheckCircle2 size={16} className="mr-2" />
                Resolved
              </>
            )}
          </Button>
        )}
        
        {/* Edit button */}
        {canEdit && (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleEdit}
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
        )}
        
        {/* Delete button */}
        {canEdit && (
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this fault? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
