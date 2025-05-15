import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

  useEffect(() => {
    if (!currentUser) {
      // If not authenticated, redirect to login
      navigate("/login");
      return;
    }

    // Role-based redirections
    switch (currentUser.role) {
      case "Admin":
        navigate("/admin");
        break;
      case "TeamLeader":
        navigate("/team-leader");
        break;
      case "Employee":
        navigate("/employee");
        break;
      default:
        navigate("/login");
    }
  }, [navigate, currentUser]);

  return null;
};

export default Index;
