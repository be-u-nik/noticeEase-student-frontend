import {
  storeStudentInfoInIndexedDB,
  storeAuthTokenInCookie,
  getFCMTokenFromIDB,
  removeAuthTokenFromCookie,
} from "../context/AuthContext";
import { generateToken } from "../main";
import { subscribeToTopic } from "./asyncMessagingUtils";

export async function registerStudent(formData: any) {
  try {
    const registerResponse = await fetch(`${import.meta.env.VITE_CDC_APP_BACKEND_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      throw new Error(error.error);
    }

    const registerData = await registerResponse.json();
    return { registerData };
  } catch (error) {
    console.error("Error during registration and user data fetch:", error);
    throw error;
  }
}

export async function loginStudent(formData: any) {
  try {
    // Perform your login API call
    const loginResponse = await fetch(`${import.meta.env.VITE_CDC_APP_BACKEND_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      throw new Error(error.error);
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.authToken;

    storeAuthTokenInCookie(authToken);

    const studentDataResponse = await fetch(`${import.meta.env.VITE_CDC_APP_BACKEND_BASE_URL}/api/users/getUser`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!studentDataResponse.ok) {
      throw new Error("Failed to fetch student data.");
    }

    const { user } = await studentDataResponse.json();

    if (studentDataResponse.ok && loginResponse.ok) {
      try {
        if (Notification.permission === "granted") {
          const fcmToken = await getFCMTokenFromIDB();

          console.log(fcmToken);
          if (fcmToken) subscribeToTopic(fcmToken, user.rollNumber);
        } else {
          await Notification.requestPermission().then(async (permission) => {
            if (permission === "granted") {
              const swreg = await navigator.serviceWorker.getRegistration();

              if (swreg) await generateToken(swreg);
            }
          });
          // throw new Error("notification permission not granted");
        }
      } catch (e) {
        removeAuthTokenFromCookie();
        throw new Error("Please enable notifications to login");
      }
    }

    await storeStudentInfoInIndexedDB({
      rollNumber: user.rollNumber,
      email: user.email,
      phoneNumber: user.phoneNumber,
      username: user.username,
      verified: user.verified,
    });

    return { user };
  } catch (error) {
    console.error("Error during login and user data fetch:", error);
    throw error;
  }
}

export async function verifyEmail(token: string | undefined): Promise<string> {
  try {
    const verifyResponse = await fetch(`${import.meta.env.VITE_CDC_APP_BACKEND_BASE_URL}/api/users/validate/${token}`, {
      method: "GET",
    });

    if (!verifyResponse.ok) {
      throw new Error("Email verify failed.");
    }

    const verifyData = await verifyResponse.json();
    return verifyData;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
