import { Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp
} from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

export const FCM_MESSAGING = Symbol("FCM_MESSAGING");

export const firebaseMessagingProvider: Provider<Messaging | null> = {
  provide: FCM_MESSAGING,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const projectId = config.get<string>("FIREBASE_PROJECT_ID");
    const clientEmail = config.get<string>("FIREBASE_CLIENT_EMAIL");
    const privateKey = config
      .get<string>("FIREBASE_PRIVATE_KEY")
      ?.replace(/\\n/g, "\n");
    const serviceAccountJson = config.get<string>("FIREBASE_SERVICE_ACCOUNT_JSON");

    if (!getApps().length) {
      if (serviceAccountJson) {
        initializeApp({
          credential: cert(JSON.parse(serviceAccountJson))
        });
      } else if (projectId && clientEmail && privateKey) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey
          })
        });
      } else if (projectId) {
        initializeApp({
          credential: applicationDefault(),
          projectId
        });
      } else {
        return null;
      }
    }

    return getMessaging();
  }
};
