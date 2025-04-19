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
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, parse, startOfWeek, endOfWeek } from "date-fns";
import { Download, FileText, Filter, Eye, Calendar, MapPin, AlertTriangle, BarChart as ChartIcon, ActivityIcon, TrendingUp, Clock, Users, Wrench, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getUserRegionAndDistrict } from "@/utils/user-utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { exportAnalyticsToPDF } from "@/utils/pdfExport";
import { useToast } from "@/components/ui/use-toast";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { LineChart, Line } from 'recharts';
import { OP5Fault } from '../types/faults';
import MaterialsAnalysis from '@/components/analytics/MaterialsAnalysis';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const formatSafeDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return 'N/A';
  }
};

export default function AnalyticsPage() {
  const { toast } = useToast();
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
  const [dateRange, setDateRange] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<Date | undefined>(undefined);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const [startMonth, setStartMonth] = useState<Date | undefined>(undefined);
  const [endMonth, setEndMonth] = useState<Date | undefined>(undefined);
  const [startYear, setStartYear] = useState<Date | undefined>(undefined);
  const [endYear, setEndYear] = useState<Date | undefined>(undefined);
  const [isStartMonthPickerOpen, setIsStartMonthPickerOpen] = useState(false);
  const [isEndMonthPickerOpen, setIsEndMonthPickerOpen] = useState(false);
  const [isStartYearPickerOpen, setIsStartYearPickerOpen] = useState(false);
  const [isEndYearPickerOpen, setIsEndYearPickerOpen] = useState(false);
  const [startWeek, setStartWeek] = useState<number | undefined>(undefined);
  const [endWeek, setEndWeek] = useState<number | undefined>(undefined);
  const [isStartWeekPickerOpen, setIsStartWeekPickerOpen] = useState(false);
  const [isEndWeekPickerOpen, setIsEndWeekPickerOpen] = useState(false);
  const [reliabilityIndices, setReliabilityIndices] = useState<any>(null);
  const [materialsStats, setMaterialsStats] = useState({
    totalMaterials: 0,
    byType: [] as { name: string; value: number }[],
    byMonth: [] as { name: string; value: number }[],
    topMaterials: [] as { name: string; value: number }[]
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    // Initialize filters based on user role
    if (user) {
      const { regionId, districtId } = getUserRegionAndDistrict(user, regions, districts);
      
      if (regionId) {
        setFilterRegion(regionId);
        setSelectedRegion(regionId);
      } else {
        // Set to "all" if no specific region
        setFilterRegion(undefined);
        setSelectedRegion("all");
      }
      
      if (districtId) {
        setFilterDistrict(districtId);
        setSelectedDistrict(districtId);
      }
    } else {
      // Set default to "all" when no user role restrictions
      setFilterRegion(undefined);
      setSelectedRegion("all");
    }
  }, [isAuthenticated, user, navigate, regions, districts]);

  // Single effect for data loading
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[DataLoadEffect] Loading data with filters:', {
        filterRegion,
        filterDistrict,
        dateRange,
        startDate,
        endDate
      });
      loadData();
    }
  }, [isAuthenticated, filterRegion, filterDistrict, dateRange, startDate, endDate]);

  const loadData = () => {
    console.log('[loadData] Starting with filters:', {
      filterRegion,
      filterDistrict,
      dateRange,
      startDate,
      endDate,
      selectedRegion,
      selectedMonth,
      selectedYear,
      startWeek,
      endWeek
    });

    // Get filtered faults for analytics - handle "all" case properly
    const { op5Faults, controlOutages } = getFilteredFaults(
      selectedRegion === "all" ? undefined : filterRegion,
      selectedDistrict === "all" ? undefined : filterDistrict
    );
    
    // Apply date range filter
    let filteredByDate = [...op5Faults, ...controlOutages];

    // Apply date range filter if needed
    if (dateRange !== "all") {
      const now = new Date();
      let start: Date;
      let end: Date = endOfDay(now);

      switch (dateRange) {
        case "today":
          start = startOfDay(now);
          break;
        case "week":
          // Get the start of 7 days ago
          start = startOfDay(subDays(now, 6)); // 6 because today counts as 1
          break;
        case "month":
          // Get the start of 30 days ago
          start = startOfDay(subDays(now, 29)); // 29 because today counts as 1
          break;
        case "year":
          // Get the start of 365 days ago
          start = startOfDay(subDays(now, 364)); // 364 because today counts as 1
          break;
        case "custom":
          if (startDate && endDate) {
            start = startOfDay(startDate);
            end = endOfDay(endDate);
          } else {
            start = startOfYear(now);
          }
          break;
        case "custom-month":
          if (startMonth && endMonth) {
            start = startOfMonth(startMonth);
            end = endOfMonth(endMonth);
            console.log('[loadData] Custom month range:', {
              start: start.toISOString(),
              end: end.toISOString()
            });
          } else if (selectedMonth) {
            start = startOfMonth(selectedMonth);
            end = endOfMonth(selectedMonth);
            console.log('[loadData] Single month:', {
              start: start.toISOString(),
              end: end.toISOString()
            });
          } else {
            start = startOfMonth(now);
            end = endOfMonth(now);
          }
          break;
        case "custom-year":
          if (startYear && endYear) {
            start = startOfYear(startYear);
            end = endOfYear(endYear);
            console.log('[loadData] Custom year range:', {
              start: start.toISOString(),
              end: end.toISOString()
            });
          } else if (selectedYear) {
            start = startOfYear(selectedYear);
            end = endOfYear(selectedYear);
            console.log('[loadData] Single year:', {
              start: start.toISOString(),
              end: end.toISOString()
            });
          } else {
            start = startOfYear(now);
            end = endOfYear(now);
          }
          break;
        case "custom-week":
          if (startWeek && endWeek && selectedYear) {
            // Convert week numbers to dates
            start = startOfWeek(new Date(selectedYear.getFullYear(), 0, 1 + (startWeek - 1) * 7));
            end = endOfWeek(new Date(selectedYear.getFullYear(), 0, 1 + (endWeek - 1) * 7));
            console.log('[loadData] Custom week range:', {
              start: start.toISOString(),
              end: end.toISOString(),
              startWeek,
              endWeek,
              year: selectedYear.getFullYear()
            });
          } else {
            start = startOfWeek(now);
            end = endOfWeek(now);
          }
          break;
        default:
          start = startOfYear(now);
      }

      console.log('[loadData] Date filter:', {
        dateRange,
        start: start.toISOString(),
        end: end.toISOString()
      });

      filteredByDate = filteredByDate.filter(fault => {
        try {
          const faultDate = new Date(fault.occurrenceDate);
          const isInRange = faultDate >= start && faultDate <= end;
          
          if (!isInRange) {
            console.log('[loadData] Fault filtered out:', {
              faultId: fault.id,
              faultDate: faultDate.toISOString(),
              start: start.toISOString(),
              end: end.toISOString()
            });
          }
          
          return isInRange;
        } catch (error) {
          console.error('[loadData] Error processing fault date:', {
            faultId: fault.id,
            occurrenceDate: fault.occurrenceDate,
            error
          });
          return false;
        }
      });
    }

    console.log('[loadData] Filtered results:', {
      totalFaults: filteredByDate.length,
      op5Faults: filteredByDate.filter(f => 'faultLocation' in f).length,
      controlOutages: filteredByDate.filter(f => !('faultLocation' in f)).length,
      dateRange,
      region: filterRegion,
      district: filterDistrict,
      sampleDates: filteredByDate.slice(0, 3).map(f => ({
        id: f.id,
        date: f.occurrenceDate
      }))
    });

    setFilteredFaults(filteredByDate);

    // Calculate reliability indices immediately after setting filtered faults
    const reliabilityIndices = calculateReliabilityIndices(filteredByDate);
    setReliabilityIndices(reliabilityIndices);
  };

  const calculateReliabilityIndices = (faults: any[]) => {
    const indices = {
      rural: { saidi: 0, saifi: 0, caidi: 0 },
      urban: { saidi: 0, saifi: 0, caidi: 0 },
      metro: { saidi: 0, saifi: 0, caidi: 0 }
    };

    faults.forEach((fault: any) => {
      if ('faultLocation' in fault) {
        const region = regions.find(r => r.id === fault.regionId);
        if (region) {
          indices.rural.saidi += fault.mttr || 0;
          indices.rural.saifi += 1;
          indices.rural.caidi += fault.mttr || 0 / (fault.reliabilityIndices?.saidi || 1);
        }
      } else {
        const district = districts.find(d => d.id === fault.districtId);
        if (district) {
          indices.urban.saidi += fault.mttr || 0;
          indices.urban.saifi += 1;
          indices.urban.caidi += fault.mttr || 0 / (fault.reliabilityIndices?.saidi || 1);
        }
      }
    });

    return indices;
  };

  const handleRegionChange = (value: string) => {
    console.log('[handleRegionChange] New region:', value, 'Previous:', selectedRegion);
    
    if (value === "all") {
      // Clear both region and district filters
      setFilterRegion(undefined);
      setFilterDistrict(undefined);
      setSelectedDistrict("");
    } else {
      // Set new region filter
      setFilterRegion(value);
      // Reset district when changing region
      setFilterDistrict(undefined);
      setSelectedDistrict("");
    }
    setSelectedRegion(value);
  };

  const handleDistrictChange = (value: string) => {
    console.log('[handleDistrictChange] New district:', value);
    
    if (value === "all") {
      setFilterDistrict(undefined);
    } else {
      setFilterDistrict(value);
    }
    setSelectedDistrict(value);
  };
  
  const handleDateRangeChange = (value: string) => {
    console.log('[handleDateRangeChange] New date range:', value);
    
    setDateRange(value);
    // Reset custom date selections when changing date range type
    if (value !== "custom") {
      setStartDate(null);
      setEndDate(null);
    }
    // Reset custom period selections
    setStartMonth(undefined);
    setEndMonth(undefined);
    setStartYear(undefined);
    setEndYear(undefined);
    setStartWeek(undefined);
    setEndWeek(undefined);
  };

  const handleStartMonthSelect = (date: Date | undefined) => {
    setStartMonth(date);
    setIsStartMonthPickerOpen(false);
    if (date && endMonth) {
      loadData();
    }
  };

  const handleEndMonthSelect = (date: Date | undefined) => {
    setEndMonth(date);
    setIsEndMonthPickerOpen(false);
    if (date && startMonth) {
      loadData();
    }
  };

  const handleStartYearSelect = (date: Date | undefined) => {
    setStartYear(date);
    setIsStartYearPickerOpen(false);
    if (date && endYear) {
      loadData();
    }
  };

  const handleEndYearSelect = (date: Date | undefined) => {
    setEndYear(date);
    setIsEndYearPickerOpen(false);
    if (date && startYear) {
      loadData();
    }
  };

  const handleStartWeekSelect = (week: number) => {
    setStartWeek(week);
    if (week && endWeek && selectedYear) {
      loadData();
    }
  };

  const handleEndWeekSelect = (week: number) => {
    setEndWeek(week);
    if (week && startWeek && selectedYear) {
      loadData();
    }
  };

  const handleYearSelect = (date: Date | undefined) => {
    setSelectedYear(date);
    if (date && startWeek && endWeek) {
      loadData();
    }
  };
  
  // Add useEffect to watch for date range changes
  useEffect(() => {
    if (dateRange === "custom-month" && startMonth && endMonth) {
      loadData();
    } else if (dateRange === "custom-year" && startYear && endYear) {
      loadData();
    } else if (dateRange === "custom-week" && startWeek && endWeek) {
      loadData();
    }
  }, [dateRange, startMonth, endMonth, startYear, endYear, startWeek, endWeek]);
  
  const exportDetailed = () => {
    const headers = [
      'ID', 'Type', 'Region', 'District', 'Occurrence Date', 'Restoration Date', 
      'Status', 'Fault Type', 'Specific Fault Type', 'Duration (min)', 'Created By', 'Created At',
      // Common fields for both types
      'Rural Customers Affected', 'Urban Customers Affected', 'Metro Customers Affected',
      // OP5 specific fields
      'Fault Location', 'MTTR', 'SAIDI', 'SAIFI', 'CAIDI',
      // Control outage specific fields
      'Load (MW)', 'Unserved Energy (MWh)', 'Area Affected', 'Reason', 'Control Panel Indications'
    ];
    
    const dataRows = filteredFaults.map((fault: any) => {
      const type = 'faultLocation' in fault ? 'OP5 Fault' : 'Control Outage';
      const duration = 'outrageDuration' in fault ? fault.outrageDuration || 0 : 0;
      const region = regions.find(r => r.id === fault.regionId)?.name || fault.regionId;
      const district = districts.find(d => d.id === fault.districtId)?.name || fault.districtId;
      
      // Common fields
      const row = [
        fault.id,
        type,
        region,
        district,
        formatSafeDate(fault.occurrenceDate),
        fault.restorationDate ? formatSafeDate(fault.restorationDate) : 'N/A',
        fault.status,
        fault.faultType,
        fault.specificFaultType || 'N/A',
        duration,
        fault.createdBy,
        formatSafeDate(fault.createdAt),
        // Population affected
        fault.affectedPopulation?.rural || fault.customersAffected?.rural || 0,
        fault.affectedPopulation?.urban || fault.customersAffected?.urban || 0,
        fault.affectedPopulation?.metro || fault.customersAffected?.metro || 0,
      ];

      // Add OP5 specific fields
      if ('faultLocation' in fault) {
        row.push(
          fault.faultLocation || 'N/A',
          fault.mttr || 'N/A',
          fault.reliabilityIndices?.saidi || 'N/A',
          fault.reliabilityIndices?.saifi || 'N/A',
          fault.reliabilityIndices?.caidi || 'N/A',
          'N/A', // Load MW
          'N/A', // Unserved Energy
          'N/A', // Area Affected
          'N/A', // Reason
          'N/A'  // Control Panel Indications
        );
      } else {
        // Add Control outage specific fields
        row.push(
          'N/A', // Fault Location
          'N/A', // MTTR
          'N/A', // SAIDI
          'N/A', // SAIFI
          'N/A', // CAIDI
          fault.loadMW || 0,
          fault.unservedEnergyMWh || 0,
          fault.areaAffected || 'N/A',
          fault.reason || 'N/A',
          fault.controlPanelIndications || 'N/A'
        );
      }
      
      // Handle values that might contain commas by wrapping in quotes
      return row.map(value => {
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          // Escape any existing quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');
    });
    
    // Combine headers and data
    const csvContent = [headers.join(','), ...dataRows].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fault-analysis-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportToPDF = async () => {
    try {
      await exportAnalyticsToPDF(
        filteredFaults,
        reliabilityIndices,
        dateRange,
        startDate,
        endDate,
        selectedRegion,
        selectedDistrict,
        regions,
        districts
      );
    } catch (error) {
      console.error("Error exporting to PDF:", error);
    }
  };
  
  const exportMaterialsToCSV = () => {
    try {
      console.log('Starting material export with faults:', filteredFaults);

      // Get all OP5 faults with materials used
      const faultsWithMaterials = filteredFaults.filter(fault => {
        const isOP5Fault = 'faultLocation' in fault || fault.type === 'OP5';
        const hasMaterials = Array.isArray(fault.materialsUsed) && fault.materialsUsed.length > 0;
        
        if (isOP5Fault && hasMaterials) {
          console.log('OP5 Fault with materials:', {
            id: fault.id,
            type: fault.type,
            materialsCount: fault.materialsUsed.length,
            materials: fault.materialsUsed
          });
        }
        
        return isOP5Fault && hasMaterials;
      });

      if (faultsWithMaterials.length === 0) {
        toast({
          title: "Export Failed",
          description: "No material data found to export",
          variant: "destructive",
        });
        return;
      }

      // Prepare headers
      const headers = [
        'Fault ID',
        'Fault Type',
        'Region',
        'District',
        'Fault Location',
        'Material Type',
        'Material Details',
        'Quantity',
        'Date'
      ];

      // Prepare data rows
      const dataRows = faultsWithMaterials.flatMap(fault => {
        const region = regions.find(r => r.id === fault.regionId)?.name || 'Unknown';
        const district = districts.find(d => d.id === fault.districtId)?.name || 'Unknown';
        const faultType = fault.faultType || 'OP5 Fault'; // Default to 'OP5 Fault' if faultType is not available
        
        return fault.materialsUsed.map(material => {
          let materialDetails = 'N/A';
          let quantity = material.quantity || material.details?.quantity || 1;
          
          // Handle different material types
          switch (material.type) {
            case 'Fuse':
              const rating = material.details?.rating || material.details?.fuseRating || material.rating || 'N/A';
              materialDetails = `Rating: ${rating}A`;
              break;
            case 'Conductor':
              const type = material.details?.type || material.conductorType || 'N/A';
              const length = material.details?.length || material.length || 'N/A';
              materialDetails = `Type: ${type}, Length: ${length}m`;
              break;
            case 'Others':
              materialDetails = material.details?.description || material.description || 'N/A';
              break;
            default:
              materialDetails = 'Unknown material type';
          }

          console.log('Processing material:', {
            faultId: fault.id,
            materialType: material.type,
            quantity: quantity,
            rawMaterial: material
          });

          return [
            fault.id || 'N/A',
            faultType,
            region,
            district,
            fault.faultLocation || 'N/A',
            material.type || 'Unknown',
            materialDetails,
            quantity.toString(),
            formatSafeDate(fault.occurrenceDate)
          ];
        });
      });

      // Create CSV content with proper escaping
      const csvContent = [
        headers.join(','),
        ...dataRows.map(row => 
          row.map(cell => {
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `materials_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Materials report has been exported",
      });
    } catch (error) {
      console.error('Error exporting materials to CSV:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export materials report",
        variant: "destructive",
      });
    }
  };
  
  const renderMaterialsContent = () => {
    // Get all OP5 faults with materials used
    const op5Faults = filteredFaults.filter(fault => {
      // Check if it's an OP5 fault and has materials
      const isOP5Fault = 'faultLocation' in fault || fault.type === 'OP5';
      const hasMaterials = Array.isArray(fault.materialsUsed) && fault.materialsUsed.length > 0;
      
      if (isOP5Fault && hasMaterials) {
        console.log('OP5 Fault with materials:', {
          id: fault.id,
          type: fault.type,
          materialsCount: fault.materialsUsed.length,
          materials: fault.materialsUsed
        });
      }
      
      return isOP5Fault && hasMaterials;
    });

    // Calculate materials statistics
    const materialsStats = {
      totalMaterials: op5Faults.reduce((sum, fault) => sum + fault.materialsUsed.length, 0),
      byType: [] as { name: string; value: number }[],
      byMonth: [] as { name: string; value: number }[],
      topMaterials: [] as { name: string; value: number }[]
    };

    // Group materials by type
    const materialsByType = new Map<string, number>();
    const materialsByMonth = new Map<string, number>();
    const materialCounts = new Map<string, number>();

    op5Faults.forEach(fault => {
      try {
        // Use occurrenceDate instead of date
        const faultDate = fault.occurrenceDate ? new Date(fault.occurrenceDate) : null;
        if (!faultDate || isNaN(faultDate.getTime())) {
          console.warn(`Invalid date for fault ${fault.id}:`, {
            occurrenceDate: fault.occurrenceDate,
            type: fault.type
          });
          return;
        }
        
        const month = format(faultDate, 'MMM yyyy');
        
        fault.materialsUsed.forEach(material => {
          // Log the complete material object for debugging
          console.log('Processing material:', {
            type: material.type,
            details: material.details,
            raw: material
          });

          // Count by type
          materialsByType.set(
            material.type,
            (materialsByType.get(material.type) || 0) + 1
          );

          // Count by month
          materialsByMonth.set(
            month,
            (materialsByMonth.get(month) || 0) + 1
          );

          // Count individual materials with safe property access
          let materialKey = material.type;
          
          if (material.type === 'Fuse') {
            // Check both the details object and direct properties
            const rating = material.details?.rating || 
                         material.details?.fuseRating || 
                         material.rating || 
                         material.fuseRating || 
                         'Unknown Rating';
            materialKey = `${material.type} - ${rating}`;
          } else if (material.type === 'Conductor') {
            const type = material.details?.type || 
                        material.type || 
                        'Unknown Type';
            materialKey = `${material.type} - ${type}`;
          } else if (material.type === 'Others') {
            const description = material.details?.description || 
                              material.description || 
                              'Unknown Description';
            materialKey = `${material.type} - ${description}`;
          }

          materialCounts.set(
            materialKey,
            (materialCounts.get(materialKey) || 0) + 1
          );
        });
      } catch (error) {
        console.error(`Error processing fault ${fault.id}:`, error, {
          occurrenceDate: fault.occurrenceDate,
          type: fault.type,
          materials: fault.materialsUsed
        });
      }
    });

    // Convert to arrays for charts
    materialsStats.byType = Array.from(materialsByType.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    materialsStats.byMonth = Array.from(materialsByMonth.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        try {
          const dateA = new Date(a.name);
          const dateB = new Date(b.name);
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            console.warn('Invalid date in month sorting:', { a: a.name, b: b.name });
            return 0;
          }
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error('Error sorting dates:', error);
          return 0;
        }
      });

    materialsStats.topMaterials = Array.from(materialCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    console.log('Materials Analysis Stats:', {
      totalFaults: op5Faults.length,
      totalMaterials: materialsStats.totalMaterials,
      byType: materialsStats.byType,
      byMonth: materialsStats.byMonth,
      topMaterials: materialsStats.topMaterials,
      sampleFault: op5Faults[0] ? {
        id: op5Faults[0].id,
        materials: op5Faults[0].materialsUsed
      } : null
    });

    return (
      <TabsContent value="materials" className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Materials Analysis</h2>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={exportMaterialsToCSV}
          >
            <Package className="h-4 w-4" />
            <span>Export Materials Report</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Materials Used</CardTitle>
              <CardDescription>Across all OP5 faults</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{materialsStats.totalMaterials}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materials by Type</CardTitle>
              <CardDescription>Distribution of material types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialsStats.byType}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {materialsStats.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Usage</CardTitle>
              <CardDescription>Materials used over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialsStats.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Top Materials Used</CardTitle>
              <CardDescription>Most frequently used materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={materialsStats.topMaterials}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    );
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
      <div className="container mx-auto py-4 sm:py-6 px-2 sm:px-4">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Analytics & Reporting
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {user?.role === "district_engineer" 
              ? `Analysis for ${user.district}` 
              : "Analyze fault patterns and generate insights for better decision making"}
          </p>
        </div>
        
        <div className="flex flex-col gap-4 mb-4 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {canChangeFilters && (
              <>
                <Select value={selectedRegion} onValueChange={handleRegionChange} disabled={user?.role === "district_engineer"}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
                    <SelectTrigger className="w-full sm:w-[180px]">
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
            
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Date Range">
                  {dateRange === "custom-month" && startMonth && endMonth
                    ? `${format(startMonth, "MMM yyyy")} - ${format(endMonth, "MMM yyyy")}`
                    : dateRange === "custom-year" && startYear && endYear
                    ? `${format(startYear, "yyyy")} - ${format(endYear, "yyyy")}`
                    : dateRange === "custom-week" && startWeek && endWeek && selectedYear
                    ? `Week ${startWeek} - Week ${endWeek}, ${format(selectedYear, "yyyy")}`
                    : dateRange === "all"
                    ? "All Time"
                    : dateRange === "week"
                    ? "Last 7 Days"
                    : "Last Year"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom-week">Select Week Range</SelectItem>
                <SelectItem value="custom-month">Select Month Range</SelectItem>
                <SelectItem value="custom-year">Select Year Range</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === "custom-week" && (
              <div className="flex items-center gap-2">
                <Select value={selectedYear?.getFullYear()?.toString()} onValueChange={(value) => handleYearSelect(new Date(parseInt(value), 0))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={startWeek?.toString()} onValueChange={(value) => handleStartWeekSelect(parseInt(value))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Start Week" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                      <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span>to</span>

                <Select value={endWeek?.toString()} onValueChange={(value) => handleEndWeekSelect(parseInt(value))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="End Week" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                      <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {dateRange === "custom-month" && (
              <div className="flex items-center gap-2">
                <Popover open={isStartMonthPickerOpen} onOpenChange={setIsStartMonthPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      {startMonth ? format(startMonth, "MMMM yyyy") : "Start Month"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startMonth}
                      onSelect={handleStartMonthSelect}
                      initialFocus
                      disabled={(date) => endMonth ? date > endMonth : false}
                    />
                  </PopoverContent>
                </Popover>

                <span>to</span>

                <Popover open={isEndMonthPickerOpen} onOpenChange={setIsEndMonthPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                      {endMonth ? format(endMonth, "MMMM yyyy") : "End Month"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endMonth}
                      onSelect={handleEndMonthSelect}
                      initialFocus
                      disabled={(date) => startMonth ? date < startMonth : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {dateRange === "custom-year" && (
              <div className="flex items-center gap-2">
                <Select value={startYear?.getFullYear()?.toString()} onValueChange={(value) => handleStartYearSelect(new Date(parseInt(value), 0))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Start Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span>to</span>

                <Select value={endYear?.getFullYear()?.toString()} onValueChange={(value) => handleEndYearSelect(new Date(parseInt(value), 0))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="End Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none flex items-center gap-2"
              onClick={exportDetailed}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Export Detailed Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none flex items-center gap-2"
              onClick={exportToPDF}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export PDF Report</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
        
        {dateRange !== "all" && startDate && endDate && (
          <div className="mb-4 sm:mb-6 text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              Showing data from {format(startDate, 'MMM dd, yyyy')} to {format(endDate, 'MMM dd, yyyy')}
            </span>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-medium">Total Faults</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{filteredFaults.length}</div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {filteredFaults.filter((f: any) => f.status === "active").length} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-medium">OP5 Faults</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {filteredFaults.filter((f: any) => 'faultLocation' in f).length}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {filterRegion || filterDistrict ? `In selected area` : 'Across all regions'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-medium">Control Outages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {filteredFaults.filter((f: any) => 'customersAffected' in f).length}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {filterRegion || filterDistrict ? `In selected area` : 'Across all regions'}
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* MTTR Report Card */}
        <Card className="mb-4 sm:mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg">Mean Time To Repair (MTTR) Report</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Analysis of repair times for OP5 faults</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {filteredFaults.filter(f => 'faultLocation' in f && f.mttr).length} Faults Analyzed
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-medium">Average MTTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {(() => {
                      const op5FaultsWithMTTR = filteredFaults.filter(f => 'faultLocation' in f && f.mttr);
                      const totalMTTR = op5FaultsWithMTTR.reduce((sum, fault) => sum + (fault.mttr || 0), 0);
                      const averageMTTR = op5FaultsWithMTTR.length > 0 ? totalMTTR / op5FaultsWithMTTR.length : 0;
                      return `${averageMTTR.toFixed(2)} hours`;
                    })()}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Across all regions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-medium">Total Repair Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {(() => {
                      const op5FaultsWithMTTR = filteredFaults.filter(f => 'faultLocation' in f && f.mttr);
                      const totalMTTR = op5FaultsWithMTTR.reduce((sum, fault) => sum + (fault.mttr || 0), 0);
                      return `${totalMTTR.toFixed(2)} hours`;
                    })()}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Combined repair time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-medium">Faults with MTTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl sm:text-3xl font-bold">
                    {filteredFaults.filter(f => 'faultLocation' in f && f.mttr).length}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Out of {filteredFaults.filter(f => 'faultLocation' in f).length} total OP5 faults
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-base sm:text-lg font-semibold">MTTR by Region</h3>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  Average Repair Time
                </Badge>
              </div>
              <div className="space-y-4">
                {regions.map(region => {
                  const regionFaults = filteredFaults.filter(f => 'faultLocation' in f && f.mttr && f.regionId === region.id);
                  const regionMTTR = regionFaults.reduce((sum, fault) => sum + (fault.mttr || 0), 0);
                  const avgMTTR = regionFaults.length > 0 ? regionMTTR / regionFaults.length : 0;
                  const totalFaults = filteredFaults.filter(f => 'faultLocation' in f && f.regionId === region.id).length;
                  
                  return (
                    <div key={region.id} className="space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm sm:text-base">{region.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {regionFaults.length} faults
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <span className="font-medium text-sm sm:text-base">{avgMTTR.toFixed(2)} hours</span>
                          <div className="flex-1 sm:w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ 
                                width: `${(avgMTTR / 5) * 100}%`,  // Scale for 5 hours max
                                maxWidth: '100%'
                              }} 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {regionFaults.length} of {totalFaults} OP5 faults have MTTR data
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest of the content with responsive adjustments */}
        <div className="mt-8 sm:mt-12">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <ActivityIcon className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="faults" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Faults
              </TabsTrigger>
              <TabsTrigger value="reliability" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Reliability
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="materials" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Materials
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
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
                      <TableCell>{formatSafeDate(fault.occurrenceDate)}</TableCell>
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
            </TabsContent>

            <TabsContent value="faults" className="space-y-6">
              <AnalyticsCharts filteredFaults={filteredFaults} />
            </TabsContent>

            <TabsContent value="reliability" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rural Reliability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rural Reliability</CardTitle>
                    <CardDescription>Indices for rural areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">SAIDI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.rural?.saidi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">System Average Interruption Duration Index</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">SAIFI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.rural?.saifi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">System Average Interruption Frequency Index</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">CAIDI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.rural?.caidi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">Customer Average Interruption Duration Index</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Urban Reliability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Urban Reliability</CardTitle>
                    <CardDescription>Indices for urban areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">SAIDI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.urban?.saidi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">System Average Interruption Duration Index</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">SAIFI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.urban?.saifi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">System Average Interruption Frequency Index</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">CAIDI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.urban?.caidi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">Customer Average Interruption Duration Index</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metro Reliability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metro Reliability</CardTitle>
                    <CardDescription>Indices for metro areas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">SAIDI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.metro?.saidi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">System Average Interruption Duration Index</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">SAIFI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.metro?.saifi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">System Average Interruption Frequency Index</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">CAIDI</Label>
                        <p className="text-2xl font-bold">{reliabilityIndices?.metro?.caidi?.toFixed(3) || '0.000'}</p>
                        <p className="text-sm text-muted-foreground">Customer Average Interruption Duration Index</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {renderMaterialsContent()}
          </Tabs>
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
                        <p className="text-sm">{formatSafeDate(selectedFault.occurrenceDate)}</p>
                      </div>
                      {selectedFault.restorationDate && (
                        <div>
                          <span className="text-xs text-muted-foreground">Restoration Date</span>
                          <p className="text-sm">{formatSafeDate(selectedFault.restorationDate)}</p>
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
