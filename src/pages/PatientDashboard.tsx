import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "../components/LogoutButton";

export default function PatientDashboard() {

  return (
    <div>
      <h1>Patient Dashboard</h1>
      <LogoutButton />
    </div>
  );
}
