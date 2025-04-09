
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, FileText } from "lucide-react";
import { VITInspectionData } from "@/lib/asset-types";
import { formatDate, exportInspectionToPDF } from "./exportUtils";

interface VITInspectionTableProps {
  filteredInspections: VITInspectionData[];
  handleDelete: (id: string) => void;
}

export const VITInspectionTable = ({ 
  filteredInspections,
  handleDelete 
}: VITInspectionTableProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>VIT Inspections</CardTitle>
        <CardDescription>
          {filteredInspections.length} {filteredInspections.length === 1 ? 'inspection' : 'inspections'} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Voltage</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Serial No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInspections.length > 0 ? (
                filteredInspections.map((inspection) => (
                  <TableRow key={inspection.id}>
                    <TableCell>{formatDate(inspection.date)}</TableCell>
                    <TableCell>{inspection.region}</TableCell>
                    <TableCell>{inspection.district}</TableCell>
                    <TableCell>{inspection.voltageLevel}</TableCell>
                    <TableCell>{inspection.typeOfUnit}</TableCell>
                    <TableCell>{inspection.serialNumber}</TableCell>
                    <TableCell>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inspection.status === 'Operational' 
                            ? 'bg-green-100 text-green-800' 
                            : inspection.status === 'Under Maintenance'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {inspection.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/asset-management/vit-inspection-details/${inspection.id}`)}
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/asset-management/edit-vit-inspection/${inspection.id}`)}
                          title="Edit inspection"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const savedInspection = filteredInspections.find(i => i.id === inspection.id);
                            if (savedInspection) {
                              exportInspectionToPDF(savedInspection);
                            }
                          }}
                          title="Export to PDF"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(inspection.id)}
                          title="Delete inspection"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No inspections found. 
                    <Button 
                      variant="link" 
                      onClick={() => navigate("/asset-management/vit-inspection")}
                      className="px-1 py-0 h-auto font-normal"
                    >
                      Create a new inspection
                    </Button>.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
