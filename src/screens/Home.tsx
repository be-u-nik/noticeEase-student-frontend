// src/screens/Home.tsx

import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

const Home: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate("/notices");
  }, []);

  return (
    <div className="font-primary  max-w-[540px] mx-auto">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default Home;
