import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/landing");
  }, [navigate]);

  return null; // This component will just redirect
};

export default Index;