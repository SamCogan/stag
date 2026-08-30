import { initializeApp } from "firebase/app";
import { getDatabase, off, onValue, ref, update } from "firebase/database";
import type { Database } from "firebase/database";

type Scores = Record<string, number>;

export interface RemoteStore {
  subscribe(callback: (scores: Scores) => void): () => void;
  update(patch: Scores): Promise<void>;
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

const getDb = (): Database | null => {
  if (!isCompleteConfig(config)) {
    return null;
  }

  if (!db) {
    const app = initializeApp(config);
    db = getDatabase(app);
  }

  return db;
};

const toScores = (value: unknown): Scores => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] =>
        typeof entry[1] === "number" && Number.isFinite(entry[1]),
    ),
  );
};

export const createRemoteStore = (eventCode: string): RemoteStore | null => {
  const database = getDb();
  if (!database || !eventCode) {
    return null;
  }

  const root = ref(database, `events/${eventCode}/scores`);

  return {
    subscribe(callback) {
      const listener = onValue(root, (snapshot) => {
        callback(toScores(snapshot.val()));
      });

      return () => off(root, "value", listener);
    },
    update(patch) {
      return update(root, patch);
    },
  };
};
