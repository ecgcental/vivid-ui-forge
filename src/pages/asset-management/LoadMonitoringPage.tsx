import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { LoadMonitoringData } from "@/lib/asset-types";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/calculations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccessControlWrapper } from "@/components/access-control/AccessControlWrapper";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Badge } from "@/components/ui/badge";

export default function LoadMonitoringPage() {
  const { user } = useAuth();
  const { regions, districts, loadMonitoringRecords, deleteLoadMonitoringRecord } = useData();
  const navigate = useNavigate();
  
  const [formattedPercentageLoads, setFormattedPercentageLoads] = useState<Record<string, string>>({});

  const filteredRecords = useMemo(() => {
    if (!loadMonitoringRecords) return [];
    return loadMonitoringRecords.filter(record => {
      if (user?.role === 'global_engineer' || user?.role === 'system_admin') return true;
      if (user?.role === 'regional_engineer') return record.regionId === regions.find(r => r.name === user.region)?.id;
      if (user?.role === 'district_engineer' || user?.role === 'technician') return record.districtId === districts.find(d => d.name === user.district)?.id;
      return false;
    });
  }, [loadMonitoringRecords, user, regions, districts]);

  // Format percentage loads when records change
  useEffect(() => {
    const formatted: Record<string, string> = {};
    filteredRecords.forEach(record => {
      formatted[record.id] = record.percentageLoad?.toFixed(2) ?? "0.00";
    });
    setFormattedPercentageLoads(formatted);
  }, [filteredRecords]);

  // Function to determine load status based on percentage load
  const getLoadStatus = (percentageLoad: number) => {
    if (percentageLoad >= 70) {
      return { status: "OVERLOAD", color: "bg-red-500" };
    } else if (percentageLoad >= 45) {
      return { status: "AVERAGE", color: "bg-yellow-500" };
    } else {
      return { status: "OKAY", color: "bg-green-500" };
    }
  };

  const handleView = (id: string) => {
    navigate(`/asset-management/load-monitoring-details/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/asset-management/edit-load-monitoring/${id}`);
  };

  const handleDelete = (id: string) => {
    const record = loadMonitoringRecords?.find(r => r.id === id);
    if (!record) return;

    // Check if user has permission to delete
    if (user?.role === 'global_engineer') {
      deleteLoadMonitoringRecord(id);
      toast.success("Load monitoring record deleted successfully");
      return;
    }

    if (user?.role === 'regional_engineer') {
      const userRegion = regions.find(r => r.name === user.region);
      if (userRegion && record.regionId === userRegion.id) {
        deleteLoadMonitoringRecord(id);
        toast.success("Load monitoring record deleted successfully");
        return;
      }
    }

    if (user?.role === 'district_engineer') {
      const userDistrict = districts.find(d => d.name === user.district);
      if (userDistrict && record.districtId === userDistrict.id) {
        deleteLoadMonitoringRecord(id);
        toast.success("Load monitoring record deleted successfully");
        return;
      }
    }

    toast.error("You don't have permission to delete this record");
  };

  const handleExportToPDF = async (record: LoadMonitoringData) => {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      
      // Load fonts
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Define layout constants
      const { width, height } = page.getSize();
      const margin = 50;
      const lineHeight = 20;
      const sectionSpacing = 30;
      
      let currentY = height - margin;
      
      // Add header
      page.drawText('LOAD MONITORING REPORT', {
        x: margin,
        y: currentY,
        size: 24,
        color: rgb(0, 0.2, 0.4),
        font: boldFont,
      });
      currentY -= lineHeight * 2;

      // Add report metadata
      page.drawText(`Report Date: ${formatDate(record.date)}`, {
        x: margin,
        y: currentY,
        size: 12,
        color: rgb(0.2, 0.2, 0.2),
        font: regularFont,
      });
      currentY -= lineHeight;

      // Add basic information
      const basicInfoY = currentY;
      await page.drawText("Basic Information:", { x: 50, y: currentY, size: 12, font: boldFont });
      currentY -= 20;
      await page.drawText(`Date: ${formatDate(record.date)}`, { x: 50, y: currentY, size: 10 });
      await page.drawText(`Time: ${record.time}`, { x: 300, y: currentY, size: 10 });
      currentY -= 15;
      await page.drawText(`Substation: ${record.substationName}`, { x: 50, y: currentY, size: 10 });
      await page.drawText(`Number: ${record.substationNumber}`, { x: 300, y: currentY, size: 10 });
      currentY -= 15;
      await page.drawText(`Region: ${record.region}`, { x: 50, y: currentY, size: 10 });
      await page.drawText(`District: ${record.district}`, { x: 300, y: currentY, size: 10 });
      currentY -= 15;
      await page.drawText(`Location: ${record.location}`, { x: 50, y: currentY, size: 10 });
      await page.drawText(`Rating: ${record.rating} KVA`, { x: 300, y: currentY, size: 10 });
      currentY -= 15;
      await page.drawText(`Peak Load Status: ${record.peakLoadStatus}`, { x: 50, y: currentY, size: 10 });
      await page.drawText(`Created By: ${record.createdBy?.name || 'Unknown'}`, { x: 300, y: currentY, size: 10 });
      currentY -= 25;

      // Add feeder legs information
      currentY -= sectionSpacing;
      page.drawText('Feeder Legs Information:', {
        x: margin,
        y: currentY,
        size: 14,
        color: rgb(0, 0.2, 0.4),
        font: boldFont,
      });
      currentY -= lineHeight;

      record.feederLegs.forEach((leg, index) => {
        if (currentY < margin + lineHeight * 5) {
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          currentY = height - margin;
        }

        page.drawText(`Feeder Leg ${index + 1}:`, {
          x: margin,
          y: currentY,
          size: 12,
          color: rgb(0.2, 0.2, 0.2),
          font: boldFont,
        });
        currentY -= lineHeight;

        const legInfo = [
          ['Red Phase Current', `${leg.redPhaseCurrent.toFixed(2)} A`],
          ['Yellow Phase Current', `${leg.yellowPhaseCurrent.toFixed(2)} A`],
          ['Blue Phase Current', `${leg.bluePhaseCurrent.toFixed(2)} A`],
          ['Neutral Current', `${leg.neutralCurrent.toFixed(2)} A`]
        ];

        legInfo.forEach(([label, value]) => {
          page.drawText(`${label}: ${value}`, {
            x: margin + 20,
            y: currentY,
            size: 12,
            color: rgb(0.2, 0.2, 0.2),
            font: regularFont,
          });
          currentY -= lineHeight;
        });

        currentY -= lineHeight;
      });

      // Add calculated load information
      currentY -= sectionSpacing;
      page.drawText('Calculated Load Information:', {
        x: margin,
        y: currentY,
        size: 14,
        color: rgb(0, 0.2, 0.4),
        font: boldFont,
      });
      currentY -= lineHeight;

      const loadInfo = [
        ['Rated Load', `${record.ratedLoad.toFixed(2)} A`],
        ['Red Phase Bulk Load', `${record.redPhaseBulkLoad.toFixed(2)} A`],
        ['Yellow Phase Bulk Load', `${record.yellowPhaseBulkLoad.toFixed(2)} A`],
        ['Blue Phase Bulk Load', `${record.bluePhaseBulkLoad.toFixed(2)} A`],
        ['Average Current', `${record.averageCurrent.toFixed(2)} A`],
        ['Percentage Load', `${record.percentageLoad.toFixed(2)}%`],
        ['10% Rated Neutral', `${record.tenPercentFullLoadNeutral.toFixed(2)} A`],
        ['Calculated Neutral', `${record.calculatedNeutral.toFixed(2)} A`]
      ];

      loadInfo.forEach(([label, value]) => {
        page.drawText(`${label}: ${value}`, {
          x: margin,
          y: currentY,
          size: 12,
          color: rgb(0.2, 0.2, 0.2),
          font: regularFont,
        });
        currentY -= lineHeight;
      });

      // Add load status
      currentY -= lineHeight;
      const loadStatus = getLoadStatus(record.percentageLoad);
      page.drawText(`Load Status: ${loadStatus.status}`, {
        x: margin,
        y: currentY,
        size: 14,
        color: loadStatus.status === "OVERLOAD" ? rgb(0.8, 0.2, 0.2) : 
               loadStatus.status === "AVERAGE" ? rgb(0.8, 0.6, 0.2) : 
               rgb(0.2, 0.6, 0.2),
        font: boldFont,
      });

      // Add footer with page numbers
      const pages = pdfDoc.getPages();
      pages.forEach((page, index) => {
        page.drawText(`Page ${index + 1} of ${pages.length}`, {
          x: width - margin - 50,
          y: margin - 20,
          size: 10,
          color: rgb(0.5, 0.5, 0.5),
          font: regularFont,
        });
      });

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `load-monitoring-${record.substationNumber}-${formatDate(record.date)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF report generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const handleExportToCSV = (record: LoadMonitoringData) => {
    // Create CSV content
    const csvContent = [
      ["Load Monitoring Report"],
      ["Date", formatDate(record.date)],
      ["Time", record.time],
      ["Substation Name", record.substationName],
      ["Substation Number", record.substationNumber],
      ["Region", record.region],
      ["District", record.district],
      ["Location", record.location],
      ["Rating (KVA)", record.rating],
      ["Peak Load Status", record.peakLoadStatus],
      [],
      ["Feeder Legs Information"],
      ["Leg", "Red Phase (A)", "Yellow Phase (A)", "Blue Phase (A)", "Neutral (A)"]
    ];

    // Add feeder legs data
    record.feederLegs.forEach((leg, index) => {
      csvContent.push([
        `Leg ${index + 1}`,
        leg.redPhaseCurrent.toFixed(2),
        leg.yellowPhaseCurrent.toFixed(2),
        leg.bluePhaseCurrent.toFixed(2),
        leg.neutralCurrent.toFixed(2)
      ]);
    });

    csvContent.push(
      [],
      ["Calculated Load Information"],
      ["Metric", "Value"],
      ["Rated Load (A)", record.ratedLoad.toFixed(2)],
      ["Red Phase Bulk Load (A)", record.redPhaseBulkLoad.toFixed(2)],
      ["Yellow Phase Bulk Load (A)", record.yellowPhaseBulkLoad.toFixed(2)],
      ["Blue Phase Bulk Load (A)", record.bluePhaseBulkLoad.toFixed(2)],
      ["Average Current (A)", record.averageCurrent.toFixed(2)],
      ["Percentage Load (%)", record.percentageLoad.toFixed(2)],
      ["10% Rated Neutral (A)", record.tenPercentFullLoadNeutral.toFixed(2)],
      ["Calculated Neutral (A)", record.calculatedNeutral.toFixed(2)]
    );

    // Add load status
    const loadStatus = getLoadStatus(record.percentageLoad);
    csvContent.push(
      [],
      ["Load Status", loadStatus.status]
    );

    // Convert to CSV string
    const csvString = csvContent.map(row => row.join(",")).join("\n");
    
    // Create and download file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `load-monitoring-${record.substationNumber}-${formatDate(record.date)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV report generated successfully");
  };

  const handleExportAllToCSV = () => {
    // Create CSV content
    const csvContent = [
      ["Load Monitoring Records Report"],
      ["Generated on", new Date().toLocaleDateString()],
      [],
      ["Record Details"]
    ];

    // Add each record with all details
    filteredRecords.forEach((record, index) => {
      // Add a separator between records
      if (index > 0) {
        csvContent.push([]);
      }

      // Add basic information
      csvContent.push(
        ["Record #", (index + 1).toString()],
        ["Date", formatDate(record.date)],
        ["Time", record.time],
        ["Substation Name", record.substationName],
        ["Substation Number", record.substationNumber],
        ["Region", record.region],
        ["District", record.district],
        ["Location", record.location],
        ["Rating (KVA)", record.rating.toString()],
        ["Peak Load Status", record.peakLoadStatus],
        ["Created By", record.createdBy?.name || 'Unknown'],
        [],
        ["Feeder Legs Information"],
        ["Leg", "Red Phase (A)", "Yellow Phase (A)", "Blue Phase (A)", "Neutral (A)"]
      );

      // Add feeder legs data
      record.feederLegs.forEach((leg, legIndex) => {
        csvContent.push([
          `Leg ${legIndex + 1}`,
          leg.redPhaseCurrent.toFixed(2),
          leg.yellowPhaseCurrent.toFixed(2),
          leg.bluePhaseCurrent.toFixed(2),
          leg.neutralCurrent.toFixed(2)
        ]);
      });

      // Add calculated load information
      csvContent.push(
        [],
        ["Calculated Load Information"],
        ["Metric", "Value"],
        ["Rated Load (A)", record.ratedLoad.toFixed(2)],
        ["Red Phase Bulk Load (A)", record.redPhaseBulkLoad.toFixed(2)],
        ["Yellow Phase Bulk Load (A)", record.yellowPhaseBulkLoad.toFixed(2)],
        ["Blue Phase Bulk Load (A)", record.bluePhaseBulkLoad.toFixed(2)],
        ["Average Current (A)", record.averageCurrent.toFixed(2)],
        ["Percentage Load (%)", record.percentageLoad.toFixed(2)],
        ["10% Rated Neutral (A)", record.tenPercentFullLoadNeutral.toFixed(2)],
        ["Calculated Neutral (A)", record.calculatedNeutral.toFixed(2)]
      );

      // Add load status
      const loadStatus = getLoadStatus(record.percentageLoad);
      csvContent.push(
        [],
        ["Load Status", loadStatus.status]
      );
    });

    // Convert to CSV string
    const csvString = csvContent.map(row => row.join(",")).join("\n");
    
    // Create and download file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `load-monitoring-records-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("All records exported to CSV successfully");
  };

  return (
    <AccessControlWrapper type="load-monitoring">
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Load Monitoring</h1>
            <div className="flex gap-2">
              <Button onClick={handleExportAllToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export All to CSV
              </Button>
              <Button onClick={() => navigate('/asset-management/create-load-monitoring')}>
                Add New Record
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <Table>
                <TableCaption>List of load monitoring records</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Substation</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Rating (MW)</TableHead>
                    <TableHead>Load (%)</TableHead>
                    <TableHead>Load Status</TableHead>
                    <TableHead>Peak Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const region = regions.find(r => r.id === record.regionId);
                    const district = districts.find(d => d.id === record.districtId);
                    const loadStatus = getLoadStatus(record.percentageLoad);
                    
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{record.substationName}</TableCell>
                        <TableCell>{region?.name || 'Unknown'}</TableCell>
                        <TableCell>{district?.name || 'Unknown'}</TableCell>
                        <TableCell>{record.rating}</TableCell>
                        <TableCell>{formattedPercentageLoads[record.id] ?? "0.00"}</TableCell>
                        <TableCell>
                          <Badge className={loadStatus.color}>
                            {loadStatus.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.peakLoadStatus}</TableCell>
                        <TableCell>{record.createdBy?.name || 'Unknown'}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleView(record.id)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportToPDF(record)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Export to PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExportToCSV(record)}>
                                <Download className="mr-2 h-4 w-4" />
                                Export to CSV
                              </DropdownMenuItem>
                              {(user?.role === 'global_engineer' || 
                                (user?.role === 'regional_engineer' && record.regionId === regions.find(r => r.name === user.region)?.id) ||
                                (user?.role === 'district_engineer' && record.districtId === districts.find(d => d.name === user.district)?.id)) && (
                                <>
                                  <DropdownMenuItem onClick={() => handleEdit(record.id)}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(record.id)}
                                    className="text-red-600"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AccessControlWrapper>
  );
}
