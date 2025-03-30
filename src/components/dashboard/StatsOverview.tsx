
import { OP5Fault, ControlSystemOutage } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, BarChart, Clock, Lightning, Users } from "lucide-react";
import { calculateMTTR, formatDuration } from "@/utils/calculations";

type StatsOverviewProps = {
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
};

export function StatsOverview({ op5Faults, controlOutages }: StatsOverviewProps) {
  // Calculate total active faults
  const activeFaults = op5Faults.filter(f => f.status === "active").length + 
    controlOutages.filter(o => o.status === "active").length;
  
  // Calculate total resolved faults
  const resolvedFaults = op5Faults.filter(f => f.status === "resolved").length + 
    controlOutages.filter(o => o.status === "resolved").length;
  
  // Calculate total affected customers
  const totalAffectedCustomers = op5Faults.reduce((sum, fault) => {
    return sum + fault.affectedPopulation.rural + fault.affectedPopulation.urban + fault.affectedPopulation.metro;
  }, 0) + controlOutages.reduce((sum, outage) => {
    return sum + outage.customersAffected.rural + outage.customersAffected.urban + outage.customersAffected.metro;
  }, 0);
  
  // Calculate Average MTTR for resolved faults only
  const resolvedOP5Faults = op5Faults.filter(f => f.status === "resolved");
  const mttr = resolvedOP5Faults.length 
    ? calculateMTTR(
        resolvedOP5Faults.map(f => ({ 
          occurrenceDate: f.occurrenceDate, 
          restorationDate: f.restorationDate 
        }))
      )
    : 0;
  
  // Calculate total unserved energy
  const totalUnservedEnergy = controlOutages.reduce((sum, outage) => {
    return sum + (outage.unservedEnergyMWh || 0);
  }, 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Fault Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600 flex items-center">
                <AlertCircle size={20} className="mr-1" />
                {activeFaults}
              </div>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {resolvedFaults}
              </div>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average MTTR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            <Clock size={20} className="mr-1 text-yellow-600" />
            {mttr ? formatDuration(mttr) : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            Mean Time To Repair
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Affected Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            <Users size={20} className="mr-1 text-blue-600" />
            {totalAffectedCustomers.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Total Impact
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unserved Energy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center">
            <Lightning size={20} className="mr-1 text-orange-600" />
            {totalUnservedEnergy.toFixed(2)} MWh
          </div>
          <p className="text-xs text-muted-foreground">
            Total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
