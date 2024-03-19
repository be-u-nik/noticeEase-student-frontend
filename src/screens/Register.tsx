import React from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { registerStudent } from "../utils/asyncAuthUtils";
import { ErrorToast, SuccessToast, showToastError, showToastSuccess } from "../common/ToastContainers";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { analytics } from "../main";
import { logEvent } from "firebase/analytics";

interface FormData {
  rollNumber: string;
  email: string;
  phoneNumber?: string;
  username: string;
  password: string;
  confirmPassword: string;
  reason: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
  } = useForm<FormData>();

  const registerMutation = useMutation(registerStudent, {
    onSuccess: async () => {
      if (analytics instanceof Promise) {
        const analyticsInstance = await analytics;
        if (analyticsInstance) {
          logEvent(analyticsInstance, "user_register");
        }
      } else {
        analytics && logEvent(analytics, "user_register");
      }
      showToastSuccess("Registration successful! Check your Email");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (error: Error) => {
      showToastError(error.message);
    },
  });

  const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{8,}$/;

  const onSubmit = (data: FormData) => {
    console.log(data);
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
    } else {
      registerMutation.mutate(data);
    }
  };

  return (
    <div className="bg-light p-4 pt-8 font-primary max-w-[540px] mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center mb-12">NoticeEase</h1>

      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="rollNumber">Roll Number</label>
          <input
            type="text"
            {...register("rollNumber", { required: true })}
            className="border-b border-gray-400 w-full py-2 px-4 bg-transparent"
          />
          {errors.rollNumber && <div className="error-tooltip">{errors.rollNumber.message}</div>}
        </div>
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
        {/* <div>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            {...register("phoneNumber", { required: true })}
            className="border-b border-gray-400 w-full py-2 px-4 bg-transparent"
          />
          {errors.phoneNumber && <div className="error-tooltip">{errors.phoneNumber.message}</div>}
        </div> */}
        <div>
          <label htmlFor="username">Student Name</label>
          <input
            type="text"
            {...register("username", { required: true })}
            className="border-b border-gray-400w-full py-2 px-4 bg-transparent"
          />
          {errors.username && <div className="error-tooltip">{errors.username.message}</div>}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            {...register("password", {
              required: true,
              pattern: {
                value: passwordValidationRegex,
                message:
                  "Password must have at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters long.",
              },
            })}
            className="border-b border-gray-400w-full py-2 px-4 bg-transparent"
          />
          {errors.password && <div className="error-tooltip">{errors.password.message}</div>}
        </div>
        <div>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword", { required: true })}
            className="border-b border-gray-400 w-full py-2 px-4 bg-transparent"
          />
          {errors.confirmPassword && <div className="error-tooltip">{errors.confirmPassword.message}</div>}
        </div>
        <div>
          <label htmlFor="reason">Reason for Access</label>
          <textarea
            {...register("reason", { required: true, maxLength: 300 })}
            className={`border ${
              errors.reason ? "border-red-500" : "border-gray-400"
            } rounded-md w-full py-2 px-4 bg-transparent resize-none min-h-[100px]`}
            placeholder="Reason for requesting access to the app..."
          />
          {errors.reason && <div className="error-tooltip">{errors.reason.message}</div>}
          {errors.reason?.type === "maxLength" && (
            <div className="text-xs text-red-500 mt-1">Maximum 300 characters allowed.</div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={registerMutation.isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            {registerMutation.isLoading ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500">
            Login here
          </Link>
        </p>
      </div>
      <SuccessToast />
      <ErrorToast />
    </div>
  );
};

export default Register;
