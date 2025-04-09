
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubstationInspection } from "@/lib/types";
import { useData } from "@/contexts/DataContext";
import { format } from "date-fns";
import { ChevronLeft, Download, FileText, Pencil } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function InspectionDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSavedInspection } = useData();
  const [inspection, setInspection] = useState<SubstationInspection | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (id) {
      const loadedInspection = getSavedInspection(id);
      if (loadedInspection) {
        setInspection(loadedInspection);
      } else {
        toast.error("Inspection not found");
        navigate("/asset-management/inspection-management");
      }
    }
  }, [id, getSavedInspection, navigate]);

  if (!inspection) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <p>Loading inspection details...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("Substation Inspection Report", 14, 20);
    
    // Add metadata
    doc.setFontSize(12);
    doc.text(`Substation: ${inspection.substationNo}`, 14, 30);
    doc.text(`Region: ${inspection.region}`, 14, 36);
    doc.text(`District: ${inspection.district}`, 14, 42);
    doc.text(`Date: ${format(new Date(inspection.date), "PPP")}`, 14, 48);
    doc.text(`Type: ${inspection.type}`, 14, 54);
    
    // Group items by category
    const itemsByCategory = inspection.items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof inspection.items>);
    
    let yPos = 64;
    
    // Add items by category
    Object.entries(itemsByCategory).forEach(([category, items]) => {
      // Add category title
      yPos += 10;
      doc.setFontSize(14);
      doc.text(category.charAt(0).toUpperCase() + category.slice(1), 14, yPos);
      yPos += 6;
      
      // Add table for this category
      // @ts-ignore - jsPDF types are not complete
      doc.autoTable({
        startY: yPos,
        head: [["Item", "Status", "Remarks"]],
        body: items.map(item => [
          item.name,
          item.status === "good" ? "Good" : "Bad",
          item.remarks || "-"
        ]),
        margin: { left: 14 },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30 },
          2: { cellWidth: 70 }
        }
      });
      
      // @ts-ignore - jsPDF types are not complete
      yPos = doc.lastAutoTable.finalY + 10;
      
      // Add new page if needed
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });
    
    // Save PDF
    doc.save(`inspection-${inspection.substationNo}-${inspection.date}.pdf`);
  };

  const exportToCSV = () => {
    // Prepare CSV content
    const headers = ["Category", "Item", "Status", "Remarks"];
    const rows = inspection.items.map(item => [
      item.category,
      item.name,
      item.status,
      item.remarks
    ]);
    
    // Convert to CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inspection-${inspection.substationNo}-${inspection.date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getItemsByCategory = (category: string) => {
    return inspection.items.filter(item => item.category === category);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/asset-management/inspection-management")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Inspections
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Inspection: {inspection.substationNo}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/asset-management/edit-inspection/${id}`)}
                className="flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit Inspection
              </Button>
              <Button
                variant="outline"
                onClick={exportToPDF}
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                Export to PDF
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Export to CSV
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
            <CardDescription>
              Basic information about the substation inspection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-lg">{format(new Date(inspection.date), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Region</p>
                <p className="text-lg">{inspection.region}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">District</p>
                <p className="text-lg">{inspection.district}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Substation Number</p>
                <p className="text-lg">{inspection.substationNo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-lg capitalize">{inspection.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status Summary</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {inspection.items.filter(item => item.status === "good").length} good
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {inspection.items.filter(item => item.status === "bad").length} bad
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspection Checklist Results</CardTitle>
            <CardDescription>
              Detailed results of the inspection checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="general" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-2">
                <TabsTrigger value="general">General Building</TabsTrigger>
                <TabsTrigger value="control">Control Equipment</TabsTrigger>
                <TabsTrigger value="transformer">Power Transformer</TabsTrigger>
                <TabsTrigger value="outdoor">Outdoor Equipment</TabsTrigger>
              </TabsList>
              
              {["general", "control", "transformer", "outdoor"].map((category) => (
                <TabsContent key={category} value={category} className="space-y-6">
                  {getItemsByCategory(category).map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h3 className="text-base font-medium">{item.name}</h3>
                        <div>
                          {item.status === "good" ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              Good
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              Bad
                            </span>
                          )}
                        </div>
                      </div>
                      {item.remarks && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-muted-foreground">Remarks</p>
                          <p className="text-base mt-1">{item.remarks}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
