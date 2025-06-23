import { useAuth0 } from "@auth0/auth0-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <div className="border-2 border-gray-300 bg-blue-400 rounded-lg p-2 w-24 h-12 flex items-center justify-center">
      <button
        onClick={() =>
          logout({ logoutParams: { returnTo: window.location.origin } })
        }
      >
        Log Out
      </button>
    </div>
  );
};

export default LogoutButton;
