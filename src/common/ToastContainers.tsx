// Toasts.tsx
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastContainerStyle = {
  position: toast.POSITION.BOTTOM_RIGHT,
  autoClose: 3000,
  hideProgressBar: true,
  closeButton: false,
  closeOnClick: true,
  pauseOnHover: true,
  className: "custom-toast",
};

export const SuccessToast: React.FC = () => {
  return <ToastContainer {...ToastContainerStyle} className="success-toast" />;
};

export const ErrorToast: React.FC = () => {
  return <ToastContainer {...ToastContainerStyle} className="error-toast" />;
};

export const showToastSuccess = (message: string) => {
  toast.success(message, {
    toastId: "success-toast",
  });
};

export const showToastError = (message: string) => {
  toast.error(message, {
    toastId: "error-toast",
  });
};
