
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as LucideBarChart, PieChart as LucidePieChart } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { OP5Fault, ControlSystemOutage, FaultType } from "@/lib/types";

type ChartData = {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AnalyticsCharts() {
  const { regions, districts, op5Faults, controlOutages } = useData();
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");
  
  // Filter faults based on region
  const filterFaultsByRegion = (faults: OP5Fault[] | ControlSystemOutage[]) => {
    if (!selectedRegion) return faults;
    return faults.filter(fault => fault.regionId === selectedRegion);
  };
  
  // Filter faults based on timeframe
  const filterFaultsByTimeframe = (faults: OP5Fault[] | ControlSystemOutage[]) => {
    if (selectedTimeframe === "all") return faults;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (selectedTimeframe) {
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return faults;
    }
    
    return faults.filter(fault => new Date(fault.occurrenceDate) >= cutoffDate);
  };
  
  // Get filtered faults
  const getFilteredFaults = () => {
    const regionFiltered = {
      op5: filterFaultsByRegion(op5Faults),
      control: filterFaultsByRegion(controlOutages)
    };
    
    return {
      op5: filterFaultsByTimeframe(regionFiltered.op5),
      control: filterFaultsByTimeframe(regionFiltered.control)
    };
  };
  
  const filteredFaults = getFilteredFaults();
  
  // Create data for fault type distribution chart
  const getFaultTypeDistribution = () => {
    const allFaults = [...filteredFaults.op5, ...filteredFaults.control];
    const distribution: Record<FaultType, number> = {
      "Planned": 0,
      "Unplanned": 0,
      "Emergency": 0,
      "Load Shedding": 0
    };
    
    allFaults.forEach(fault => {
      distribution[fault.faultType]++;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  };
  
  // Create data for fault status chart
  const getFaultStatusDistribution = () => {
    const allFaults = [...filteredFaults.op5, ...filteredFaults.control];
    const active = allFaults.filter(fault => fault.status === "active").length;
    const resolved = allFaults.filter(fault => fault.status === "resolved").length;
    
    return [
      { name: "Active", value: active },
      { name: "Resolved", value: resolved }
    ];
  };
  
  // Create data for regional distribution chart
  const getRegionalDistribution = () => {
    const allFaults = [...filteredFaults.op5, ...filteredFaults.control];
    const distribution: Record<string, number> = {};
    
    allFaults.forEach(fault => {
      const region = regions.find(r => r.id === fault.regionId)?.name || "Unknown";
      distribution[region] = (distribution[region] || 0) + 1;
    });
    
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  // Create data for district distribution chart
  const getDistrictDistribution = () => {
    if (!selectedRegion) return [];
    
    const allFaults = [...filteredFaults.op5, ...filteredFaults.control]
      .filter(fault => fault.regionId === selectedRegion);
    
    const distribution: Record<string, number> = {};
    
    allFaults.forEach(fault => {
      const district = districts.find(d => d.id === fault.districtId)?.name || "Unknown";
      distribution[district] = (distribution[district] || 0) + 1;
    });
    
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  // Create data for fault count by type and region
  const getFaultByTypeAndRegion = () => {
    const result: { region: string; Planned: number; Unplanned: number; Emergency: number; "Load Shedding": number }[] = [];
    
    regions.forEach(region => {
      const regionFaults = [...filteredFaults.op5, ...filteredFaults.control]
        .filter(fault => fault.regionId === region.id);
      
      const planned = regionFaults.filter(f => f.faultType === "Planned").length;
      const unplanned = regionFaults.filter(f => f.faultType === "Unplanned").length;
      const emergency = regionFaults.filter(f => f.faultType === "Emergency").length;
      const loadShedding = regionFaults.filter(f => f.faultType === "Load Shedding").length;
      
      if (planned + unplanned + emergency + loadShedding > 0) {
        result.push({
          region: region.name,
          Planned: planned,
          Unplanned: unplanned,
          Emergency: emergency,
          "Load Shedding": loadShedding
        });
      }
    });
    
    return result;
  };
  
  // Format for tooltips
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="w-full sm:w-1/2 space-y-2">
          <h3 className="text-sm font-medium">Filter by Region</h3>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/2 space-y-2">
          <h3 className="text-sm font-medium">Timeframe</h3>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="distribution">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="distribution" className="flex items-center">
            <LucidePieChart size={16} className="mr-2" />
            Distribution Analysis
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center">
            <LucideBarChart size={16} className="mr-2" />
            Regional Comparison
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Fault Type Distribution</CardTitle>
                <CardDescription>Breakdown of faults by type</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFaultTypeDistribution()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {getFaultTypeDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={renderTooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fault Status</CardTitle>
                <CardDescription>Active vs Resolved faults</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getFaultStatusDistribution()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#f87171" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip content={renderTooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Faults by region</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getRegionalDistribution()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0052CC" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {selectedRegion && (
              <Card>
                <CardHeader>
                  <CardTitle>District Distribution</CardTitle>
                  <CardDescription>Faults by district in selected region</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getDistrictDistribution()}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#F6C342" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 gap-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Fault Types by Region</CardTitle>
                <CardDescription>Comparison of fault types across regions</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getFaultByTypeAndRegion()}>
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Planned" stackId="a" fill="#4C9AFF" />
                    <Bar dataKey="Unplanned" stackId="a" fill="#F87171" />
                    <Bar dataKey="Emergency" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="Load Shedding" stackId="a" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
