import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Sidebar from "../components/DoctorSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { calculateAge, getFullName, formatDate } from "../utils/patientHelpers";
import PatientForm from "../components/Form";
import PatientDetails from "../components/PatientDetails";
import EditPatientForm from "../components/EditPatientForm";
import {
  addPatientToDoctor,
  getDoctorPatients,
} from "../services/patientService";
import type { VerifiedPatient } from "../services/patientService";

export default function DoctorDashboard() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [activeView, setActiveView] = useState("overview");
  const [selectedPatient, setSelectedPatient] =
    useState<VerifiedPatient | null>(null);
  const [editingPatient, setEditingPatient] = useState<VerifiedPatient | null>(
    null
  );
  const [patients, setPatients] = useState<VerifiedPatient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  const currentDoctorId = user?.sub;

  const loadPatients = async () => {
    if (!currentDoctorId) return;

    setIsLoadingPatients(true);
    try {
      const accessToken = await getAccessTokenSilently();
      const fetchedPatients = await getDoctorPatients(
        currentDoctorId,
        accessToken
      );
      setPatients(fetchedPatients);
    } catch (error) {
      console.error("Failed to load patients:", error);
      setPatients([]); 
    } finally {
      setIsLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (currentDoctorId) {
      loadPatients();
    }
  }, [currentDoctorId, getAccessTokenSilently]);

  useEffect(() => {
    if (activeView === "patients" && currentDoctorId) {
      loadPatients();
    }
  }, [activeView, currentDoctorId]);

  const handleAddPatient = async (verifiedPatient: VerifiedPatient) => {
    if (!currentDoctorId) {
      console.error("No current doctor ID available");
      return;
    }

    try {
      const accessToken = await getAccessTokenSilently();
      const updatedPatient = await addPatientToDoctor(
        verifiedPatient.auth0_user_id,
        currentDoctorId,
        accessToken
      );
      await loadPatients();
      setActiveView("patients");
    } catch (error) {
      console.error("Failed to add patient:", error);
    }
  };

  // WIP: Edit patient
  const handleEditPatient = async (values: any) => {
    if (!editingPatient) return;

    try {
      await loadPatients();
      setEditingPatient(null);
      setActiveView("patients");
    } catch (error) {
      console.error("Failed to update patient:", error);
    }
  };

  const renderAddPatient = () => (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="mb-4">
        <button
          onClick={() => setActiveView("patients")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Patients
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
      </div>
      <PatientForm
        onSubmit={handleAddPatient}
        onCancel={() => setActiveView("patients")}
        getAccessTokenSilently={getAccessTokenSilently}
      />
    </div>
  );

  const renderOverview = () => (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}</p>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              You have {patients.length} patient
              {patients.length !== 1 ? "s" : ""} assigned to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-400"
          onClick={() => setActiveView("addPatient")}
        >
          Add New Patient
        </button>
      </div>

      {isLoadingPatients ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading patients...</p>
        </div>
      ) : (
        <>
          {/* Patients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div
                key={patient.auth0_user_id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {getFullName(patient)}
                  </h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Age:</span>{" "}
                    {calculateAge(patient.date_of_birth)}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {patient.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {patient.phone}
                  </p>
                  <p>
                    <span className="font-medium">Joined:</span>{" "}
                    {formatDate(patient.created_at)}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setActiveView("patientDetails");
                    }}
                    className="flex-1 bg-blue-300 text-white py-2 px-3 rounded text-sm hover:bg-blue-100"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setEditingPatient(patient);
                      setActiveView("editPatient");
                    }}
                    className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded text-sm hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {patients.length === 0 && !isLoadingPatients && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No patients found.</p>
              <p className="text-gray-400 text-sm mt-2">
                Click "Add New Patient" to add your first patient.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <SidebarProvider>
      <Sidebar onNavigate={setActiveView} />
      <SidebarInset>
        {activeView === "overview" && renderOverview()}
        {activeView === "patients" && renderPatients()}
        {activeView === "addPatient" && renderAddPatient()}
        {activeView === "patientDetails" && selectedPatient && (
          <PatientDetails
            patient={selectedPatient}
            onBack={() => setActiveView("patients")}
          />
        )}
        {activeView === "editPatient" && editingPatient && (
          <EditPatientForm
            patient={editingPatient}
            onSave={handleEditPatient}
            onCancel={() => setActiveView("patients")}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
