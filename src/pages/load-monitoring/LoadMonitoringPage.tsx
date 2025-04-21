import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DataTableView } from "@/components/data-table/data-table-view"
import { LoadMonitoringColumnDef } from "@/components/data-table/column-defs";
import { Button } from "@/components/ui/button";
import { useData } from '@/contexts/DataContext';
import { LoadMonitoringData } from '@/lib/asset-types';
import { AuthContext } from '@/contexts/AuthContext';

const columns: LoadMonitoringColumnDef[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "district",
    header: "District",
  },
  {
    accessorKey: "feeder",
    header: "Feeder",
  },
  {
    accessorKey: "voltage",
    header: "Voltage (kV)",
  },
  {
    accessorKey: "current",
    header: "Current (A)",
  },
  {
    accessorKey: "powerFactor",
    header: "Power Factor",
  },
  {
    accessorKey: "load",
    header: "Load (MW)",
  },
];

const LoadMonitoringPage = () => {
  const [data, setData] = useState<LoadMonitoringData[]>([]);
  const { loadMonitoringRecords, setLoadMonitoringRecords } = useData();
  const { useAuth } = useContext(AuthContext); const { user } = useAuth();

  useEffect(() => {
    if (loadMonitoringRecords) {
      setData(loadMonitoringRecords);
    }
  }, [loadMonitoringRecords]);

  return (
    <div>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Load Monitoring Records</h1>
          <Link to="/load-monitoring/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </Link>
        </div>
        <DataTableView columns={columns} data={data} setData={setData} setRecords={setLoadMonitoringRecords} />
      </div>
    </div>
  );
};

export default LoadMonitoringPage;
