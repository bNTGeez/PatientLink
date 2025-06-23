const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Document {
  id: number;
  filename: string;
  file_path?: string;
  description?: string;
  patient_id?: string;
  uploaded_by_id: string;
  created_at: string;
}

export interface PatientDocument {
  document_id: number;
  filename: string;
  description?: string;
  uploaded_by_id: string;
  created_at: string;
}

// For patients to get their own documents
export const getPatientDocuments = async (
  patientId: string,
  accessToken: string
): Promise<Document[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/patients/documents`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    const data: PatientDocument[] = await response.json();

    // Map PatientDocument format to Document format
    return data.map((doc) => ({
      id: doc.document_id,
      filename: doc.filename,
      description: doc.description,
      uploaded_by_id: doc.uploaded_by_id,
      created_at: doc.created_at,
    }));
  } catch (error) {
    console.error("Fetch documents error:", error);
    throw error;
  }
};

// For doctors to get patient documents
export const getDoctorPatientDocuments = async (
  patientId: string,
  accessToken: string
): Promise<Document[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/doctor/${patientId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.statusText}`);
    }

    const data = await response.json();
    return data.documents;
  } catch (error) {
    console.error("Fetch documents error:", error);
    throw error;
  }
};

export const uploadDocuments = async (
  patientId: string,
  files: FileList,
  description: string,
  accessToken: string
): Promise<Document[]> => {
  try {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    formData.append("description", description);

    const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload documents: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Upload documents error:", error);
    throw error;
  }
};

export const getDocumentDownloadUrl = async (
  patientId: string,
  documentId: string,
  accessToken: string
): Promise<{ url: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/${patientId}/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get download URL: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get download URL error:", error);
    throw error;
  }
};

export const deleteDocument = async (
  patientId: string,
  documentId: string,
  accessToken: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/documents/${patientId}/${documentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Delete document error:", error);
    throw error;
  }
};
