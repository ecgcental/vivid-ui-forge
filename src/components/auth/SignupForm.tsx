import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataContext";
import { UserRole } from "@/lib/types";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>(null);
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [staffId, setStaffId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [staffIdError, setStaffIdError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [regionError, setRegionError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const { signup, verifyStaffId, staffIds } = useAuth();
  const { regions, districts } = useData();
  const navigate = useNavigate();
  const [isFieldsLocked, setIsFieldsLocked] = useState(false);

  const regionOptions = regions?.map(r => ({
    value: r.id,
    label: r.name
  })) || [];

  const districtOptions = region 
    ? districts?.filter(d => d.regionId === region).map(d => ({
        value: d.id,
        label: d.name
      })) || []
    : [];

  const handleRoleChange = (value: string) => {
    setRole(value as UserRole);
    if (value === "global_engineer" || value === "system_admin") {
      setRegion("");
      setDistrict("");
      setStaffId("");
      setStaffIdError("");
    }
  };

  const handleRegionChange = (value: string) => {
    setRegion(value);
    setDistrict("");
  };

  const handleStaffIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStaffId = e.target.value;
    setStaffId(newStaffId);
    setStaffIdError("");

    // Verify staff ID and populate fields if valid
    if (newStaffId) {
      const { isValid, staffInfo } = verifyStaffId(newStaffId);
      
      if (isValid) {
        // For custom staff IDs (not ECGXXX format)
        if (!/^ECG\d{3}$/.test(newStaffId)) {
          // Check if it exists in the staff ID management system
          const customStaff = staffIds?.find(s => s.id === newStaffId);
          if (customStaff) {
            // Auto-populate fields for existing custom staff IDs
            setName(customStaff.name);
            setRole(customStaff.role);
            setIsFieldsLocked(true);
            
            if (customStaff.region) {
              // Find the region ID that matches the region name
              const regionMatch = regions?.find(r => r.name === customStaff.region);
              if (regionMatch) {
                setRegion(regionMatch.id);
                
                // If there's a district, find and set it
                if (customStaff.district) {
                  const districtMatch = districts?.find(d => 
                    d.regionId === regionMatch.id && d.name === customStaff.district
                  );
                  if (districtMatch) {
                    setDistrict(districtMatch.id);
                  }
                }
              }
            }
            return;
          }
          
          // For new custom staff IDs that are not in the database
          setIsFieldsLocked(false);
          setStaffIdError("Staff ID not found in database. Please contact the administrator.");
          return;
        }
        
        // For ECGXXX format staff IDs
        if (staffInfo) {
          // Auto-populate fields
          setName(staffInfo.name);
          setRole(staffInfo.role);
          setIsFieldsLocked(true);
          
          if (staffInfo.region) {
            // Find the region ID that matches the region name
            const regionMatch = regions?.find(r => r.name === staffInfo.region);
            if (regionMatch) {
              setRegion(regionMatch.id);
              
              // If there's a district, find and set it
              if (staffInfo.district) {
                const districtMatch = districts?.find(d => 
                  d.regionId === regionMatch.id && d.name === staffInfo.district
                );
                if (districtMatch) {
                  setDistrict(districtMatch.id);
                }
              }
            }
          }
        }
      } else {
        setIsFieldsLocked(false);
        setStaffIdError("Invalid staff ID format. Must be 6-10 alphanumeric characters");
      }
    } else {
      setIsFieldsLocked(false);
    }
  };

  const validateForm = () => {
    // Reset error states
    setPasswordError('');
    setStaffIdError('');
    setRoleError('');
    setRegionError('');
    setDistrictError('');

    // Password validation
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }

    // Only allow letters and numbers
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      setPasswordError('Password can only contain letters and numbers');
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }

    // Staff ID validation for all roles except global_engineer
    if (role !== "global_engineer") {
      if (!staffId) {
        setStaffIdError('Staff ID is required');
        return false;
      }

      const { isValid, staffInfo } = verifyStaffId(staffId);
      if (!isValid) {
        setStaffIdError('Invalid staff ID');
        return false;
      }

      if (staffInfo) {
        if (staffInfo.role !== role) {
          setRoleError(`Staff ID is registered for ${staffInfo.role} role`);
          return false;
        }

        if (staffInfo.region) {
          const regionMatch = regions?.find(r => r.name === staffInfo.region);
          if (!regionMatch || regionMatch.id !== region) {
            setRegionError(`Staff ID is registered for ${staffInfo.region} region`);
            return false;
          }
        }

        if (staffInfo.district) {
          const regionMatch = regions?.find(r => r.id === region);
          const districtMatch = districts?.find(d => 
            d.regionId === regionMatch?.id && d.name === staffInfo.district
          );
          if (!districtMatch || districtMatch.id !== district) {
            setDistrictError(`Staff ID is registered for ${staffInfo.district} district`);
            return false;
          }
        }
      }
    }

    // Role-specific validation
    if (role === "district_engineer" && (!region || !district)) {
      setRegionError('Region and district are required for district engineers');
      return false;
    }

    if (role === "regional_engineer" && !region) {
      setRegionError('Region is required for regional engineers');
      return false;
    }

    if (role === "technician" && (!region || !district)) {
      setRegionError('Region and district are required for technicians');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Get the region and district names from the selected IDs
      const regionName = region ? regions?.find(r => r.id === region)?.name : undefined;
      const districtName = district ? districts?.find(d => d.id === district)?.name : undefined;

      // Verify staff ID one final time before submitting
      if (role !== "global_engineer" && staffId) {
        const { isValid, staffInfo } = verifyStaffId(staffId);
        if (!isValid) {
          setStaffIdError("Invalid staff ID");
          return;
        }
        
        if (staffInfo) {
          // Verify role matches
          if (staffInfo.role !== role) {
            setRoleError(`Staff ID is assigned to a ${staffInfo.role.replace('_', ' ')} role`);
            return;
          }
          
          // Verify region matches
          if (staffInfo.region && staffInfo.region !== regionName) {
            setRegionError(`Staff ID is assigned to ${staffInfo.region} region`);
            return;
          }
          
          // Verify district matches
          if (staffInfo.district && staffInfo.district !== districtName) {
            setDistrictError(`Staff ID is assigned to ${staffInfo.district} district`);
            return;
          }
        }
      }

      await signup(
        email, 
        password, 
        name, 
        role,
        regionName,
        districtName,
        staffId || undefined
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
      // Toast is handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Sign up to access ECG Outage Management System
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffId">Staff ID</Label>
              <Input
                id="staffId"
                value={staffId}
                onChange={handleStaffIdChange}
                placeholder="Enter your staff ID"
              />
              {staffIdError && <p className="text-sm text-red-500 mt-1">{staffIdError}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Used for ECG staff identity verification.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                disabled={isFieldsLocked}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={handleRoleChange}
                disabled={isFieldsLocked}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global_engineer">Global Engineer</SelectItem>
                  <SelectItem value="regional_engineer">Regional Engineer</SelectItem>
                  <SelectItem value="district_engineer">District Engineer</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
              {roleError && <p className="text-sm text-red-500 mt-1">{roleError}</p>}
            </div>
            
            {role !== "global_engineer" && (
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select
                  value={region}
                  onValueChange={handleRegionChange}
                  disabled={isFieldsLocked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {regionError && <p className="text-sm text-red-500 mt-1">{regionError}</p>}
              </div>
            )}
            
            {(role === "district_engineer" || role === "technician") && region && (
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select
                  value={district}
                  onValueChange={setDistrict}
                  disabled={isFieldsLocked}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts
                      .filter(d => d.regionId === region)
                      .map((district) => (
                        <SelectItem key={district.id} value={district.id}>
                          {district.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {districtError && <p className="text-sm text-red-500 mt-1">{districtError}</p>}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-ecg-blue hover:underline">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
