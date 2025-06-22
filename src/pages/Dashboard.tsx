import { useEffect } from "react";
import { useNavigate } from "react-router";
import getUserRoles from "../utils/useHook";
import LogoutButton from "../components/LogoutButton";

export default function Dashboard() {
  const { isDoctor, isPatient, isAuthenticated } = getUserRoles();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (isDoctor) {
        navigate("/dashboard/doctor");
      } else if (isPatient) {
        navigate("/dashboard/patient");
      }
    }
  }, [isDoctor, isPatient, isAuthenticated, navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      <LogoutButton />
    </div>
  );
}
