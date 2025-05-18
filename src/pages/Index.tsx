
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAppContext();

  useEffect(() => {
    // Check if we have a token but no current user (still loading)
    const token = localStorage.getItem('token');
    
    if (!currentUser && !token) {
      navigate("/login");
      return;
    }

    // If we have a currentUser, handle role-based navigation
    if (currentUser) {
      // Check if there's a stored last visited path
      const lastVisitedPath = localStorage.getItem('lastVisitedPath');
      
      // If we're coming from a specific location state (like after login)
      const from = location.state?.from;
      
      if (from) {
        // Navigate to the path the user was trying to access before login
        navigate(from);
      } else if (lastVisitedPath) {
        // Navigate to the last visited path if available
        navigate(lastVisitedPath);
      } else {
        // Default role-based navigation
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
    }
  }, [navigate, currentUser, location.state]);

  // Show loading state while checking authentication
  if (!currentUser && localStorage.getItem('token')) {
    return <div>Loading...</div>;
  }

  return null;
};

export default Index;
