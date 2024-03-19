import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { initializeApp } from "firebase/app";
// import { getAnalytics, isSupported } from "firebase/analytics";
import { getToken, getMessaging } from "firebase/messaging";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID,
};

//Initialize Firebase and get the messaging module
const firebaseApp = initializeApp(firebaseConfig);
export const analytics = isSupported().then((yes) => (yes ? getAnalytics(firebaseApp) : null));
// const analytics = getAnalytics(firebaseApp);
const messaging = getMessaging(firebaseApp);

// console.log("analytics", analytics);

export const generateToken = async (registration: ServiceWorkerRegistration) => {
  if ("serviceWorker" in navigator) {
    // Register the service worker
    getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration,
    })
      .then(async (currentToken) => {
        if (currentToken) {
          // storeFCMTokenInCookie(currentToken);
        } else {
          console.log("No registration token available. Request permission to generate one.");
        }
      })
      .catch((err) => {
        console.log("An error occurred while retrieving token. ", err);
      });
  }
};

if ("serviceWorker" in navigator) {
  // && !/localhost/.test(window.location)) {
  // console.log("njk");
  const updateSW = registerSW({
    onOfflineReady() {
      console.log("offline ready");
    },
    onNeedRefresh() {
      if (confirm("New content available. Reload?")) {
        updateSW(true);
      }
    },
    async onRegisteredSW(_swScriptUrl, registration) {
      if (registration) generateToken(registration);
      const ga = await analytics;
      if (ga instanceof Promise) {
        console.log("not resolved");
      } else {
        console.log("resolved");
        ga && logEvent(ga, "resolved");
      }
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
