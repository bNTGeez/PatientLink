import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import PatientSidebar from "../components/PatientSidebar";
import PatientProfile from "../components/PatientProfile";
import DocumentCard from "../components/DocumentCard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import {
  getPatientDocuments,
  type Document,
} from "../services/documentService";
import {
  getPatientProfile,
  type VerifiedPatient,
} from "../services/patientService";

export default function PatientDashboard() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [activeView, setActiveView] = useState("overview");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [patientData, setPatientData] = useState<VerifiedPatient | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const currentPatientId = user?.sub;

  // Load patient documents
  const loadDocuments = async () => {
    if (!currentPatientId) return;

    setIsLoadingDocuments(true);
    try {
      const accessToken = await getAccessTokenSilently();
      const fetchedDocuments = await getPatientDocuments(
        currentPatientId,
        accessToken
      );
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Load patient profile
  const loadPatientProfile = async () => {
    if (!currentPatientId) return;

    setIsLoadingProfile(true);
    try {
      const accessToken = await getAccessTokenSilently();
      const profile = await getPatientProfile(accessToken);
      setPatientData(profile);
    } catch (error) {
      console.error("Failed to load patient profile:", error);
      setPatientData(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (currentPatientId) {
      loadDocuments();
      loadPatientProfile();
    }
  }, [currentPatientId, getAccessTokenSilently]);

  useEffect(() => {
    if (activeView === "overview" && currentPatientId) {
      loadDocuments();
    } else if (activeView === "profile" && currentPatientId && !patientData) {
      loadPatientProfile();
    }
  }, [activeView, currentPatientId]);

  const renderOverview = () => (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-600 mt-2">
          View your medical documents and records
        </p>
      </div>

      {isLoadingDocuments ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading documents...</p>
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <p className="text-gray-500 text-lg">No documents found.</p>
            <p className="text-gray-400 text-sm mt-2">
              Your healthcare provider will upload documents here for you to
              view.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => {
    if (isLoadingProfile) {
      return (
        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading profile...</p>
          </div>
        </div>
      );
    }
    return <PatientProfile patient={patientData} />;
  };

  return (
    <SidebarProvider>
      <PatientSidebar onNavigate={setActiveView} />
      <SidebarInset>
        {activeView === "overview" && renderOverview()}
        {activeView === "profile" && renderProfile()}
      </SidebarInset>
    </SidebarProvider>
  );
}
