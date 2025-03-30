
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OP5Fault, ControlSystemOutage } from "@/lib/types";

interface ReliabilityIndices {
  saidi: number;
  saifi: number;
  caidi: number;
}

interface OutageMetrics {
  unservedEnergyMWh: number;
  customersAffected: number;
}

interface AnalyticsChartsProps {
  filteredFaults: (OP5Fault | ControlSystemOutage)[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ filteredFaults }) => {

  const calculateReliabilityIndices = (faults: OP5Fault[]): ReliabilityIndices => {
    if (!faults || faults.length === 0) {
      return { saidi: 0, saifi: 0, caidi: 0 };
    }

    let totalSAIDI = 0;
    let totalSAIFI = 0;
    let totalCAIDI = 0;

    faults.forEach(fault => {
      totalSAIDI += fault.reliabilityIndices?.saidi || 0;
      totalSAIFI += fault.reliabilityIndices?.saifi || 0;
      totalCAIDI += fault.reliabilityIndices?.caidi || 0;
    });

    const avgSAIDI = totalSAIDI / faults.length;
    const avgSAIFI = totalSAIFI / faults.length;
    const avgCAIDI = totalCAIDI / faults.length;

    return {
      saidi: avgSAIDI,
      saifi: avgSAIFI,
      caidi: avgCAIDI,
    };
  };

  const calculateOutageMetrics = (outages: ControlSystemOutage[]): OutageMetrics => {
    if (!outages || outages.length === 0) {
      return { unservedEnergyMWh: 0, customersAffected: 0 };
    }

    let totalUnservedEnergy = 0;
    let totalCustomersAffected = 0;

    outages.forEach(outage => {
      totalUnservedEnergy += outage.unservedEnergyMWh || 0;
      totalCustomersAffected += (outage.customersAffected?.rural || 0) + (outage.customersAffected?.urban || 0) + (outage.customersAffected?.metro || 0);
    });

    return {
      unservedEnergyMWh: totalUnservedEnergy,
      customersAffected: totalCustomersAffected,
    };
  };

  // Type guard to filter faults
  const op5FaultsData = filteredFaults.filter((fault): fault is OP5Fault =>
    'faultLocation' in fault && 'affectedPopulation' in fault
  );

  const controlOutagesData = filteredFaults.filter((fault): fault is ControlSystemOutage =>
    'customersAffected' in fault && 'reason' in fault
  );

  const reliabilityData = calculateReliabilityIndices(op5FaultsData);
  const outageMetricsData = calculateOutageMetrics(controlOutagesData);

  const chartData = [
    { name: 'SAIDI', value: reliabilityData.saidi },
    { name: 'SAIFI', value: reliabilityData.saifi },
    { name: 'CAIDI', value: reliabilityData.caidi },
    { name: 'Unserved Energy (MWh)', value: outageMetricsData.unservedEnergyMWh },
    { name: 'Customers Affected', value: outageMetricsData.customersAffected },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsCharts;
