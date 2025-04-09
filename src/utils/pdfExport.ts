
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { VITAsset, VITInspectionChecklist } from "@/lib/types";
import { formatDate } from "@/utils/calculations";

// Add type declaration for jsPDF with autotable extensions
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
    autoTable: (options: any) => jsPDF;
    internal: {
      pageSize: {
        width: number;
        height: number;
      };
      pages: any[];
    };
    setPage: (pageNumber: number) => jsPDF;
  }
}

/**
 * Export VIT inspection data to CSV format
 */
export const exportInspectionToCsv = (inspection: VITInspectionChecklist, asset: VITAsset | null, getRegionName: (id: string) => string, getDistrictName: (id: string) => string) => {
  if (!asset) return;
  
  // Create headers
  const headers = [
    "Field",
    "Value"
  ];
  
  // Create data rows
  const dataRows = [
    ["Asset Serial Number", asset?.serialNumber || ""],
    ["Asset Type", asset?.typeOfUnit || ""],
    ["Region", asset ? getRegionName(asset.regionId) : ""],
    ["District", asset ? getDistrictName(asset.districtId) : ""],
    ["Inspection Date", formatDate(inspection.inspectionDate)],
    ["Inspector", inspection.inspectedBy],
    ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
    ["Clean & Dust Free", inspection.cleanDustFree],
    ["Protection Button Enabled", inspection.protectionButtonEnabled],
    ["Recloser Button Enabled", inspection.recloserButtonEnabled],
    ["Ground/Earth Button Enabled", inspection.groundEarthButtonEnabled],
    ["AC Power On", inspection.acPowerOn],
    ["Battery Power Low", inspection.batteryPowerLow],
    ["Handle Lock On", inspection.handleLockOn],
    ["Remote Button Enabled", inspection.remoteButtonEnabled],
    ["Gas Level Low", inspection.gasLevelLow],
    ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
    ["No Fuses Blown", inspection.noFusesBlown],
    ["No Damage to Bushings", inspection.noDamageToBushings],
    ["No Damage to HV Connections", inspection.noDamageToHVConnections],
    ["Insulators Clean", inspection.insulatorsClean],
    ["Paintwork Adequate", inspection.paintworkAdequate],
    ["PT Fuse Link Intact", inspection.ptFuseLinkIntact],
    ["No Corrosion", inspection.noCorrosion],
    ["Silica Gel Condition", inspection.silicaGelCondition],
    ["Correct Labelling", inspection.correctLabelling],
    ["Remarks", inspection.remarks]
  ];
  
  // Combine headers and data
  const csvContent = [
    headers.join(","), 
    ...dataRows.map(row => `"${row[0]}","${row[1]}"`).join("\n")
  ].join("\n");
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `vit-inspection-${asset?.serialNumber}-${inspection.inspectionDate.split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generate comprehensive PDF report for VIT inspection
 */
export const exportInspectionToPDF = (inspection: VITInspectionChecklist, asset: VITAsset | null, getRegionName: (id: string) => string, getDistrictName: (id: string) => string) => {
  if (!asset) return;

  const region = getRegionName(asset.regionId);
  const district = getDistrictName(asset.districtId);
  
  // Create PDF document
  const doc = new jsPDF();
  
  // Add title and logo
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text("VIT Inspection Comprehensive Report", 14, 20);
  
  // Add date and inspector info
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${formatDate(inspection.inspectionDate)}`, 14, 30);
  doc.text(`Inspector: ${inspection.inspectedBy}`, 14, 37);
  
  // Add asset information
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text("Asset Information", 14, 47);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Serial Number: ${asset.serialNumber}`, 14, 55);
  doc.text(`Type of Unit: ${asset.typeOfUnit}`, 14, 61);
  doc.text(`Voltage Level: ${asset.voltageLevel}`, 14, 67);
  doc.text(`Region: ${region}`, 114, 55);
  doc.text(`District: ${district}`, 114, 61);
  doc.text(`Location: ${asset.location}`, 114, 67);
  doc.text(`Status: ${asset.status}`, 114, 73);
  
  // Add inspection checklist - General Condition
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text("General Condition", 14, 83);
  
  const generalConditionItems = [
    ["Item", "Status"],
    ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
    ["Clean and Dust Free", inspection.cleanDustFree],
    ["Silica Gel Condition", inspection.silicaGelCondition],
    ["No Corrosion", inspection.noCorrosion],
    ["Paintwork Adequate", inspection.paintworkAdequate]
  ];
  
  doc.autoTable({
    startY: 87,
    head: [generalConditionItems[0]],
    body: generalConditionItems.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
    styles: { cellPadding: 3, fontSize: 9 }
  });
  
  // Add inspection checklist - Operational Status
  let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 120;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text("Operational Status", 14, finalY + 10);
  
  const operationalItems = [
    ["Item", "Status"],
    ["Protection Button Enabled", inspection.protectionButtonEnabled],
    ["Recloser Button Enabled", inspection.recloserButtonEnabled],
    ["AC Power On", inspection.acPowerOn],
    ["Battery Power Low", inspection.batteryPowerLow],
    ["Remote Button Enabled", inspection.remoteButtonEnabled]
  ];
  
  doc.autoTable({
    startY: finalY + 14,
    head: [operationalItems[0]],
    body: operationalItems.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
    styles: { cellPadding: 3, fontSize: 9 }
  });
  
  // Add inspection checklist - Safety & Protection
  finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 160;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text("Safety & Protection", 14, finalY + 10);
  
  const safetyItems = [
    ["Item", "Status"],
    ["Ground/Earth Button Enabled", inspection.groundEarthButtonEnabled],
    ["Handle Lock On", inspection.handleLockOn],
    ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
    ["Gas Level Low", inspection.gasLevelLow],
    ["Correct Labelling", inspection.correctLabelling]
  ];
  
  doc.autoTable({
    startY: finalY + 14,
    head: [safetyItems[0]],
    body: safetyItems.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
    styles: { cellPadding: 3, fontSize: 9 }
  });
  
  // Component Condition
  finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 200;
  
  // Check if we need a new page
  if (finalY > 220) {
    doc.addPage();
    finalY = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text("Component Condition", 14, finalY + 10);
  
  const componentItems = [
    ["Item", "Status"],
    ["No Fuses Blown", inspection.noFusesBlown],
    ["No Damage to Bushings", inspection.noDamageToBushings],
    ["No Damage to HV Connections", inspection.noDamageToHVConnections],
    ["Insulators Clean", inspection.insulatorsClean],
    ["PT Fuse Link Intact", inspection.ptFuseLinkIntact]
  ];
  
  doc.autoTable({
    startY: finalY + 14,
    head: [componentItems[0]],
    body: componentItems.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
    styles: { cellPadding: 3, fontSize: 9 }
  });
  
  // Remarks
  finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY : 240;
  
  if (inspection.remarks) {
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text("Remarks", 14, finalY + 10);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(inspection.remarks, 14, finalY + 20, {
      maxWidth: 180
    });
  }
  
  // Summary of Issues
  const issuesCount = Object.entries(inspection).reduce((count, [key, value]) => {
    if (key === 'rodentTermiteEncroachment' && value === 'Yes') return count + 1;
    if (key === 'batteryPowerLow' && value === 'Yes') return count + 1;
    if (key === 'gasLevelLow' && value === 'Yes') return count + 1;
    if (key === 'silicaGelCondition' && value === 'Bad') return count + 1;
    
    if (
      ['cleanDustFree', 'protectionButtonEnabled', 'recloserButtonEnabled', 
       'groundEarthButtonEnabled', 'acPowerOn', 'handleLockOn', 'remoteButtonEnabled', 
       'earthingArrangementAdequate', 'noFusesBlown', 'noDamageToBushings', 
       'noDamageToHVConnections', 'insulatorsClean', 'paintworkAdequate', 
       'ptFuseLinkIntact', 'noCorrosion', 'correctLabelling'].includes(key) && 
      value === 'No'
    ) {
      return count + 1;
    }
    
    return count;
  }, 0);
  
  // Add a new page if needed
  if ((finalY + (inspection.remarks ? 30 : 0)) > 240) {
    doc.addPage();
    finalY = 20;
  } else {
    finalY = finalY + (inspection.remarks ? 40 : 10);
  }
  
  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text("Inspection Summary", 14, finalY + 10);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total issues found: ${issuesCount}`, 14, finalY + 20);
  doc.text(`Overall assessment: ${issuesCount === 0 ? 'No issues found' : issuesCount < 3 ? 'Minor issues found' : issuesCount < 7 ? 'Moderate issues found' : 'Major issues found'}`, 14, finalY + 30);
  
  // Add timestamp and page numbers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
    doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
  }
  
  // Save PDF
  const filename = `vit-inspection-${asset.serialNumber}-${inspection.inspectionDate.split('T')[0]}.pdf`;
  doc.save(filename);
  return filename;
};
