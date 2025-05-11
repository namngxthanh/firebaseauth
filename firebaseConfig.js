// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDToufaF1tyvH_kENad273Xze4WeC_hqnQ",
    authDomain: "authenlab-3c000.firebaseapp.com",
    projectId: "authenlab-3c000",
    storageBucket: "authenlab-3c000.firebasestorage.app",
    messagingSenderId: "200610251575",
    appId: "1:200610251575:web:216d64e3d9c4ec5c2d10b2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db };
