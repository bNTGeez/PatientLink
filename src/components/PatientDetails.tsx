import { useState, useRef, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { getFullName } from "../utils/patientHelpers";
import DocumentCard from "./DocumentCard";
import {
  getDoctorPatientDocuments,
  uploadDocuments,
  getDocumentDownloadUrl,
  deleteDocument,
  type Document,
} from "../services/documentService";

interface PatientDetailsProps {
  patient: any;
  onBack: () => void;
}

export default function PatientDetails({ patient }: PatientDetailsProps) {
  const { getAccessTokenSilently } = useAuth0();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load documents when component mounts
  useEffect(() => {
    loadDocuments();
  }, [patient.auth0_user_id]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessTokenSilently();
      const fetchedDocuments = await getDoctorPatientDocuments(
        patient.auth0_user_id,
        accessToken
      );
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const accessToken = await getAccessTokenSilently();
      await uploadDocuments(
        patient.auth0_user_id,
        files,
        "", // description - could add input field for this
        accessToken
      );

      // Refresh documents list after upload
      await loadDocuments();

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Failed to upload documents:", error);
      alert("Failed to upload documents. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle document download/view
  const handleView = async (document: Document) => {
    try {
      const accessToken = await getAccessTokenSilently();
      const response = await getDocumentDownloadUrl(
        patient.auth0_user_id,
        document.id.toString(),
        accessToken
      );

      // Open the document in a new tab
      window.open(response.url, "_blank");
    } catch (error) {
      console.error("Failed to get document URL:", error);
      alert("Failed to open document. Please try again.");
    }
  };

  // Handle document deletion
  const handleDelete = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const accessToken = await getAccessTokenSilently();
      await deleteDocument(
        patient.auth0_user_id,
        documentId.toString(),
        accessToken
      );

      // Refresh documents list after deletion
      await loadDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document. Please try again.");
    }
  };

  return (
    <div className="flex flex-col p-6">
      <h1 className="mb-4 ml-2 text-2xl font-bold">Patient Details</h1>
      <div className="flex flex-row border-2 border-gray-300 rounded-md p-4">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold">Patient Information</h2>
          <p>Name: {getFullName(patient)}</p>
          <p>Email: {patient.email}</p>
          <p>Phone: {patient.phone}</p>
          <p>Date of Birth: {patient.date_of_birth}</p>
        </div>
      </div>
      <div className="flex flex-col mt-4">
        <h2 className="text-xl font-bold ml-2">Documents</h2>
        <div className="flex flex-row mt-5">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </div>

        <div className="flex flex-row mt-10">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : documents.length > 0 ? (
            documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No documents found.</p>
              <p className="text-gray-400 text-sm mt-2">
                Upload documents to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
