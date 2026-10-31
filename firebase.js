// Firebase optional setup.
// 1) Create a Firebase project: https://console.firebase.google.com/
// 2) Add a Web App and paste its config below.
// 3) Enable Authentication > Sign-in method > Anonymous.
// 4) Create Firestore Database and publish the rules shown after the code.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

const isConfigured =
  firebaseConfig.apiKey !== "PASTE_YOUR_FIREBASE_API_KEY" &&
  firebaseConfig.projectId !== "PASTE_YOUR_PROJECT_ID";

let auth = null;
let db = null;
let firebaseReady = false;

if (isConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseReady = true;
  } catch (error) {
    console.warn("Firebase tidak dapat dimulakan:", error);
  }
}

function waitForUser() {
  if (!firebaseReady || !auth) return Promise.resolve(null);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) return resolve(user);
      try {
        const credential = await signInAnonymously(auth);
        resolve(credential.user);
      } catch (error) {
        console.warn("Anonymous sign-in gagal:", error);
        resolve(null);
      }
    });
  });
}

async function getCloudFavorites(user) {
  if (!db || !user) return [];
  const snapshot = await getDocs(collection(db, "users", user.uid, "favorites"));
  return snapshot.docs.map((item) => item.data());
}

async function saveCloudFavorite(user, book) {
  if (!db || !user) return;
  await setDoc(doc(db, "users", user.uid, "favorites", book.key), book);
}

async function removeCloudFavorite(user, workKey) {
  if (!db || !user) return;
  await deleteDoc(doc(db, "users", user.uid, "favorites", workKey));
}

export {
  firebaseReady,
  waitForUser,
  getCloudFavorites,
  saveCloudFavorite,
  removeCloudFavorite
};
