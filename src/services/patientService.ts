// Patient service for verifying and managing patients
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface PatientVerificationData {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface VerifiedPatient {
  auth0_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  role: string;
  created_at: string;
  updated_at: string;
  doctor_id: string | null;
}

// Add a verified patient to doctor's list
export const addPatientToDoctor = async (
  patientAuth0Id: string,
  doctorAuth0Id: string,
  accessToken: string
): Promise<VerifiedPatient> => {
  try {
    const formData = new FormData();
    formData.append("patient_auth0_id", patientAuth0Id);

    const response = await fetch(`${API_BASE_URL}/api/doctors/add-patient`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.detail || `Failed to add patient: ${response.statusText}`
      );
    }

    return response.json();
  } catch (error) {
    console.error("Add patient error:", error);
    throw error;
  }
};

// Get all patients for a specific doctor
export const getDoctorPatients = async (
  doctorAuth0Id: string,
  accessToken: string
): Promise<VerifiedPatient[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/doctors/patients`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Fetch patients error:", error);
    throw error;
  }
};

// Verify patient by multiple fields to ensure data integrity
export const verifyPatient = async (
  verificationData: PatientVerificationData,
  accessToken: string
): Promise<VerifiedPatient | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/patients/verify-details`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(verificationData),
      }
    );

    if (response.status === 404) {
      return null; // Patient not found or details don't match
    }

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Patient verification error:", error);
    throw error;
  }
};

// Get patient's own profile
export const getPatientProfile = async (
  accessToken: string
): Promise<VerifiedPatient> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/patients/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Fetch profile error:", error);
    throw error;
  }
};
