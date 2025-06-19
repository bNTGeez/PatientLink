import { useNavigate } from "react-router";

export default function DashboardButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/dashboard")}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Dashboard
    </button>
  );
}
