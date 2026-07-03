import App from "../App";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  }

  return (
    <div className="relative">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 z-10 bg-surface border border-border text-muted text-xs px-3 py-1.5 rounded-lg hover:text-danger hover:border-danger transition cursor-pointer"
      >
        Logout
      </button>
      <App />
    </div>
  );
}