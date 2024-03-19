import { useContext } from "react";
import { Routes as Router, Route, Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Register from "./screens/Register";
import VerifyEmail from "./screens/VerifyEmail";
import Notices from "./screens/Notices";
import About from "./screens/About";
import NoticeDetailsPage from "./common/NoticeDetailsPage";

const PrivateRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
const AuthRoutes = () => {
  const { isAuthenticated } = useContext(AuthContext);
  if (isAuthenticated) {
    return <Navigate to="/notices" replace />;
  }

  return <Outlet />;
};

const Routes = () => {
  return (
    <Router>
      <Route element={<AuthRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verifyEmail" element={<VerifyEmail />} />
      </Route>
      <Route element={<PrivateRoutes />}>
        <Route path="/" element={<Home />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/about" element={<About />} />
        <Route path="/notices/:_id" element={<NoticeDetailsPage />} />
      </Route>
    </Router>
  );
};

export default Routes;
