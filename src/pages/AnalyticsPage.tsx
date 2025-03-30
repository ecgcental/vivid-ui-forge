
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Download, FileText, Filter } from "lucide-react";

export default function AnalyticsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { getFilteredFaults, regions } = useData();
  const [filteredFaults, setFilteredFaults] = useState([]);
  const [filterRegion, setFilterRegion] = useState<string | undefined>(undefined);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Only regional and global engineers can access analytics
    if (user?.role === "district_engineer") {
      navigate("/dashboard");
    }

    loadData();
  }, [isAuthenticated, user, navigate, filterRegion]);
  
  const loadData = () => {
    // Get filtered faults for analytics
    const { op5Faults, controlOutages } = getFilteredFaults(filterRegion);
    setFilteredFaults([...op5Faults, ...controlOutages]);
  };
  
  const handleRegionChange = (value: string) => {
    if (value === "all") {
      setFilterRegion(undefined);
    } else {
      setFilterRegion(value);
    }
    setSelectedRegion(value);
  };
  
  const exportDetailed = () => {
    const headers = [
      'ID', 'Type', 'Region', 'District', 'Date', 'Restoration Date', 
      'Status', 'Fault Type', 'Duration (min)'
    ];
    
    const dataRows = filteredFaults.map((fault: any) => {
      const type = 'faultLocation' in fault ? 'OP5 Fault' : 'Control Outage';
      const duration = 'outrageDuration' in fault ? fault.outrageDuration || 0 : 0;
      
      return [
        fault.id,
        type,
        fault.regionId,
        fault.districtId,
        format(new Date(fault.occurrenceDate), 'yyyy-MM-dd'),
        format(new Date(fault.restorationDate), 'yyyy-MM-dd'),
        fault.status,
        fault.faultType,
        duration
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...dataRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `detailed-report-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (!isAuthenticated || user?.role === "district_engineer") {
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Analytics & Reporting
          </h1>
          <p className="text-muted-foreground">
            Analyze fault patterns and generate insights for better decision making
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={exportDetailed}
            >
              <FileText className="h-4 w-4" />
              Export Detailed Report
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Faults</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredFaults.length}</div>
              <p className="text-xs text-muted-foreground">
                {filteredFaults.filter((f: any) => f.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">OP5 Faults</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredFaults.filter((f: any) => 'faultLocation' in f).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {filterRegion ? `In selected region` : 'Across all regions'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Control Outages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredFaults.filter((f: any) => 'customersAffected' in f).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {filterRegion ? `In selected region` : 'Across all regions'}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <AnalyticsCharts filteredFaults={filteredFaults} />
        
        <div className="mt-12">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Faults</CardTitle>
                  <CardDescription>
                    Latest fault reports across the network
                  </CardDescription>
                </div>
                <Button variant="outline" className="flex items-center gap-2" onClick={exportDetailed}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaults.slice(0, 5).map((fault: any) => (
                    <TableRow key={fault.id}>
                      <TableCell className="font-medium">{fault.id}</TableCell>
                      <TableCell>{'faultLocation' in fault ? 'OP5 Fault' : 'Control Outage'}</TableCell>
                      <TableCell>{fault.regionId}</TableCell>
                      <TableCell>{fault.districtId}</TableCell>
                      <TableCell>{format(new Date(fault.occurrenceDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          fault.status === 'active' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {fault.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
