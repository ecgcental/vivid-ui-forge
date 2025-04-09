import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <Layout>
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-md mx-auto">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
}
