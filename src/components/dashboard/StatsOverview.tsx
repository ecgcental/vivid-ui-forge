import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Zap, Users, Clock, MonitorSmartphone } from "lucide-react";

interface StatsOverviewProps {
  regionId?: string;
  districtId?: string;
}

export function StatsOverview({ regionId, districtId }: StatsOverviewProps) {
  const { regions, districts, op5Faults, controlOutages } = useData();
  const [totalFaults, setTotalFaults] = useState(0);
  const [totalOutages, setTotalOutages] = useState(0);
  const [affectedPopulation, setAffectedPopulation] = useState(0);
  const [averageOutageTime, setAverageOutageTime] = useState(0);

  useEffect(() => {
    // Filter data based on selected region and district
    const filteredFaults = op5Faults.filter(fault => {
      if (regionId && fault.regionId !== regionId) return false;
      if (districtId && fault.districtId !== districtId) return false;
      return true;
    });

    const filteredOutages = controlOutages.filter(outage => {
      if (regionId && outage.regionId !== regionId) return false;
      if (districtId && outage.districtId !== districtId) return false;
      return true;
    });

    // Calculate total faults and outages
    setTotalFaults(filteredFaults.length);
    setTotalOutages(filteredOutages.length);

    // Calculate total affected population
    let totalAffected = 0;
    filteredFaults.forEach(fault => {
      totalAffected += fault.affectedPopulation.rural + fault.affectedPopulation.urban + fault.affectedPopulation.metro;
    });
    setAffectedPopulation(totalAffected);

    // Calculate average outage time (in minutes)
    let totalDuration = 0;
    filteredFaults.forEach(fault => {
      totalDuration += fault.outrageDuration;
    });
    const avgDuration = filteredFaults.length > 0 ? totalDuration / filteredFaults.length : 0;
    setAverageOutageTime(avgDuration);

  }, [regionId, districtId, op5Faults, controlOutages]);

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
