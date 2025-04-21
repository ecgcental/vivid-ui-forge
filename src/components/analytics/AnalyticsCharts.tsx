import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { OP5Fault, ControlSystemOutage, Region, District } from '@/lib/types';
import { useData } from "@/contexts/DataContext";
import { calculateUnservedEnergy, calculateOutageDuration } from '@/utils/calculations';
import {
  Calculator,
  FileText,
  Flame,
  Gauge,
  TrendingDown,
  TrendingUp,
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  PowerPlug,
  MapPin,
  Factory,
  Waves,
  Activity,
  Target,
  Network,
  Server,
  BatteryCharging,
  Cpu,
  Memory,
  HardDrive,
  Thermometer,
  Droplet,
  Percent,
  Lightbulb,
  Settings,
  ShieldAlert,
  HelpCircle,
  Info,
  AlertOctagon,
  Radio,
  Router,
  Signal,
  Wifi,
  Database,
  Cloud,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Volume1,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Music,
  Film,
  Camera,
  Image,
  File,
  Folder,
  Download,
  Upload,
  Share2,
  Printer,
  Save,
  Edit,
  Copy,
  Link2,
  ExternalLink,
  Search,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Layout,
  Columns,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Dribbble,
  Linkedin,
  AtSign,
  Hash,
  Globe2,
  Mail,
  Phone,
  Navigation2,
  Compass,
  Map,
  Calendar,
  User,
  Users2,
  Smile,
  Frown,
  Meh,
  Anchor,
  Puzzle,
  TargetIcon,
  Award,
  Ribbon,
  Trophy,
  Gem,
  Scale,
  Briefcase,
  ShoppingCart,
  CreditCard,
  Banknote,
  Bitcoin,
  Wallet,
  Package2,
  Archive,
  Disc,
  Headphones2,
  Monitor,
  Tv2,
  Mobile,
  Tablet,
  Laptop2,
  Keyboard,
  MousePointer2,
  Gamepads,
  AirVent,
  Wind,
  Snowflake,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Umbrella,
  Cloudy,
  CloudyWindy,
  ThermometerSun,
  Sunrise,
  Sunset,
  Mist,
  Smoke,
  Haze,
  Dust,
  Sandstorm,
  Tornado,
  Volcano,
  Meteor,
  Earth,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  Battery,
  BatteryCharging2,
  ChargingPile,
  SignalStrength,
  SimCard,
  SdCard,
  Cpu2,
  Server2,
  Database2,
  HardDrive2,
  Memory2,
  Disc2,
  Radio2,
  Router2,
  Printer2,
  Scanner,
  Camera2,
  Video,
  Mic2,
  Headphones3,
  Music2,
  Film2,
  Image2,
  File2,
  Folder2,
  Download2,
  Upload2,
  Share,
  Link,
  ExternalLink2,
  Search2,
  ZoomIn2,
  ZoomOut2,
  Move2,
  Maximize,
  Minimize,
  MoreHorizontal2,
  MoreVertical2,
  Grid2,
  List2,
  Layout2,
  Columns2,
  GitBranch2,
  GitCommit2,
  GitMerge2,
  GitPullRequest2,
  Github2,
  Twitter2,
  Facebook2,
  Instagram2,
  Youtube2,
  Dribbble2,
  Linkedin2,
  AtSign2,
  Hash2,
  Globe,
  Mail2,
  Phone2,
  Navigation,
  Compass2,
  Map2,
  Calendar2,
  User2,
  Users3,
  Smile2,
  Frown2,
  Meh2,
  Anchor2,
  Puzzle2,
  Target2,
  Award2,
  Ribbon2,
  Trophy2,
  Gem2,
  Scale2,
  Briefcase2,
  ShoppingCart2,
  CreditCard2,
  Banknote2,
  Bitcoin2,
  Wallet2,
  Package,
  Archive2,
  Disc3,
  Headphones4,
  Monitor2,
  Tv3,
  Mobile2,
  Tablet2,
  Laptop3,
  Keyboard2,
  MousePointer,
  Gamepads2,
  AirVent2,
  Wind2,
  Snowflake2,
  Sun2,
  Moon2,
  CloudRain2,
  CloudSnow2,
  CloudLightning2,
  CloudFog2,
  Umbrella2,
  Cloudy2,
  CloudyWindy2,
  ThermometerSun2,
  Sunrise2,
  Sunset2,
  Mist2,
  Smoke2,
  Haze2,
  Dust2,
  Sandstorm2,
  Tornado2,
  Volcano2,
  Meteor2,
  Earth2,
  WifiOff2,
  Bluetooth2,
  BluetoothConnected2,
  Battery2,
  BatteryCharging3,
  ChargingPile2,
  SignalStrength2,
  SimCard2,
  SdCard2,
  Cpu3,
  Server3,
  Database3,
  HardDrive3,
  Memory3,
  Disc4,
  Radio3,
  Router3,
  Printer3,
  Scanner2,
  Camera3,
  Video2,
  Mic3,
  Headphones5,
  Music3,
  Film3,
  Image3,
  File3,
  Folder3,
  Download3,
  Upload3,
  Share3,
  Link3,
  ExternalLink3,
  Search3,
  ZoomIn3,
  ZoomOut3,
  Move3,
  Maximize3,
  Minimize3,
  MoreHorizontal3,
  MoreVertical3,
  Grid3,
  List3,
  Layout3,
  Columns3,
  GitBranch3,
  GitCommit3,
  GitMerge3,
  GitPullRequest3,
  Github3,
  Twitter3,
  Facebook3,
  Instagram3,
  Youtube3,
  Dribbble3,
  Linkedin3,
  AtSign3,
  Hash3,
  Globe3,
  Mail3,
  Phone3,
} from 'lucide-react';

interface AnalyticsChartProps {
  op5Faults: OP5Fault[];
  controlOutages: ControlSystemOutage[];
  regions: Region[];
  districts: District[];
}

const COLORS = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 p-2 rounded-md shadow-md">
        <p className="font-semibold">{`${label}`}</p>
        {payload.map((item: any) => (
          <p key={item.dataKey} className="text-gray-700">
            {`${item.name}: ${item.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export function AnalyticsCharts({ op5Faults, controlOutages, regions, districts }: AnalyticsChartProps) {
  const [faultTypeCounts, setFaultTypeCounts] = useState<{ name: string; value: number }[]>([]);
  const [monthlyFaultCounts, setMonthlyFaultCounts] = useState<{ name: string; value: number }[]>([]);
  const [districtFaultCounts, setDistrictFaultCounts] = useState<{ name: string; value: number }[]>([]);
  const [regionFaultCounts, setRegionFaultCounts] = useState<{ name: string; value: number }[]>([]);
  const [unservedEnergyByDistrict, setUnservedEnergyByDistrict] = useState<{ name: string; value: number }[]>([]);
  const [averageOutageDurationByDistrict, setAverageOutageDurationByDistrict] = useState<{ name: string; value: number }[]>([]);
  const [customerImpactByDistrict, setCustomerImpactByDistrict] = useState<{ name: string; rural: number; urban: number; metro: number }[]>([]);
  const [faultResolutionTimes, setFaultResolutionTimes] = useState<{ name: string; value: number }[]>([]);
  const [faultTypeTrends, setFaultTypeTrends] = useState<{ name: string; [key: string]: number }[]>([]);
  const [specificFaultTypeCounts, setSpecificFaultTypeCounts] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    // Fault Type Counts
    const faultTypes = {};
    op5Faults.forEach(fault => {
      const type = fault.faultType || 'Unknown';
      faultTypes[type] = (faultTypes[type] || 0) + 1;
    });
    controlOutages.forEach(outage => {
      const type = outage.faultType || 'Unknown';
      faultTypes[type] = (faultTypes[type] || 0) + 1;
    });
    setFaultTypeCounts(Object.entries(faultTypes).map(([name, value]) => ({ name, value: value as number })));

    // Monthly Fault Counts
    const monthlyCounts = {};
    op5Faults.forEach(fault => {
      const month = new Date(fault.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    controlOutages.forEach(outage => {
      const month = new Date(outage.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    setMonthlyFaultCounts(
      Object.entries(monthlyCounts)
        .map(([name, value]) => ({ name, value: value as number }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
    );

    // District Fault Counts
    const districtCounts = {};
    op5Faults.forEach(fault => {
      const district = districts.find(d => d.id === fault.districtId)?.name || 'Unknown';
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });
    controlOutages.forEach(outage => {
      const district = districts.find(d => d.id === outage.districtId)?.name || 'Unknown';
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });
    setDistrictFaultCounts(Object.entries(districtCounts).map(([name, value]) => ({ name, value: value as number })));

    // Region Fault Counts
    const regionCounts = {};
    op5Faults.forEach(fault => {
      const region = regions.find(r => r.id === fault.regionId)?.name || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    controlOutages.forEach(outage => {
      const region = regions.find(r => r.id === outage.regionId)?.name || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    setRegionFaultCounts(Object.entries(regionCounts).map(([name, value]) => ({ name, value: value as number })));

    // Unserved Energy by District
    const districtEnergy = {};
    controlOutages.forEach(outage => {
      const district = districts.find(d => d.id === outage.districtId)?.name || 'Unknown';
      const energy = outage.unservedEnergyMWh || 0;
      districtEnergy[district] = (districtEnergy[district] || 0) + energy;
    });
    setUnservedEnergyByDistrict(Object.entries(districtEnergy).map(([name, value]) => ({ name, value: value as number })));

    // Average Outage Duration by District
    const districtDurations = {};
    districts.forEach(district => {
      const outagesInDistrict = controlOutages.filter(outage => outage.districtId === district.id);
      const totalDuration = outagesInDistrict.reduce((sum, outage) => {
        const occurrenceDate = new Date(outage.occurrenceDate);
        const restorationDate = new Date(outage.restorationDate);
        return sum + calculateOutageDuration(occurrenceDate.toISOString(), restorationDate.toISOString());
      }, 0);
      const averageDuration = outagesInDistrict.length > 0 ? totalDuration / outagesInDistrict.length : 0;
      districtDurations[district.name] = averageDuration;
    });
    setAverageOutageDurationByDistrict(Object.entries(districtDurations).map(([name, value]) => ({ name, value: value as number })));

    // Customer Impact by District
    const districtImpact = {};
    districts.forEach(district => {
      const outagesInDistrict = controlOutages.filter(outage => outage.districtId === district.id);
      const initialValue = { rural: 0, urban: 0, metro: 0 };
      const totalImpact = outagesInDistrict.reduce((acc, outage) => {
        acc.rural += outage.customersAffected?.rural || 0;
        acc.urban += outage.customersAffected?.urban || 0;
        acc.metro += outage.customersAffected?.metro || 0;
        return acc;
      }, initialValue);
      districtImpact[district.name] = totalImpact;
    });
    setCustomerImpactByDistrict(Object.entries(districtImpact).map(([name, value]) => ({ name, ...value as any })));

    // Fault Resolution Times
    const resolutionTimes = [];
    op5Faults.forEach(fault => {
      if (fault.restorationDate && fault.createdAt) {
        const createdDate = new Date(fault.createdAt).getTime();
        const resolvedDate = new Date(fault.restorationDate).getTime();
        const resolutionTime = (resolvedDate - createdDate) / (60 * 60 * 1000); // in hours
        resolutionTimes.push({ name: fault.id, value: resolutionTime });
      }
    });
    controlOutages.forEach(outage => {
      if (outage.restorationDate && outage.createdAt) {
        const createdDate = new Date(outage.createdAt).getTime();
        const resolvedDate = new Date(outage.restorationDate).getTime();
        const resolutionTime = (resolvedDate - createdDate) / (60 * 60 * 1000); // in hours
        resolutionTimes.push({ name: outage.id, value: resolutionTime });
      }
    });
    setFaultResolutionTimes(resolutionTimes);

    // Fault Type Trends
    const monthlyFaultTypes = {};
    op5Faults.forEach(fault => {
      const month = new Date(fault.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      const faultType = fault.faultType || 'Unknown';
      if (!monthlyFaultTypes[month]) {
        monthlyFaultTypes[month] = {};
      }
      monthlyFaultTypes[month][faultType] = (monthlyFaultTypes[month][faultType] || 0) + 1;
    });
    controlOutages.forEach(outage => {
      const month = new Date(outage.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      const faultType = outage.faultType || 'Unknown';
      if (!monthlyFaultTypes[month]) {
        monthlyFaultTypes[month] = {};
      }
      monthlyFaultTypes[month][faultType] = (monthlyFaultTypes[month][faultType] || 0) + 1;
    });
    const faultTypeTrendsData = Object.entries(monthlyFaultTypes).map(([month, types]) => {
      return { name: month, ...types as any };
    });
    setFaultTypeTrends(faultTypeTrendsData);

    // Specific Fault Type Counts
    const specificFaultTypes = {};
    op5Faults.forEach(fault => {
      const type = fault.specificFaultType || 'Unknown';
      specificFaultTypes[type] = (specificFaultTypes[type] || 0) + 1;
    });
    controlOutages.forEach(outage => {
      const type = outage.specificFaultType || 'Unknown';
      specificFaultTypes[type] = (specificFaultTypes[type] || 0) + 1;
    });
    setSpecificFaultTypeCounts(Object.entries(specificFaultTypes).map(([name, value]) => ({ name, value: value as number })));

  }, [op5Faults, controlOutages, regions, districts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Fault Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Fault Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={faultTypeCounts}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {faultTypeCounts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Faults Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Faults Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyFaultCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Faults" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* District Fault Counts */}
      <Card>
        <CardHeader>
          <CardTitle>Faults by District</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={districtFaultCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ffc658" name="Faults" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Region Fault Counts */}
      <Card>
        <CardHeader>
          <CardTitle>Faults by Region</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionFaultCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#a4de6c" name="Faults" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Unserved Energy by District */}
      <Card>
        <CardHeader>
          <CardTitle>Unserved Energy (MWh) by District</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={unservedEnergyByDistrict}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#d0ed57" name="Unserved Energy (MWh)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Average Outage Duration by District */}
      <Card>
        <CardHeader>
          <CardTitle>Avg. Outage Duration (Hours) by District</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averageOutageDurationByDistrict}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" name="Avg. Duration (Hours)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Customer Impact by District */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Impact by District</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerImpactByDistrict}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rural" fill="#8884d8" name="Rural" />
              <Bar dataKey="urban" fill="#82ca9d" name="Urban" />
              <Bar dataKey="metro" fill="#ffc658" name="Metro" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fault Resolution Times */}
      <Card>
        <CardHeader>
          <CardTitle>Fault Resolution Times (Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={faultResolutionTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#a4de6c" name="Resolution Time (Hours)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Fault Type Trends Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Fault Type Trends Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={faultTypeTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {faultTypeCounts.map((type, index) => (
                <Line
                  key={type.name}
                  type="monotone"
                  dataKey={type.name}
                  stroke={COLORS[index % COLORS.length]}
                  name={type.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Specific Fault Type Counts */}
      <Card>
        <CardHeader>
          <CardTitle>Specific Fault Type Counts</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={specificFaultTypeCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#f4756a" name="Specific Faults" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
