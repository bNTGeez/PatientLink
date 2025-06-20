import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";
import LogoutButton from "../components/LogoutButton";

export default function DoctorDashboard() {
  const { user } = useAuth0();

  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <LogoutButton />
    </div>
  );
}
