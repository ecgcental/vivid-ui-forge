
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function EditVITInspectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // This is a stub page - we're handling edits through sheets/modals in the main pages
  useEffect(() => {
    // Redirect to the inspection details page for the asset
    navigate(`/asset-management/vit-inspection-management`);
  }, [id, navigate]);

  return (
    <Layout>
      <div className="container py-8">
        <p>Redirecting...</p>
      </div>
    </Layout>
  );
}
