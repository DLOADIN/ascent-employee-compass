import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

  useEffect(() => {
    // If user is logged in, redirect to dashboard, otherwise to login
    if (currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate, currentUser]);

  return null;
};

export default Index;
