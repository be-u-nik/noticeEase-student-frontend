
import { cacheNames, clientsClaim } from "workbox-core";

import { registerRoute, setCatchHandler, setDefaultHandler } from "workbox-routing";

import {
 NetworkFirst, 
  NetworkOnly, 
  Strategy, 
  StrategyHandler, 
} from "workbox-strategies";
import type { ManifestEntry } from "workbox-build";
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";
import { getToken } from "firebase/messaging";

interface MyServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
  __WB_MANIFEST: any;
}

declare let self: MyServiceWorkerGlobalScope;

declare type ExtendableEvent = any;

const data = {
  race: false, 
  debug: false, 
  credentials: "same-origin", 
  networkTimeoutSeconds: 0, 
  fallback: "index.html", 
};

const cacheName = cacheNames.runtime;

const buildStrategy = (): Strategy => {
  if (data.race) {
    class CacheNetworkRace extends Strategy {

      _handle(request: Request, handler: StrategyHandler): Promise<Response | undefined> {
        const fetchAndCachePutDone: Promise<Response> = handler.fetchAndCachePut(request);
        const cacheMatchDone: Promise<Response | undefined> = handler.cacheMatch(request);


        return new Promise((resolve, reject) => {
          fetchAndCachePutDone.then(resolve).catch((e) => {
            if (data.debug) console.log(`Cannot fetch resource: ${request.url}`, e);
          });
          cacheMatchDone.then((response) => response && resolve(response));


          Promise.allSettled([fetchAndCachePutDone, cacheMatchDone]).then((results) => {
            const [fetchAndCachePutResult, cacheMatchResult] = results;


            if (fetchAndCachePutResult.status === "rejected" && cacheMatchResult.status !== "fulfilled")
              reject(fetchAndCachePutResult.reason);
          });
        });
      }
    }
    return new CacheNetworkRace();
  } else {
    if (data.networkTimeoutSeconds > 0)
      return new NetworkFirst({ cacheName, networkTimeoutSeconds: data.networkTimeoutSeconds });
    else return new NetworkFirst({ cacheName });
  }
};

const manifest = self.__WB_MANIFEST as Array<ManifestEntry>;
const cacheEntries: RequestInfo[] = [];

const manifestURLs = manifest.map((entry) => {
  const url = new URL(entry.url, self.location.href);
  cacheEntries.push(
    new Request(url.href, {
      credentials: data.credentials as any,
    })
  );
  return url.href;
});

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(cacheEntries);
    })
  );
});

self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      cache.keys().then((keys) => {
        keys.forEach((request) => {
          data.debug && console.log(`Checking cache entry to be removed: ${request.url}`);
          if (!manifestURLs.includes(request.url)) {
            cache.delete(request).then((deleted) => {
              if (data.debug) {
                if (deleted) console.log(`Precached data removed: ${request.url || request}`);
                else console.log(`No precache found: ${request.url || request}`);
              }
            });
          }
        });
      });
    })
  );
});

registerRoute(({ url }) => manifestURLs.includes(url.href), buildStrategy());

setDefaultHandler(new NetworkOnly());

setCatchHandler(({ event }: any): Promise<Response> => {
  switch (event.request.destination) {
    case "document":
      return caches.match(data.fallback).then((r) => {
        return r ? Promise.resolve(r) : Promise.resolve(Response.error());
      });
    default:
      return Promise.resolve(Response.error());
  }
});

self.skipWaiting();
clientsClaim();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID,
};

const firebaseApp = initializeApp(firebaseConfig);
const analytics = isSupported().then((yes) => {
  console.log("yes");
  return yes ? getAnalytics(firebaseApp) : null;
});
const messaging = getMessaging(firebaseApp);


self.addEventListener("notificationclick", async (event) => {
  try {
    if (analytics instanceof Promise) {
      const analyticsInstance = await analytics;
      if (analyticsInstance) {
        logEvent(analyticsInstance, "notification_opened");
      }
    } else {
      analytics && logEvent(analytics, "notification_opened");
    }
  } catch (e) {
    console.log(e);
  }

  const clickAction = import.meta.env.VITE_STUDENT_APP_CLICKACTION;
  if (clickAction) {
    event.notification.close();
    event.waitUntil(self.clients.openWindow(clickAction));
  }
});

onBackgroundMessage(messaging, async (payload: any) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.title,
    icon: "/android-chrome-192x192.png",
    data: {
      link: payload.fcmOptions.link,
    },
  };
  try {
    if (analytics instanceof Promise) {
      const analyticsInstance = await analytics;
      if (analyticsInstance) {
        logEvent(analyticsInstance, "notification_received");
      }
    } else {
      analytics && logEvent(analytics, "notification_received");
    }
  } catch (e) {
    console.log(e);
  }

  return await self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("pushsubscriptionchange", async () => {
  await getToken(messaging, {
    vapidKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    serviceWorkerRegistration: self.registration,
  })
    .then(async (currentToken) => {
      if (currentToken) {
        console.log("first");

      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
});
