import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileEdit, Trash2, Eye, FileText, Download, Pencil } from "lucide-react";
import { OverheadLineInspection } from "@/lib/types";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/components/ui/sonner";
import { ColumnDef } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface OverheadLineInspectionsTableProps {
  inspections: OverheadLineInspection[];
  onEdit: (inspection: OverheadLineInspection) => void;
  onDelete: (inspection: OverheadLineInspection) => void;
  onView: (inspection: OverheadLineInspection) => void;
  userRole?: string;
}

export function OverheadLineInspectionsTable({
  inspections,
  onEdit,
  onDelete,
  onView,
  userRole
}: OverheadLineInspectionsTableProps) {
  const { regions, districts } = useData();
  const [sortedInspections, setSortedInspections] = useState([...inspections]);

  // Update sorted inspections whenever the inspections prop changes
  useEffect(() => {
    setSortedInspections([...inspections]);
  }, [inspections]);

  const getRegionName = (regionId: string) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : "Unknown";
  };

  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : "Unknown";
  };

  const exportToPDF = (inspection: OverheadLineInspection) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("Overhead Line Inspection Report", 14, 15);
    
    // Add inspection date
    doc.setFontSize(12);
    doc.text(`Date: ${format(new Date(inspection.createdAt), "dd/MM/yyyy")}`, 14, 25);
    
    // Add basic information
    const region = regions.find(r => r.id === inspection.regionId)?.name || "Unknown";
    const district = districts.find(d => d.id === inspection.districtId)?.name || "Unknown";
    
    const basicInfo = [
      ["Region", region],
      ["District", district],
      ["Feeder Name", inspection.feederName || "-"],
      ["Voltage Level", inspection.voltageLevel || "-"],
      ["Reference Pole", inspection.referencePole || "-"],
      ["Pole ID", inspection.poleId || "-"],
      ["Pole Height", inspection.poleHeight || "-"],
      ["Pole Type", inspection.poleType || "-"],
      ["Pole Location", inspection.poleLocation || "-"],
      ["Status", inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)],
      ["Location", `${inspection.latitude}, ${inspection.longitude}`]
    ];
    
    autoTable(doc, {
      startY: 35,
      head: [["Basic Information", ""]],
      body: basicInfo,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    });

    // Add inspector information
    const inspectorInfo = [
      ["Inspector Name", inspection.inspector.name || "-"],
      ["Inspector Email", inspection.inspector.email || "-"],
      ["Inspector Phone", inspection.inspector.phone || "-"]
    ];
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Inspector Information", ""]],
      body: inspectorInfo,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    });
    
    // Add condition details
    const conditionDetails = [
      ["Component", "Condition", "Notes"],
      ["Pole", 
        `${inspection.poleCondition.tilted ? "Tilted" : ""} ${inspection.poleCondition.rotten ? "Rotten" : ""} ${inspection.poleCondition.burnt ? "Burnt" : ""} ${inspection.poleCondition.substandard ? "Substandard" : ""} ${inspection.poleCondition.conflictWithLV ? "Conflict with LV" : ""}`,
        inspection.poleCondition.notes || "-"
      ],
      ["Stay", 
        `${inspection.stayCondition.requiredButNotAvailable ? "Required but not available" : ""} ${inspection.stayCondition.cut ? "Cut" : ""} ${inspection.stayCondition.misaligned ? "Misaligned" : ""} ${inspection.stayCondition.defectiveStay ? "Defective Stay" : ""}`,
        inspection.stayCondition.notes || "-"
      ],
      ["Cross Arm", 
        `${inspection.crossArmCondition.misaligned ? "Misaligned" : ""} ${inspection.crossArmCondition.bend ? "Bend" : ""} ${inspection.crossArmCondition.corroded ? "Corroded" : ""} ${inspection.crossArmCondition.substandard ? "Substandard" : ""} ${inspection.crossArmCondition.others ? "Others" : ""}`,
        inspection.crossArmCondition.notes || "-"
      ],
      ["Insulator", 
        `${inspection.insulatorCondition.brokenOrCracked ? "Broken/Cracked" : ""} ${inspection.insulatorCondition.burntOrFlashOver ? "Burnt/Flash over" : ""} ${inspection.insulatorCondition.shattered ? "Shattered" : ""} ${inspection.insulatorCondition.defectiveBinding ? "Defective Binding" : ""}`,
        inspection.insulatorCondition.notes || "-"
      ],
      ["Conductor", 
        `${inspection.conductorCondition.looseConnectors ? "Loose Connectors" : ""} ${inspection.conductorCondition.weakJumpers ? "Weak Jumpers" : ""} ${inspection.conductorCondition.burntLugs ? "Burnt Lugs" : ""} ${inspection.conductorCondition.saggedLine ? "Sagged Line" : ""} ${inspection.conductorCondition.undersized ? "Undersized" : ""} ${inspection.conductorCondition.linked ? "Linked" : ""}`,
        inspection.conductorCondition.notes || "-"
      ],
      ["Lightning Arrester", 
        `${inspection.lightningArresterCondition.brokenOrCracked ? "Broken/Cracked" : ""} ${inspection.lightningArresterCondition.flashOver ? "Flash over" : ""} ${inspection.lightningArresterCondition.missing ? "Missing" : ""} ${inspection.lightningArresterCondition.noEarthing ? "No Earthing" : ""} ${inspection.lightningArresterCondition.byPassed ? "By-passed" : ""} ${inspection.lightningArresterCondition.noArrester ? "No Arrester" : ""}`,
        inspection.lightningArresterCondition.notes || "-"
      ],
      ["Drop Out Fuse", 
        `${inspection.dropOutFuseCondition.brokenOrCracked ? "Broken/Cracked" : ""} ${inspection.dropOutFuseCondition.flashOver ? "Flash over" : ""} ${inspection.dropOutFuseCondition.insufficientClearance ? "Insufficient Clearance" : ""} ${inspection.dropOutFuseCondition.looseOrNoEarthing ? "Loose or No Earthing" : ""} ${inspection.dropOutFuseCondition.corroded ? "Corroded" : ""} ${inspection.dropOutFuseCondition.linkedHVFuses ? "Linked HV Fuses" : ""} ${inspection.dropOutFuseCondition.others ? "Others" : ""}`,
        inspection.dropOutFuseCondition.notes || "-"
      ],
      ["Transformer", 
        `${inspection.transformerCondition.leakingOil ? "Leaking Oil" : ""} ${inspection.transformerCondition.missingEarthLeads ? "Missing Earth leads" : ""} ${inspection.transformerCondition.linkedHVFuses ? "Linked HV Fuses" : ""} ${inspection.transformerCondition.rustedTank ? "Rusted Tank" : ""} ${inspection.transformerCondition.crackedBushing ? "Cracked Bushing" : ""} ${inspection.transformerCondition.others ? "Others" : ""}`,
        inspection.transformerCondition.notes || "-"
      ],
      ["Recloser", 
        `${inspection.recloserCondition.lowGasLevel ? "Low Gas Level" : ""} ${inspection.recloserCondition.lowBatteryLevel ? "Low Battery Level" : ""} ${inspection.recloserCondition.burntVoltageTransformers ? "Burnt Voltage Transformers" : ""} ${inspection.recloserCondition.protectionDisabled ? "Protection Disabled" : ""} ${inspection.recloserCondition.byPassed ? "By-passed" : ""} ${inspection.recloserCondition.others ? "Others" : ""}`,
        inspection.recloserCondition.notes || "-"
      ]
    ];
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [conditionDetails[0]],
      body: conditionDetails.slice(1),
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    });
    
    // Add additional notes if any
    if (inspection.additionalNotes) {
      doc.text("Additional Notes:", 14, (doc as any).lastAutoTable.finalY + 20);
      doc.text(inspection.additionalNotes, 14, (doc as any).lastAutoTable.finalY + 30);
    }
    
    // Save the PDF
    doc.save(`inspection-report-${inspection.id}.pdf`);
    toast.success("PDF report generated successfully");
  };

  const exportToCSV = (inspection: OverheadLineInspection) => {
    const region = regions.find(r => r.id === inspection.regionId)?.name || "Unknown";
    const district = districts.find(d => d.id === inspection.districtId)?.name || "Unknown";
    
    // Create CSV content with all inspection details
    const csvContent = [
      ["OVERHEAD LINE INSPECTION REPORT"],
      ["Date", format(new Date(inspection.createdAt), "dd/MM/yyyy")],
      ["Last Updated", format(new Date(inspection.updatedAt), "dd/MM/yyyy")],
      [],
      ["BASIC INFORMATION"],
      ["Region", region],
      ["District", district],
      ["Feeder Name", inspection.feederName || "-"],
      ["Voltage Level", inspection.voltageLevel || "-"],
      ["Reference Pole", inspection.referencePole || "-"],
      ["Pole ID", inspection.poleId || "-"],
      ["Pole Height", inspection.poleHeight || "-"],
      ["Pole Type", inspection.poleType || "-"],
      ["Pole Location", inspection.poleLocation || "-"],
      ["Status", inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)],
      [],
      ["LOCATION INFORMATION"],
      ["Latitude", inspection.latitude],
      ["Longitude", inspection.longitude],
      [],
      ["POLE CONDITION"],
      ["Tilted", inspection.poleCondition.tilted ? "Yes" : "No"],
      ["Rotten", inspection.poleCondition.rotten ? "Yes" : "No"],
      ["Burnt", inspection.poleCondition.burnt ? "Yes" : "No"],
      ["Substandard", inspection.poleCondition.substandard ? "Yes" : "No"],
      ["Conflict with LV", inspection.poleCondition.conflictWithLV ? "Yes" : "No"],
      ["Notes", inspection.poleCondition.notes || "-"],
      [],
      ["STAY CONDITION"],
      ["Required but not available", inspection.stayCondition.requiredButNotAvailable ? "Yes" : "No"],
      ["Cut", inspection.stayCondition.cut ? "Yes" : "No"],
      ["Misaligned", inspection.stayCondition.misaligned ? "Yes" : "No"],
      ["Defective Stay", inspection.stayCondition.defectiveStay ? "Yes" : "No"],
      ["Notes", inspection.stayCondition.notes || "-"],
      [],
      ["CROSS ARM CONDITION"],
      ["Misaligned", inspection.crossArmCondition.misaligned ? "Yes" : "No"],
      ["Bend", inspection.crossArmCondition.bend ? "Yes" : "No"],
      ["Corroded", inspection.crossArmCondition.corroded ? "Yes" : "No"],
      ["Substandard", inspection.crossArmCondition.substandard ? "Yes" : "No"],
      ["Others", inspection.crossArmCondition.others ? "Yes" : "No"],
      ["Notes", inspection.crossArmCondition.notes || "-"],
      [],
      ["INSULATOR CONDITION"],
      ["Broken/Cracked", inspection.insulatorCondition.brokenOrCracked ? "Yes" : "No"],
      ["Burnt/Flash over", inspection.insulatorCondition.burntOrFlashOver ? "Yes" : "No"],
      ["Shattered", inspection.insulatorCondition.shattered ? "Yes" : "No"],
      ["Defective Binding", inspection.insulatorCondition.defectiveBinding ? "Yes" : "No"],
      ["Notes", inspection.insulatorCondition.notes || "-"],
      [],
      ["CONDUCTOR CONDITION"],
      ["Loose Connectors", inspection.conductorCondition.looseConnectors ? "Yes" : "No"],
      ["Weak Jumpers", inspection.conductorCondition.weakJumpers ? "Yes" : "No"],
      ["Burnt Lugs", inspection.conductorCondition.burntLugs ? "Yes" : "No"],
      ["Sagged Line", inspection.conductorCondition.saggedLine ? "Yes" : "No"],
      ["Undersized", inspection.conductorCondition.undersized ? "Yes" : "No"],
      ["Linked", inspection.conductorCondition.linked ? "Yes" : "No"],
      ["Notes", inspection.conductorCondition.notes || "-"],
      [],
      ["LIGHTNING ARRESTER CONDITION"],
      ["Broken/Cracked", inspection.lightningArresterCondition.brokenOrCracked ? "Yes" : "No"],
      ["Flash over", inspection.lightningArresterCondition.flashOver ? "Yes" : "No"],
      ["Missing", inspection.lightningArresterCondition.missing ? "Yes" : "No"],
      ["No Earthing", inspection.lightningArresterCondition.noEarthing ? "Yes" : "No"],
      ["By-passed", inspection.lightningArresterCondition.byPassed ? "Yes" : "No"],
      ["No Arrester", inspection.lightningArresterCondition.noArrester ? "Yes" : "No"],
      ["Notes", inspection.lightningArresterCondition.notes || "-"],
      [],
      ["DROP OUT FUSE CONDITION"],
      ["Broken/Cracked", inspection.dropOutFuseCondition.brokenOrCracked ? "Yes" : "No"],
      ["Flash over", inspection.dropOutFuseCondition.flashOver ? "Yes" : "No"],
      ["Insufficient Clearance", inspection.dropOutFuseCondition.insufficientClearance ? "Yes" : "No"],
      ["Loose or No Earthing", inspection.dropOutFuseCondition.looseOrNoEarthing ? "Yes" : "No"],
      ["Corroded", inspection.dropOutFuseCondition.corroded ? "Yes" : "No"],
      ["Linked HV Fuses", inspection.dropOutFuseCondition.linkedHVFuses ? "Yes" : "No"],
      ["Others", inspection.dropOutFuseCondition.others ? "Yes" : "No"],
      ["Notes", inspection.dropOutFuseCondition.notes || "-"],
      [],
      ["TRANSFORMER CONDITION"],
      ["Leaking Oil", inspection.transformerCondition.leakingOil ? "Yes" : "No"],
      ["Missing Earth leads", inspection.transformerCondition.missingEarthLeads ? "Yes" : "No"],
      ["Linked HV Fuses", inspection.transformerCondition.linkedHVFuses ? "Yes" : "No"],
      ["Rusted Tank", inspection.transformerCondition.rustedTank ? "Yes" : "No"],
      ["Cracked Bushing", inspection.transformerCondition.crackedBushing ? "Yes" : "No"],
      ["Others", inspection.transformerCondition.others ? "Yes" : "No"],
      ["Notes", inspection.transformerCondition.notes || "-"],
      [],
      ["RECLOSER CONDITION"],
      ["Low Gas Level", inspection.recloserCondition.lowGasLevel ? "Yes" : "No"],
      ["Low Battery Level", inspection.recloserCondition.lowBatteryLevel ? "Yes" : "No"],
      ["Burnt Voltage Transformers", inspection.recloserCondition.burntVoltageTransformers ? "Yes" : "No"],
      ["Protection Disabled", inspection.recloserCondition.protectionDisabled ? "Yes" : "No"],
      ["By-passed", inspection.recloserCondition.byPassed ? "Yes" : "No"],
      ["Others", inspection.recloserCondition.others ? "Yes" : "No"],
      ["Notes", inspection.recloserCondition.notes || "-"],
      [],
      ["ADDITIONAL NOTES"],
      [inspection.additionalNotes || "No additional notes"],
      [],
      ["IMAGES"],
      ...(inspection.images.length > 0 
        ? inspection.images.map(image => [image])
        : [["No images attached"]]
      )
    ];
    
    // Convert to CSV string with proper escaping
    const csvString = csvContent
      .map(row => row
        .map(cell => {
          // Escape commas, quotes, and newlines
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(',')
      )
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `inspection-report-${inspection.id}-${format(new Date(inspection.createdAt), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV report generated successfully");
  };

  const exportAllToCSV = () => {
    // Create CSV content with all inspections
    const csvContent = [
      ["OVERHEAD LINE INSPECTIONS REPORT"],
      ["Generated Date", format(new Date(), "dd/MM/yyyy HH:mm:ss")],
      ["Total Inspections", inspections.length],
      [],
      ["INSPECTION LIST"],
      [
        "ID",
        "Date",
        "Last Updated",
        "Region",
        "District",
        "Feeder Name",
        "Voltage Level",
        "Reference Pole",
        "Status",
        "Latitude",
        "Longitude",
        "Pole Leaning",
        "Pole Damaged",
        "Pole Rotted",
        "Pole Notes",
        "Stay Loose",
        "Stay Damaged",
        "Stay Misaligned",
        "Stay Notes",
        "Cross Arm Damaged",
        "Cross Arm Rotted",
        "Cross Arm Misaligned",
        "Cross Arm Notes",
        "Insulator Broken",
        "Insulator Cracked",
        "Insulator Contaminated",
        "Insulator Notes",
        "Conductor Broken",
        "Conductor Loose Connections",
        "Conductor Tree Touching",
        "Conductor Notes",
        "Additional Notes",
        "Images Count"
      ],
      ...inspections.map(inspection => {
        const region = regions.find(r => r.id === inspection.regionId)?.name || "Unknown";
        const district = districts.find(d => d.id === inspection.districtId)?.name || "Unknown";
        
        return [
          inspection.id,
          format(new Date(inspection.createdAt), "dd/MM/yyyy"),
          format(new Date(inspection.updatedAt), "dd/MM/yyyy"),
          region,
          district,
          inspection.feederName,
          inspection.voltageLevel,
          inspection.referencePole,
          inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1),
          inspection.latitude,
          inspection.longitude,
          inspection.poleCondition.leaning ? "Yes" : "No",
          inspection.poleCondition.damaged ? "Yes" : "No",
          inspection.poleCondition.rotted ? "Yes" : "No",
          inspection.poleCondition.notes,
          inspection.stayCondition.loose ? "Yes" : "No",
          inspection.stayCondition.damaged ? "Yes" : "No",
          inspection.stayCondition.misaligned ? "Yes" : "No",
          inspection.stayCondition.notes,
          inspection.crossArmCondition.damaged ? "Yes" : "No",
          inspection.crossArmCondition.rotted ? "Yes" : "No",
          inspection.crossArmCondition.misaligned ? "Yes" : "No",
          inspection.crossArmCondition.notes,
          inspection.insulatorCondition.broken ? "Yes" : "No",
          inspection.insulatorCondition.cracked ? "Yes" : "No",
          inspection.insulatorCondition.contaminated ? "Yes" : "No",
          inspection.insulatorCondition.notes,
          inspection.conductorCondition.broken ? "Yes" : "No",
          inspection.conductorCondition.looseConnections ? "Yes" : "No",
          inspection.conductorCondition.treeTouching ? "Yes" : "No",
          inspection.conductorCondition.notes,
          inspection.additionalNotes || "",
          inspection.images.length
        ];
      })
    ];
    
    // Convert to CSV string with proper escaping
    const csvString = csvContent
      .map(row => row
        .map(cell => {
          // Escape commas, quotes, and newlines
          if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(',')
      )
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `all-inspections-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("All inspections exported to CSV successfully");
  };

  const columns: ColumnDef<OverheadLineInspection>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div>{format(new Date(row.getValue("createdAt")), "dd/MM/yyyy")}</div>
      ),
    },
    {
      accessorKey: "regionId",
      header: "Region",
      cell: ({ row }) => <div>{getRegionName(row.getValue("regionId"))}</div>,
    },
    {
      accessorKey: "districtId",
      header: "District",
      cell: ({ row }) => <div>{getDistrictName(row.getValue("districtId"))}</div>,
    },
    {
      accessorKey: "feederName",
      header: "Feeder Name",
      cell: ({ row }) => <div>{row.getValue("feederName") || "-"}</div>,
    },
    {
      accessorKey: "voltageLevel",
      header: "Voltage Level",
      cell: ({ row }) => <div>{row.getValue("voltageLevel") || "-"}</div>,
    },
    {
      accessorKey: "referencePole",
      header: "Reference Pole",
      cell: ({ row }) => <div>{row.getValue("referencePole") || "-"}</div>,
    },
    {
      accessorKey: "poleId",
      header: "Pole ID",
      cell: ({ row }) => <div>{row.getValue("poleId") || "-"}</div>,
    },
    {
      accessorKey: "poleHeight",
      header: "Pole Height",
      cell: ({ row }) => <div>{row.getValue("poleHeight") || "-"}</div>,
    },
    {
      accessorKey: "poleType",
      header: "Pole Type",
      cell: ({ row }) => <div>{row.getValue("poleType") || "-"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            className={
              status === "completed"
                ? "bg-green-500"
                : status === "in-progress"
                ? "bg-yellow-500"
                : "bg-gray-500"
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const inspection = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(inspection)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(inspection)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToPDF(inspection)}>
                <FileText className="mr-2 h-4 w-4" />
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportToCSV(inspection)}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(inspection)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="rounded-md border">
      <div className="flex justify-end p-4">
        <Button onClick={exportAllToCSV} variant="outline" className="mr-2">
          <Download className="mr-2 h-4 w-4" />
          Export All to CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Feeder Name</TableHead>
            <TableHead>Voltage Level</TableHead>
            <TableHead>Reference Pole</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedInspections.map((inspection) => (
            <TableRow key={inspection.id}>
              <TableCell>
                {format(new Date(inspection.createdAt), "dd/MM/yyyy")}
              </TableCell>
              <TableCell>{getRegionName(inspection.regionId)}</TableCell>
              <TableCell>{getDistrictName(inspection.districtId)}</TableCell>
              <TableCell>{inspection.feederName}</TableCell>
              <TableCell>{inspection.voltageLevel}</TableCell>
              <TableCell>{inspection.referencePole}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div
                    className={`h-2.5 w-2.5 rounded-full mr-2 ${
                      inspection.status === "completed"
                        ? "bg-green-500"
                        : inspection.status === "in-progress"
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  />
                  {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onView(inspection)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(inspection)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportToPDF(inspection)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Export to PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportToCSV(inspection)}>
                      <Download className="mr-2 h-4 w-4" />
                      Export to CSV
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(inspection)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {inspections.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No inspections found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 