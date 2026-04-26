"use client";

import { getToken, onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import { getFirebaseMessaging } from "../_lib/firebase";
import { useUser } from "./user-provider";

export function PushNotifications() {
  const { user } = useUser();
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!user || isRegistering || typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "denied") return;

    async function register() {
      setIsRegistering(true);
      try {
        const permission =
          Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();

        if (permission !== "granted") return;

        const messaging = await getFirebaseMessaging();
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!messaging || !vapidKey) return;

        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        const token = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration
        });

        if (!token) return;

        await fetch("/api/notifications/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            platform: "WEB",
            userAgent: navigator.userAgent
          })
        });

        onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? "Residente";
          const body = payload.notification?.body ?? "";
          const url = payload.data?.url ?? "/app";
          const notification = new Notification(title, {
            body,
            data: { url }
          });
          notification.onclick = () => {
            window.focus();
            window.location.href = url;
          };
        });
      } finally {
        setIsRegistering(false);
      }
    }

    void register();
  }, [isRegistering, user]);

  return null;
}
