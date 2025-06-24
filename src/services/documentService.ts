const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Document {
  id: number;
  filename: string;
  file_path?: string;
  content_type?: string;
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
      `${API_BASE_URL}/api/doctors/patients/${patientId}/documents`,
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

    // Map the response based on the Document interface
    return data.map((doc: any) => ({
      id: doc.document_id,
      filename: doc.filename,
      description: doc.description,
      created_at: doc.created_at,
      uploaded_by_id: doc.uploaded_by_id || "", // Add default if missing
    }));
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
    const uploadedDocuments: Document[] = [];

    // Upload files one by one since backend is going to be a single file upload
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]); // Backend expects "file" not "files"
      formData.append("description", description);

      const response = await fetch(
        `${API_BASE_URL}/api/doctors/patients/${patientId}/documents/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload documents: ${response.statusText}`);
      }

      const uploadedDoc = await response.json();

      // Map backend response to Document format
      const mappedDoc: Document = {
        id: uploadedDoc.document_id,
        filename: uploadedDoc.filename,
        file_path: uploadedDoc.file_path,
        description: uploadedDoc.description,
        created_at: uploadedDoc.created_at,
        uploaded_by_id: uploadedDoc.uploaded_by_id || "",
        patient_id: patientId,
      };

      uploadedDocuments.push(mappedDoc);
    }

    return uploadedDocuments;
  } catch (error) {
    console.error("Upload documents error:", error);
    throw error;
  }
};

// For doctors to get patient document preview URL
export const getDoctorPatientDocumentPreviewUrl = async (
  patientId: string,
  documentId: string,
  accessToken: string
): Promise<{ url: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/doctors/patients/${patientId}/documents/${documentId}/preview`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get preview URL: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get preview URL error:", error);
    throw error;
  }
};

// For patients to get preview URLs for their own documents
export const getPatientDocumentPreviewUrl = async (
  documentId: string,
  accessToken: string
): Promise<{ url: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/patients/documents/${documentId}/preview`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get preview URL: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get preview URL error:", error);
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
      `${API_BASE_URL}/api/doctors/patients/${patientId}/documents/${documentId}`,
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
