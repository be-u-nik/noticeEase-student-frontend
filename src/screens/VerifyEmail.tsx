import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import { verifyEmail } from "../utils/asyncAuthUtils";

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token: string = searchParams.get("token") || "";
  const navigate = useNavigate();
  const verifyMutation = useMutation(() => verifyEmail(token), {
    onSuccess: (_data) => {
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },
    onError: () => {
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },
  });

  React.useEffect(() => {
    verifyMutation.mutate();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen font-primary max-w-[540px] mx-auto">
      {verifyMutation.isLoading && (
        <div className="animate-spin h-16 w-16 border-t-4 border-blue-500 border-solid rounded-full"></div>
      )}
      {verifyMutation.isSuccess && (
        <div className="h-40 w-40 flex items-center justify-center rounded-full bg-green-500">
          <span className="text-white font-bold text-xl">Email Verified</span>
        </div>
      )}
      {verifyMutation.isError && (
        <div className="h-40 w-40 flex items-center justify-center rounded-full bg-red-500">
          <span className="text-white font-bold text-xl">Invalid Token</span>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
