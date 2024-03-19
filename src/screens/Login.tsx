import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import { loginStudent } from "../utils/asyncAuthUtils";
import { ErrorToast, SuccessToast, showToastError, showToastSuccess } from "../common/ToastContainers";
import { useForm } from "react-hook-form";
import { AuthContext } from "../context/AuthContext";
import { analytics, generateToken } from "../main";
import { logEvent } from "firebase/analytics";

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>();

  const loginMutation = useMutation(loginStudent, {
    onSuccess: async () => {
      if (analytics instanceof Promise) {
        const analyticsInstance = await analytics;
        if (analyticsInstance) {
          logEvent(analyticsInstance, "user_login");
        }
      } else {
        analytics && logEvent(analytics, "user_login");
      }
      showToastSuccess("Login successful!");
      setIsAuthenticated(true);
      navigate("/");
    },
    onError: async (error: Error) => {
      if (error.message === "Please enable notifications to login") {
        showToastError(error.message);
        await Notification.requestPermission().then(async (permission) => {
          if (permission === "granted") {
            const swreg = await navigator.serviceWorker.getRegistration();
            {
              if (swreg) await generateToken(swreg);
            }
          }
        });
      }
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="bg-light p-4 pt-8 flex flex-col font-primary max-w-[540px] mx-auto">
      {" "}
      {/* Use flex to arrange elements in a column */}
      <h1 className="text-2xl font-bold mb-4 text-center mb-12">NoticeEase</h1>
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="text"
            {...register("email", {
              required: true,
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/i,
                message: "Email must be a valid @gmail.com address",
              },
            })}
            className="border-b border-gray-400 w-full py-2 px-4 bg-transparent"
          />
          {errors.email && <div className="error-tooltip">{errors.email.message}</div>}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            {...register("password", {
              required: true,
            })}
            className="border-b border-gray-400 w-full py-2 px-4 bg-transparent"
          />
          {errors.password && <div className="error-tooltip">{errors.password.message}</div>}
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={loginMutation.isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            {loginMutation.isLoading ? "Logging In..." : "Login"}
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <p>
          Don't have an account yet?{" "}
          <Link to="/register" className="text-blue-500">
            Register here
          </Link>
        </p>
      </div>
      <SuccessToast />
      <ErrorToast />
    </div>
  );
};

export default Login;
