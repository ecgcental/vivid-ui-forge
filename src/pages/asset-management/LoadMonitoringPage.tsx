import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AssetManagementNav } from "@/components/layout/AssetManagementNav";

export default function LoadMonitoringPage() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [substationName, setSubstationName] = useState("");
  const [substationNumber, setSubstationNumber] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState("");
  const [peakLoadStatus, setPeakLoadStatus] = useState("");
  const [feederLegs, setFeederLegs] = useState([
    { id: "1", redPhaseCurrent: 0, yellowPhaseCurrent: 0, bluePhaseCurrent: 0, neutralCurrent: 0 },
  ]);

  const handleAddFeederLeg = () => {
    setFeederLegs([
      ...feederLegs,
      { id: String(feederLegs.length + 1), redPhaseCurrent: 0, yellowPhaseCurrent: 0, bluePhaseCurrent: 0, neutralCurrent: 0 },
    ]);
  };

  const handleRemoveFeederLeg = (id: string) => {
    setFeederLegs(feederLegs.filter((leg) => leg.id !== id));
  };

  const handleFeederLegChange = (id: string, field: string, value: number) => {
    setFeederLegs(
      feederLegs.map((leg) =>
        leg.id === id ? { ...leg, [field]: value } : leg
      )
    );
  };
  
  return (
    <Layout>
      <AssetManagementNav />
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Load Monitoring</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Enter Load Monitoring Data</CardTitle>
            <CardDescription>
              Fill in the details for load monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    type="text"
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    type="text"
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="substationName">Substation Name</Label>
                  <Input
                    type="text"
                    id="substationName"
                    value={substationName}
                    onChange={(e) => setSubstationName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="substationNumber">Substation Number</Label>
                  <Input
                    type="text"
                    id="substationNumber"
                    value={substationNumber}
                    onChange={(e) => setSubstationNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Rating (in MVA)</Label>
                  <Input
                    type="number"
                    id="rating"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="peakLoadStatus">Peak Load Status</Label>
                  <Select onValueChange={setPeakLoadStatus}>
                    <SelectTrigger id="peakLoadStatus">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Feeder Legs</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leg ID</TableHead>
                      <TableHead>Red Phase Current</TableHead>
                      <TableHead>Yellow Phase Current</TableHead>
                      <TableHead>Blue Phase Current</TableHead>
                      <TableHead>Neutral Current</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feederLegs.map((leg) => (
                      <TableRow key={leg.id}>
                        <TableCell>{leg.id}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={leg.redPhaseCurrent}
                            onChange={(e) =>
                              handleFeederLegChange(
                                leg.id,
                                "redPhaseCurrent",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={leg.yellowPhaseCurrent}
                            onChange={(e) =>
                              handleFeederLegChange(
                                leg.id,
                                "yellowPhaseCurrent",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={leg.bluePhaseCurrent}
                            onChange={(e) =>
                              handleFeederLegChange(
                                leg.id,
                                "bluePhaseCurrent",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={leg.neutralCurrent}
                            onChange={(e) =>
                              handleFeederLegChange(
                                leg.id,
                                "neutralCurrent",
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFeederLeg(leg.id)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button size="sm" onClick={handleAddFeederLeg}>
                  Add Feeder Leg
                </Button>
              </div>
              
              <Button>Submit Load Monitoring Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
