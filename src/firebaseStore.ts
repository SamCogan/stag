import { initializeApp } from "firebase/app";
import { getDatabase, off, onValue, ref, update } from "firebase/database";

import type { Database } from "firebase/database";

export interface RemoteStore<State> {
  subscribe(callback: (state: State) => void): () => void;
  update(patch: Record<string, unknown>): Promise<void>;
}

let db: Database | null = null;

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isCompleteConfig = (
  value: typeof config,
): value is Record<keyof typeof config, string> =>
  Object.values(value).every(
    (entry): entry is string => typeof entry === "string" && entry.length > 0,
  );

const getDatabaseInstance = (): Database | null => {
  if (!isCompleteConfig(config)) {
    return null;
  }

  if (!db) {
    const app = initializeApp(config);
    db = getDatabase(app);
  }

  return db;
};

export const createRemoteStore = <State>(
  eventCode: string,
  parseState: (input: unknown) => State,
): RemoteStore<State> | null => {
  const database = getDatabaseInstance();
  if (!database || !eventCode) {
    return null;
  }

  const root = ref(database, `events/${eventCode}`);

  return {
    subscribe(callback) {
      const listener = onValue(root, (snapshot) => {
        callback(parseState(snapshot.val()));
      });

      return () => {
        off(root, "value", listener);
      };
    },
    update(patch) {
      return update(root, patch);
    },
  };
};
