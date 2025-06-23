import { useAuth0 } from "@auth0/auth0-react";
import { calculateAge, getFullName, formatDate } from "../utils/patientHelpers";

interface PatientProfileProps {
  patient: any;
}

export default function PatientProfile({ patient }: PatientProfileProps) {
  const { user } = useAuth0();

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Your personal information</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <p className="text-base text-gray-900">
              {patient ? getFullName(patient) : user?.name || "Not available"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-base text-gray-900">
              {patient?.email || user?.email || "Not available"}
            </p>
          </div>

          {patient?.date_of_birth && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <p className="text-base text-gray-900">
                {formatDate(patient.date_of_birth)}
              </p>
            </div>
          )}

          {patient?.date_of_birth && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <p className="text-base text-gray-900">
                {calculateAge(patient.date_of_birth)} years old
              </p>
            </div>
          )}

          {patient?.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <p className="text-base text-gray-900">{patient.phone}</p>
            </div>
          )}

          {patient?.created_at && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-base text-gray-900">
                {formatDate(patient.created_at)}
              </p>
            </div>
          )}
        </div>

        {patient?.doctor_id && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Healthcare Provider
            </h3>
            <p className="text-sm text-gray-600">
              You are currently assigned to a healthcare provider.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
