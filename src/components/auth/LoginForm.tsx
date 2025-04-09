import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      // Toast is handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <img 
            src="/lovable-uploads/ecg-logo.png" 
            alt="ECG Logo" 
            className="h-16 w-auto mx-auto"
          />
        </div>
        <CardTitle className="text-2xl">Login to ECG Fault Master</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-ecg-blue hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-ecg-blue hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
      
      <div className="px-6 pb-6 pt-2">
        <div className="bg-muted p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2">Demo Accounts:</h3>
          <div className="grid gap-2 text-xs">
            <div className="grid grid-cols-2 items-center gap-2">
              <div>
                <strong>District Engineer:</strong>
                <div className="text-muted-foreground">district@ecg.com</div>
              </div>
              <div>
                <div className="text-muted-foreground">password: password</div>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <div>
                <strong>Regional Engineer:</strong>
                <div className="text-muted-foreground">regional@ecg.com</div>
              </div>
              <div>
                <div className="text-muted-foreground">password: password</div>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <div>
                <strong>Global Engineer:</strong>
                <div className="text-muted-foreground">global@ecg.com</div>
              </div>
              <div>
                <div className="text-muted-foreground">password: password</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
