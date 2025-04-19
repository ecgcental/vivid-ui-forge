import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterIcon, XIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FilterBarProps } from "@/lib/types";
import { DateRange } from "react-day-picker";

export function FilterBar({ 
  setFilterRegion, 
  setFilterDistrict, 
  setFilterStatus, 
  filterStatus, 
  onRefresh, 
  isRefreshing 
}: FilterBarProps) {
  const { regions, districts } = useData();
  const { user } = useAuth();
  
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedFaultType, setSelectedFaultType] = useState<string>("all");
  const [date, setDate] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  
  // Set initial values based on user role
  useEffect(() => {
    if (user) {
      if (user.role === "district_engineer" && user.region && user.district) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setSelectedRegion(userRegion.id);
          setFilterRegion(userRegion.id);
          
          const userDistrict = districts.find(d => d.name === user.district);
          if (userDistrict) {
            setSelectedDistrict(userDistrict.id);
            setFilterDistrict(userDistrict.id);
          }
        }
      } else if (user.role === "regional_engineer" && user.region) {
        const userRegion = regions.find(r => r.name === user.region);
        if (userRegion) {
          setSelectedRegion(userRegion.id);
          setFilterRegion(userRegion.id);
        }
      }
    }
  }, [user, regions, districts, setFilterRegion, setFilterDistrict]);
  
  // Update filters when selections change
  useEffect(() => {
    setFilterRegion(selectedRegion);
  }, [selectedRegion, setFilterRegion]);
  
  useEffect(() => {
    setFilterDistrict(selectedDistrict);
  }, [selectedDistrict, setFilterDistrict]);
  
  const handleRegionChange = (selectedRegionId: string) => {
    setSelectedRegion(selectedRegionId);
    setSelectedDistrict("");  // Reset district when region changes
  };

  const handleStatusChange = (value: string) => {
    // Cast the string value to the expected type
    setFilterStatus(value as "all" | "active" | "resolved");
  };
  
  const handleClearFilters = () => {
    // Don't clear region/district for district/regional engineers
    if (user?.role === "global_engineer") {
      setSelectedRegion("");
      setFilterRegion("");
      setSelectedDistrict("");
      setFilterDistrict("");
    } else if (user?.role === "regional_engineer") {
      setSelectedDistrict("");
      setFilterDistrict("");
    }
    
    setSelectedFaultType("all");
    setFilterStatus("all");
    setDate({
      from: undefined,
      to: undefined,
    });
  };
  
  // Filter regions based on user role
  const filteredRegions = user?.role === "global_engineer" 
    ? regions 
    : regions.filter(r => user?.region ? r.name === user.region : true);
  
  // Filter districts based on selected region and user role
  const filteredDistricts = selectedRegion
    ? districts.filter(d => {
        const region = regions.find(r => r.id === selectedRegion);
        return region?.districts.some(rd => rd.id === d.id);
      })
    : [];
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <FilterIcon className="mr-2 h-5 w-5" />
            Filter Faults
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            <XIcon className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select 
                  value={selectedRegion} 
                  onValueChange={handleRegionChange}
                  disabled={user?.role === "district_engineer" || user?.role === "regional_engineer"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRegions.map(region => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={selectedDistrict} 
                  onValueChange={setSelectedDistrict}
                  disabled={!selectedRegion || user?.role === "district_engineer"}
                >
                  <SelectTrigger className="w-full">
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
              
              <div>
                <Select 
                  value={filterStatus} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Select value={selectedFaultType} onValueChange={setSelectedFaultType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Fault Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="Unplanned">Unplanned</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                    <SelectItem value="Load Shedding">Load Shedding</SelectItem>
                    <SelectItem value="GridCo Outages">GridCo Outages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Date Range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="md:col-span-2">
                <Button
                  variant="outline"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="w-full"
                >
                  {isRefreshing ? "Refreshing..." : "Refresh Data"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
