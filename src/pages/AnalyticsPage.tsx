
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Download, FileText, Filter, Eye, Calendar, MapPin, AlertTriangle, BarChart as ChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AnalyticsPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { getFilteredFaults, regions, districts } = useData();
  const [filteredFaults, setFilteredFaults] = useState([]);
  const [filterRegion, setFilterRegion] = useState<string | undefined>(undefined);
  const [filterDistrict, setFilterDistrict] = useState<string | undefined>(undefined);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedFault, setSelectedFault] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Initialize filters based on user role
    if (user) {
      if (user.role === "district_engineer" && user.district) {
        // District engineers can only see their district data
        const userDistrict = districts.find(d => d.name === user.district);
        if (userDistrict) {
          setFilterDistrict(userDistrict.id);
          setSelectedDistrict(userDistrict.id);
          
          // Also set the region
          const userRegion = regions.find(r => r.id === userDistrict.regionId);
          if (userRegion) {
            setFilterRegion(userRegion.id);
            setSelectedRegion(userRegion.id);
          }
        }
      } else if (user.role === "regional_engineer" && user.region) {
        // Regional engineers default to their region
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setFilterRegion(userRegion.id);
          setSelectedRegion(userRegion.id);
        }
      }
    }

    loadData();
  }, [isAuthenticated, user, navigate, filterRegion, filterDistrict]);
  
  const loadData = () => {
    // Get filtered faults for analytics
    const { op5Faults, controlOutages } = getFilteredFaults(filterRegion, filterDistrict);
    setFilteredFaults([...op5Faults, ...controlOutages]);
  };
  
  const handleRegionChange = (value: string) => {
    if (value === "all") {
      setFilterRegion(undefined);
      // Reset district when changing to "all regions"
      setFilterDistrict(undefined);
      setSelectedDistrict("");
    } else {
      setFilterRegion(value);
    }
    setSelectedRegion(value);
  };

  const handleDistrictChange = (value: string) => {
    if (value === "all") {
      setFilterDistrict(undefined);
    } else {
      setFilterDistrict(value);
    }
    setSelectedDistrict(value);
  };
  
  const exportDetailed = () => {
    const headers = [
      'ID', 'Type', 'Region', 'District', 'Date', 'Restoration Date', 
      'Status', 'Fault Type', 'Duration (min)'
    ];
    
    const dataRows = filteredFaults.map((fault: any) => {
      const type = 'faultLocation' in fault ? 'OP5 Fault' : 'Control Outage';
      const duration = 'outrageDuration' in fault ? fault.outrageDuration || 0 : 0;
      const region = regions.find(r => r.id === fault.regionId)?.name || fault.regionId;
      const district = districts.find(d => d.id === fault.districtId)?.name || fault.districtId;
      
      return [
        fault.id,
        type,
        region,
        district,
        format(new Date(fault.occurrenceDate), 'yyyy-MM-dd'),
        fault.restorationDate ? format(new Date(fault.restorationDate), 'yyyy-MM-dd') : 'N/A',
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
  
  // For district engineers, we restrict them to only see their district data
  const canChangeFilters = user?.role !== "district_engineer";
  
  // Filter the districts based on selected region
  const availableDistricts = filterRegion 
    ? districts.filter(d => d.regionId === filterRegion) 
    : districts;
  
  // Function to get region and district names
  const getRegionName = (regionId: string) => {
    return regions.find(r => r.id === regionId)?.name || regionId;
  };
  
  const getDistrictName = (districtId: string) => {
    return districts.find(d => d.id === districtId)?.name || districtId;
  };
  
  const showFaultDetails = (fault: any) => {
    setSelectedFault(fault);
    setDetailsOpen(true);
  };
  
  if (!isAuthenticated) {
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
            {user?.role === "district_engineer" 
              ? `Analysis for ${user.district}` 
              : "Analyze fault patterns and generate insights for better decision making"}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-2">
            {canChangeFilters && (
              <>
                <Select value={selectedRegion} onValueChange={handleRegionChange} disabled={user?.role === "district_engineer"}>
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
                
                {selectedRegion && selectedRegion !== "all" && (
                  <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={user?.role === "district_engineer"}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Filter by District" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {availableDistricts.map(district => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </>
            )}
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
                {filterRegion || filterDistrict ? `In selected area` : 'Across all regions'}
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
                {filterRegion || filterDistrict ? `In selected area` : 'Across all regions'}
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
                    Latest fault reports {filterDistrict ? "in this district" : filterRegion ? "in this region" : "across the network"}
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
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFaults.slice(0, 7).map((fault: any) => (
                    <TableRow key={fault.id}>
                      <TableCell className="font-medium">{fault.id.substring(0, 10)}</TableCell>
                      <TableCell>{'faultLocation' in fault ? 'OP5 Fault' : 'Control Outage'}</TableCell>
                      <TableCell>{getRegionName(fault.regionId)}</TableCell>
                      <TableCell>{getDistrictName(fault.districtId)}</TableCell>
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
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 p-0"
                          onClick={() => showFaultDetails(fault)}
                        >
                          <Eye size={16} />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        {/* Fault Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            {selectedFault && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedFault.faultType === 'Unplanned' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                    {selectedFault.faultType === 'Planned' && <Calendar className="h-5 w-5 text-blue-500" />}
                    {selectedFault.faultType === 'Emergency' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    {selectedFault.faultType === 'Load Shedding' && <ChartIcon className="h-5 w-5 text-purple-500" />}
                    {'faultLocation' in selectedFault ? 'OP5 Fault Details' : 'Control System Outage Details'}
                  </DialogTitle>
                  <DialogDescription>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{getRegionName(selectedFault.regionId)}, {getDistrictName(selectedFault.districtId)}</span>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Fault Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">ID</span>
                        <p className="text-sm">{selectedFault.id}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Type</span>
                        <p className="text-sm">
                          <Badge variant="outline" className="mt-1">
                            {selectedFault.faultType}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Status</span>
                        <p className="text-sm">
                          <Badge className={`mt-1 ${
                            selectedFault.status === 'active' 
                              ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                              : 'bg-green-100 text-green-800 hover:bg-green-100'
                          }`}>
                            {selectedFault.status.toUpperCase()}
                          </Badge>
                        </p>
                      </div>
                      {'faultLocation' in selectedFault && (
                        <div>
                          <span className="text-xs text-muted-foreground">Location</span>
                          <p className="text-sm">{selectedFault.faultLocation}</p>
                        </div>
                      )}
                      {'reason' in selectedFault && (
                        <div>
                          <span className="text-xs text-muted-foreground">Reason</span>
                          <p className="text-sm">{selectedFault.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Time & Impact</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground">Occurrence Date</span>
                        <p className="text-sm">{format(new Date(selectedFault.occurrenceDate), 'PPP p')}</p>
                      </div>
                      {selectedFault.restorationDate && (
                        <div>
                          <span className="text-xs text-muted-foreground">Restoration Date</span>
                          <p className="text-sm">{format(new Date(selectedFault.restorationDate), 'PPP p')}</p>
                        </div>
                      )}
                      {'outrageDuration' in selectedFault && selectedFault.outrageDuration && (
                        <div>
                          <span className="text-xs text-muted-foreground">Duration</span>
                          <p className="text-sm">{selectedFault.outrageDuration} minutes</p>
                        </div>
                      )}
                      {'affectedPopulation' in selectedFault && (
                        <div>
                          <span className="text-xs text-muted-foreground">Affected Population</span>
                          <p className="text-sm">
                            Rural: {selectedFault.affectedPopulation.rural}, 
                            Urban: {selectedFault.affectedPopulation.urban}, 
                            Metro: {selectedFault.affectedPopulation.metro}
                          </p>
                        </div>
                      )}
                      {'customersAffected' in selectedFault && (
                        <div>
                          <span className="text-xs text-muted-foreground">Customers Affected</span>
                          <p className="text-sm">
                            Rural: {selectedFault.customersAffected.rural}, 
                            Urban: {selectedFault.customersAffected.urban}, 
                            Metro: {selectedFault.customersAffected.metro}
                          </p>
                        </div>
                      )}
                      {'loadMW' in selectedFault && (
                        <div>
                          <span className="text-xs text-muted-foreground">Load</span>
                          <p className="text-sm">{selectedFault.loadMW} MW</p>
                        </div>
                      )}
                      {'unservedEnergyMWh' in selectedFault && (
                        <div>
                          <span className="text-xs text-muted-foreground">Unserved Energy</span>
                          <p className="text-sm">{selectedFault.unservedEnergyMWh.toFixed(2)} MWh</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Link to={`/dashboard?id=${selectedFault.id}`} className="text-primary hover:underline text-sm">
                    View on Dashboard
                  </Link>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
