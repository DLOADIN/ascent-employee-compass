import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

  useEffect(() => {
    // Check if we have a token but no current user (still loading)
    const token = localStorage.getItem('token');
    if (!currentUser && !token) {
      navigate("/");
      return;
    }

    // If we have a currentUser, handle role-based navigation
    if (currentUser) {
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
    }
  }, [navigate, currentUser]);

  // Show loading state while checking authentication
  if (!currentUser && localStorage.getItem('token')) {
    return <div>Loading...</div>;
  }

  return null;
};

export default Index;
