import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator"; // Import Separator
import { toast } from "sonner";
import { LoadMonitoringData } from "@/lib/asset-types";
import { useData } from "@/contexts/DataContext";
import { useNavigate, useParams } from "react-router-dom";
import { formatDate } from "@/utils/calculations"; // Import formatDate
import { ArrowLeft } from "lucide-react"; // For back button

// Helper component to display a detail item
const DetailItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <div className="flex flex-col space-y-1.5">
    <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
    <p className="text-base">{value ?? 'N/A'}</p>
  </div>
);


export default function LoadMonitoringDetailsPage() {
  const { getLoadMonitoringRecord } = useData();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [record, setRecord] = useState<LoadMonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id && getLoadMonitoringRecord) {
      const fetchedRecord = getLoadMonitoringRecord(id);
      if (fetchedRecord) {
        setRecord(fetchedRecord);
      } else {
        toast.error("Load monitoring record not found.");
        navigate("/asset-management/load-monitoring"); // Redirect if not found
      }
      setIsLoading(false);
    } else {
      toast.error("Invalid record ID or data context unavailable.");
      navigate("/asset-management/load-monitoring");
      setIsLoading(false);
    }
  }, [id, getLoadMonitoringRecord, navigate]);

  if (isLoading) {
    return <Layout><div>Loading record details...</div></Layout>;
  }

  if (!record) {
    // This case should ideally be handled by the redirect in useEffect,
    // but it's good practice to have a fallback.
    return <Layout><div>Record not found.</div></Layout>;
  }

 return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
           <Button variant="outline" size="icon" onClick={() => navigate("/asset-management/load-monitoring")}>
             <ArrowLeft className="h-4 w-4" />
           </Button>
           <h1 className="text-2xl font-bold tracking-tight">Load Monitoring Record Details</h1>
           <div className="w-10"></div> {/* Spacer */}
        </div>

        <div className="grid gap-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <DetailItem label="Date" value={formatDate(record.date)} />
                 <DetailItem label="Time" value={record.time} />
                 <DetailItem label="Region" value={record.region} />
                 <DetailItem label="District" value={record.district} />
                 <DetailItem label="Substation Name" value={record.substationName} />
                 <DetailItem label="Substation Number" value={record.substationNumber} />
                 <DetailItem label="Location" value={record.location} />
                 <DetailItem label="Rating (KVA)" value={record.rating} />
                 <DetailItem label="Peak Load Status" value={record.peakLoadStatus} />
              </CardContent>
            </Card>

            {/* Feeder Legs Card */}
             <Card>
              <CardHeader>
                <CardTitle>Feeder Legs Current (Amps)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {record.feederLegs?.map((leg, index) => (
                    <div key={leg.id} className="border p-4 rounded-md">
                       <Label className="block font-medium mb-3">Feeder Leg {index + 1}</Label>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <DetailItem label="Red Phase" value={leg.redPhaseCurrent.toFixed(2)} />
                           <DetailItem label="Yellow Phase" value={leg.yellowPhaseCurrent.toFixed(2)} />
                           <DetailItem label="Blue Phase" value={leg.bluePhaseCurrent.toFixed(2)} />
                           <DetailItem label="Neutral" value={leg.neutralCurrent.toFixed(2)} />
                       </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Calculated Load Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>Calculated Load Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <DetailItem label="Rated Load (A)" value={record.ratedLoad.toFixed(2)} />
                <DetailItem label="Avg. Current (A)" value={record.averageCurrent.toFixed(2)} />
                <DetailItem label="% Load" value={`${record.percentageLoad.toFixed(2)} %`} />
                <DetailItem label="Calculated Neutral (A)" value={record.calculatedNeutral.toFixed(2)} />
                <DetailItem label="10% Rated Neutral (A)" value={record.tenPercentFullLoadNeutral.toFixed(2)} />
                <DetailItem label="Red Phase Bulk (A)" value={record.redPhaseBulkLoad.toFixed(2)} />
                <DetailItem label="Yellow Phase Bulk (A)" value={record.yellowPhaseBulkLoad.toFixed(2)} />
                <DetailItem label="Blue Phase Bulk (A)" value={record.bluePhaseBulkLoad.toFixed(2)} />
              </CardContent>
            </Card>

             <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => navigate("/asset-management/load-monitoring")}>
                    Back to List
                </Button>
            </div>
        </div>
      </div>
    </Layout>
  );
}
