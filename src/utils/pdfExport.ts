import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { VITAsset, VITInspectionChecklist, SubstationInspection } from "@/lib/types";
import { formatDate } from "@/utils/calculations";
import { format } from 'date-fns';

// Add type declaration for jsPDF with autotable extensions
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
    autoTable: (options: any) => jsPDF;
    internal: {
      events: PubSub;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      pages: number[];
      getEncryptor: (objectId: number) => (data: string) => string;
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
export const exportInspectionToPDF = async (inspection: VITInspectionChecklist, asset: VITAsset | null, getRegionName: (id: string) => string, getDistrictName: (id: string) => string) => {
  if (!asset) return;

  const region = getRegionName(asset.regionId);
  const district = getDistrictName(asset.districtId);
  
  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add title and logo
  const titlePage = pdfDoc.addPage([600, 400]);
  const { width, height } = titlePage.getSize();
  const fontSize = 30;

  titlePage.drawText('VIT Inspection Report', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    color: rgb(0, 0.53, 0.71),
  });
  
  // Add date and inspector info
  const datePage = pdfDoc.addPage([600, 400]);
  datePage.drawText(`Date: ${formatDate(inspection.inspectionDate)}`, {
    x: 50,
    y: height - 3 * fontSize,
    size: fontSize,
    color: rgb(0, 0, 0),
  });

  const inspectorPage = pdfDoc.addPage([600, 400]);
  inspectorPage.drawText(`Inspector: ${inspection.inspectedBy}`, {
    x: 50,
    y: height - 2 * fontSize,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  
  // Add asset information
  const assetInfoPage = pdfDoc.addPage([600, 400]);
  assetInfoPage.drawText("Asset Information", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  assetInfoPage.drawText(`Serial Number: ${asset.serialNumber}`, {
    x: 50,
    y: 250,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Type of Unit: ${asset.typeOfUnit}`, {
    x: 50,
    y: 230,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Voltage Level: ${asset.voltageLevel}`, {
    x: 50,
    y: 210,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Region: ${region}`, {
    x: 300,
    y: 250,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`District: ${district}`, {
    x: 300,
    y: 230,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Location: ${asset.location}`, {
    x: 300,
    y: 210,
    size: 14,
    color: rgb(0, 0, 0),
  });
  assetInfoPage.drawText(`Status: ${asset.status}`, {
    x: 300,
    y: 190,
    size: 14,
    color: rgb(0, 0, 0),
  });
  
  // Add inspection checklist - General Condition
  const generalConditionPage = pdfDoc.addPage([600, 400]);
  generalConditionPage.drawText("General Condition", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table header
  generalConditionPage.drawText("Item", {
    x: 50,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  generalConditionPage.drawText("Status", {
    x: 300,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  // Draw header background
  generalConditionPage.drawRectangle({
    x: 50,
    y: 250,
    width: 500,
    height: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table rows
  let yPosition = 230;
  const generalConditionItems = [
    ["Rodent/Termite Encroachment", inspection.rodentTermiteEncroachment],
    ["Clean and Dust Free", inspection.cleanDustFree],
    ["Silica Gel Condition", inspection.silicaGelCondition],
    ["No Corrosion", inspection.noCorrosion],
    ["Paintwork Adequate", inspection.paintworkAdequate]
  ];
  
  generalConditionItems.forEach((item, index) => {
    // Draw row background (alternating colors)
    if (index % 2 === 0) {
      generalConditionPage.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: 500,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    // Draw item name
    generalConditionPage.drawText(item[0], {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    // Draw status
    generalConditionPage.drawText(item[1], {
      x: 300,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
  });
  
  // Add inspection checklist - Operational Status
  const operationalPage = pdfDoc.addPage([600, 400]);
  operationalPage.drawText("Operational Status", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table header
  operationalPage.drawText("Item", {
    x: 50,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  operationalPage.drawText("Status", {
    x: 300,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  // Draw header background
  operationalPage.drawRectangle({
    x: 50,
    y: 250,
    width: 500,
    height: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table rows
  yPosition = 230;
  const operationalItems = [
    ["Protection Button Enabled", inspection.protectionButtonEnabled],
    ["Recloser Button Enabled", inspection.recloserButtonEnabled],
    ["AC Power On", inspection.acPowerOn],
    ["Battery Power Low", inspection.batteryPowerLow],
    ["Remote Button Enabled", inspection.remoteButtonEnabled]
  ];
  
  operationalItems.forEach((item, index) => {
    // Draw row background (alternating colors)
    if (index % 2 === 0) {
      operationalPage.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: 500,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    // Draw item name
    operationalPage.drawText(item[0], {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    // Draw status
    operationalPage.drawText(item[1], {
      x: 300,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
  });
  
  // Add inspection checklist - Safety & Protection
  const safetyPage = pdfDoc.addPage([600, 400]);
  safetyPage.drawText("Safety & Protection", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table header
  safetyPage.drawText("Item", {
    x: 50,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  safetyPage.drawText("Status", {
    x: 300,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  // Draw header background
  safetyPage.drawRectangle({
    x: 50,
    y: 250,
    width: 500,
    height: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table rows
  yPosition = 230;
  const safetyItems = [
    ["Ground/Earth Button Enabled", inspection.groundEarthButtonEnabled],
    ["Handle Lock On", inspection.handleLockOn],
    ["Earthing Arrangement Adequate", inspection.earthingArrangementAdequate],
    ["Gas Level Low", inspection.gasLevelLow],
    ["Correct Labelling", inspection.correctLabelling]
  ];
  
  safetyItems.forEach((item, index) => {
    // Draw row background (alternating colors)
    if (index % 2 === 0) {
      safetyPage.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: 500,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    // Draw item name
    safetyPage.drawText(item[0], {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    // Draw status
    safetyPage.drawText(item[1], {
      x: 300,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
  });
  
  // Component Condition
  const componentPage = pdfDoc.addPage([600, 400]);
  componentPage.drawText("Component Condition", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table header
  componentPage.drawText("Item", {
    x: 50,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  componentPage.drawText("Status", {
    x: 300,
    y: 250,
    size: 12,
    color: rgb(1, 1, 1),
  });
  
  // Draw header background
  componentPage.drawRectangle({
    x: 50,
    y: 250,
    width: 500,
    height: 20,
    color: rgb(0, 0.2, 0.4),
  });

  // Draw table rows
  yPosition = 230;
  const componentItems = [
    ["No Fuses Blown", inspection.noFusesBlown],
    ["No Damage to Bushings", inspection.noDamageToBushings],
    ["No Damage to HV Connections", inspection.noDamageToHVConnections],
    ["Insulators Clean", inspection.insulatorsClean],
    ["PT Fuse Link Intact", inspection.ptFuseLinkIntact]
  ];
  
  componentItems.forEach((item, index) => {
    // Draw row background (alternating colors)
    if (index % 2 === 0) {
      componentPage.drawRectangle({
        x: 50,
        y: yPosition - 15,
        width: 500,
        height: 20,
        color: rgb(0.95, 0.95, 0.95),
      });
    }
    
    // Draw item name
    componentPage.drawText(item[0], {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    // Draw status
    componentPage.drawText(item[1], {
      x: 300,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
  });
  
  // Remarks
  const remarksPage = pdfDoc.addPage([600, 400]);
  remarksPage.drawText("Remarks", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  if (inspection.remarks) {
    remarksPage.drawText(inspection.remarks, {
      x: 50,
      y: 250,
      size: 14,
      color: rgb(0, 0, 0),
      maxWidth: 500,
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
  
  // Summary section
  const summaryPage = pdfDoc.addPage([600, 400]);
  summaryPage.drawText("Inspection Summary", {
    x: 50,
    y: 300,
    size: 20,
    color: rgb(0, 0.2, 0.4),
  });

  summaryPage.drawText(`Total issues found: ${issuesCount}`, {
    x: 50,
    y: 250,
    size: 14,
    color: rgb(0, 0, 0),
  });
  summaryPage.drawText(`Overall assessment: ${issuesCount === 0 ? 'No issues found' : issuesCount < 3 ? 'Minor issues found' : issuesCount < 7 ? 'Moderate issues found' : 'Major issues found'}`, {
    x: 50,
    y: 230,
    size: 14,
    color: rgb(0, 0, 0),
  });
  
  // Add timestamp and page numbers
  const totalPages = pdfDoc.getPages().length;
  for (let i = 0; i < totalPages; i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();
    page.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: 50,
      y: height - 10,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: width - 100,
      y: height - 10,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });
  }
  
  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vit-inspection-${asset.serialNumber}-${inspection.inspectionDate.split('T')[0]}.pdf`;
  link.click();
  return link.download;
};

/**
 * Generate comprehensive PDF report for Substation inspection
 */
export const exportSubstationInspectionToPDF = async (inspection: SubstationInspection) => {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  let y = height - 50;

  // Embed font once for reuse
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  // Add title
  page.drawText("Substation Inspection Report", {
    x: 50,
    y,
    size: 16,
    color: rgb(0, 0, 0),
    font: boldFont,
  });
  y -= lineHeight * 2;

  // Add inspection details
  page.drawText(`Substation: ${inspection.substationNo}`, {
    x: 50,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(`Region: ${inspection.region}`, {
    x: 50,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(`District: ${inspection.district}`, {
    x: 50,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(`Date: ${formatDate(inspection.date)}`, {
    x: 50,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(`Type: ${inspection.type}`, {
    x: 50,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  // Add inspection items by category
  if (inspection.items && Array.isArray(inspection.items)) {
    for (const category of inspection.items) {
      if (!category || !category.items) continue;

      // Check if we need a new page
      if (y < 100) {
        const newPage = doc.addPage([595.28, 841.89]);
        y = height - 50;
      }

      // Add category header
      page.drawText(category.category, {
        x: 50,
        y,
        size: fontSize,
        color: rgb(0, 0, 0),
        font: boldFont,
      });
      y -= lineHeight;

      // Add items in this category
      for (const item of category.items) {
        if (!item) continue;

        // Check if we need a new page
        if (y < 100) {
          const newPage = doc.addPage([595.28, 841.89]);
          y = height - 50;
        }

        const statusText = item.status === "good" ? "✓" : "✗";
        const statusColor = item.status === "good" ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0);
        
        // Draw status symbol
        page.drawText(statusText, {
          x: 70,
          y,
          size: fontSize,
          color: statusColor,
        });

        // Draw item name
        page.drawText(item.name, {
          x: 90,
          y,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;

        if (item.remarks) {
          // Check if we need a new page for remarks
          if (y < 100) {
            const newPage = doc.addPage([595.28, 841.89]);
            y = height - 50;
          }

          page.drawText(`   Remarks: ${item.remarks}`, {
            x: 90,
            y,
            size: fontSize,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight;
        }
      }
      y -= lineHeight;
    }
  }

  // Add summary section
  if (y < 150) {
    const newPage = doc.addPage([595.28, 841.89]);
    y = height - 50;
  }

  // Calculate summary statistics
  const totalItems = inspection.items.reduce((count, category) => 
    count + (category.items?.length || 0), 0);
  const goodItems = inspection.items.reduce((count, category) => 
    count + (category.items?.filter(item => item.status === "good").length || 0), 0);
  const badItems = totalItems - goodItems;
  const percentageGood = totalItems > 0 ? (goodItems / totalItems) * 100 : 0;

  // Add summary header
  page.drawText("Inspection Summary", {
    x: 50,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
    font: boldFont,
  });
  y -= lineHeight * 2;

  // Add summary details
  page.drawText(`Total Items Checked: ${totalItems}`, {
    x: 70,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight;

  page.drawText(`Items in Good Condition: ${goodItems}`, {
    x: 70,
    y,
    size: fontSize,
    color: rgb(0, 0.5, 0),
  });
  y -= lineHeight;

  page.drawText(`Items Requiring Attention: ${badItems}`, {
    x: 70,
    y,
    size: fontSize,
    color: rgb(0.8, 0, 0),
  });
  y -= lineHeight;

  page.drawText(`Overall Condition: ${percentageGood >= 90 ? "Excellent" : 
    percentageGood >= 75 ? "Good" : 
    percentageGood >= 60 ? "Fair" : "Poor"}`, {
    x: 70,
    y,
    size: fontSize,
    color: rgb(0, 0, 0),
    font: boldFont,
  });

  // Add timestamp and page numbers
  const totalPages = doc.getPages().length;
  for (let i = 0; i < totalPages; i++) {
    const currentPage = doc.getPage(i);
    const { width, height } = currentPage.getSize();
    currentPage.drawText(`Generated: ${new Date().toLocaleString()}`, {
      x: 50,
      y: 30,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });
    currentPage.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: width - 100,
      y: 30,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Save the PDF
  const pdfBytes = await doc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `substation-inspection-${formatDate(inspection.date)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};
