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
  try {
    if (!asset) {
      throw new Error("Asset information is required to generate the report");
    }

    const region = getRegionName(asset.regionId);
    const district = getDistrictName(asset.districtId);
    
    // Create PDF document with A4 size
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    const { width, height } = page.getSize();

    // Add header with company logo and title
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    page.drawText('VIT INSPECTION REPORT', {
      x: 50,
      y: height - 50,
      size: 24,
      color: rgb(0, 0.2, 0.4),
      font: boldFont,
    });

    // Add report metadata
    const inspectionDate = new Date(inspection.inspectionDate);
    page.drawText(`Report Date: ${format(inspectionDate, 'dd/MM/yyyy')}`, {
      x: 50,
      y: height - 80,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(`Inspector: ${inspection.inspectedBy}`, {
      x: 50,
      y: height - 100,
      size: 12,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Add asset information section
    page.drawText('Asset Information', {
      x: 50,
      y: height - 150,
      size: 16,
      color: rgb(0, 0.2, 0.4),
      font: boldFont,
    });

    // Draw asset info table
    const assetInfo = [
      ['Serial Number', asset.serialNumber],
      ['Type of Unit', asset.typeOfUnit],
      ['Voltage Level', asset.voltageLevel],
      ['Region', region],
      ['District', district],
      ['Location', asset.location],
      ['Status', asset.status],
    ];

    let y = height - 180;
    assetInfo.forEach(([label, value]) => {
      page.drawText(`${label}:`, {
        x: 50,
        y,
        size: 12,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText(value, {
        x: 200,
        y,
        size: 12,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    });

    // Add inspection summary
    page.drawText('Inspection Summary', {
      x: 50,
      y: y - 30,
      size: 16,
      color: rgb(0, 0.2, 0.4),
      font: boldFont,
    });

    // Calculate summary statistics
    const inspectionItems = [
      { name: 'Rodent/Termite Encroachment', status: inspection.rodentTermiteEncroachment },
      { name: 'Clean and Dust Free', status: inspection.cleanDustFree },
      { name: 'Protection Button Enabled', status: inspection.protectionButtonEnabled },
      { name: 'Recloser Button Enabled', status: inspection.recloserButtonEnabled },
      { name: 'Ground/Earth Button Enabled', status: inspection.groundEarthButtonEnabled },
      { name: 'AC Power On', status: inspection.acPowerOn },
      { name: 'Battery Power Low', status: inspection.batteryPowerLow },
      { name: 'Handle Lock On', status: inspection.handleLockOn },
      { name: 'Remote Button Enabled', status: inspection.remoteButtonEnabled },
      { name: 'Gas Level Low', status: inspection.gasLevelLow },
      { name: 'Earthing Arrangement Adequate', status: inspection.earthingArrangementAdequate },
      { name: 'No Fuses Blown', status: inspection.noFusesBlown },
      { name: 'No Damage to Bushings', status: inspection.noDamageToBushings },
      { name: 'No Damage to HV Connections', status: inspection.noDamageToHVConnections },
      { name: 'Insulators Clean', status: inspection.insulatorsClean },
      { name: 'Paintwork Adequate', status: inspection.paintworkAdequate },
      { name: 'PT Fuse Link Intact', status: inspection.ptFuseLinkIntact },
      { name: 'No Corrosion', status: inspection.noCorrosion },
      { name: 'Silica Gel Condition', status: inspection.silicaGelCondition },
      { name: 'Correct Labelling', status: inspection.correctLabelling },
    ];

    const totalItems = inspectionItems.length;
    const goodItems = inspectionItems.filter(item => item.status === 'Yes' || item.status === 'Good').length;
    const badItems = totalItems - goodItems;
    const goodPercentage = ((goodItems / totalItems) * 100).toFixed(1);

    const summaryInfo = [
      ['Total Items Inspected', totalItems.toString()],
      ['Items in Good Condition', `${goodItems} (${goodPercentage}%)`],
      ['Items Requiring Attention', badItems.toString()],
    ];

    y -= 60;
    summaryInfo.forEach(([label, value]) => {
      page.drawText(`${label}:`, {
        x: 50,
        y,
        size: 12,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText(value, {
        x: 200,
        y,
        size: 12,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    });

    // Add detailed inspection results
    const resultsPage = pdfDoc.addPage([595.28, 841.89]);
    resultsPage.drawText('Detailed Inspection Results', {
      x: 50,
      y: height - 50,
      size: 16,
      color: rgb(0, 0.2, 0.4),
      font: boldFont,
    });

    // Draw inspection items table
    y = height - 80;
    inspectionItems.forEach((item, index) => {
      if (y < 100) {
        // Add new page if running out of space
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        y = height - 50;
        resultsPage.drawText('Detailed Inspection Results (Continued)', {
          x: 50,
          y,
          size: 16,
          color: rgb(0, 0.2, 0.4),
          font: boldFont,
        });
        y -= 30;
      }

      // Draw item details
      resultsPage.drawText(`${index + 1}. ${item.name}`, {
        x: 50,
        y,
        size: 12,
        color: rgb(0, 0, 0),
      });

      const statusText = item.status === 'Yes' || item.status === 'Good' ? '[OK] Good' : '[X] Requires Attention';
      const statusColor = item.status === 'Yes' || item.status === 'Good' ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0);

      resultsPage.drawText(`Status: ${statusText}`, {
        x: 300,
        y,
        size: 12,
        color: statusColor,
      });

      y -= 30;
    });

    // Add remarks if any
    if (inspection.remarks) {
      const remarksPage = pdfDoc.addPage([595.28, 841.89]);
      remarksPage.drawText('Additional Remarks', {
        x: 50,
        y: height - 50,
        size: 16,
        color: rgb(0, 0.2, 0.4),
        font: boldFont,
      });

      remarksPage.drawText(inspection.remarks, {
        x: 50,
        y: height - 100,
        size: 12,
        color: rgb(0.3, 0.3, 0.3),
        maxWidth: width - 100,
      });
    }

    // Add footer with page numbers
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      page.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: width - 100,
        y: 30,
        size: 10,
        color: rgb(0.5, 0.5, 0.5),
      });
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vit-inspection-${asset.serialNumber}-${format(inspectionDate, 'yyyy-MM-dd')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
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
