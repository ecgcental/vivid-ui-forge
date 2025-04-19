import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Zap, Users, Clock, MonitorSmartphone } from "lucide-react";
import { OP5Fault, ControlSystemOutage, StatsOverviewProps } from "@/lib/types";

export function StatsOverview({ op5Faults, controlOutages }: StatsOverviewProps) {
  const [totalFaults, setTotalFaults] = useState(0);
  const [totalOutages, setTotalOutages] = useState(0);
  const [affectedPopulation, setAffectedPopulation] = useState(0);
  const [averageOutageTime, setAverageOutageTime] = useState(0);

  useEffect(() => {
    // Calculate total faults and outages
    setTotalFaults(op5Faults.length);
    setTotalOutages(controlOutages.length);

    // Calculate total affected population
    let totalAffected = 0;
    op5Faults.forEach(fault => {
      if (fault.affectedPopulation) {
        totalAffected += fault.affectedPopulation.rural + fault.affectedPopulation.urban + fault.affectedPopulation.metro;
      }
    });
    setAffectedPopulation(totalAffected);

    // Calculate average outage time (in minutes)
    let totalDuration = 0;
    const faultsWithDuration = op5Faults.filter(fault => fault.outrageDuration !== undefined);
    faultsWithDuration.forEach(fault => {
      if (fault.outrageDuration) {
        totalDuration += fault.outrageDuration;
      }
    });
    const avgDuration = faultsWithDuration.length > 0 ? totalDuration / faultsWithDuration.length : 0;
    setAverageOutageTime(avgDuration);

  }, [op5Faults, controlOutages]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Faults</CardTitle>
          <CardDescription>Number of reported OP5 faults</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Zap className="h-8 w-8 text-red-500" />
          <div className="text-3xl font-bold">{totalFaults}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Outages</CardTitle>
          <CardDescription>Number of control system outages</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <MonitorSmartphone className="h-8 w-8 text-orange-500" />
          <div className="text-3xl font-bold">{totalOutages}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Affected Population</CardTitle>
          <CardDescription>Total population affected by faults</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Users className="h-8 w-8 text-blue-500" />
          <div className="text-3xl font-bold">{affectedPopulation}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg. Outage Time</CardTitle>
          <CardDescription>Average time to resolve a fault (minutes)</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Clock className="h-8 w-8 text-green-500" />
          <div className="text-3xl font-bold">{averageOutageTime.toFixed(0)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
