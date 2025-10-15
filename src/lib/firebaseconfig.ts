// src/lib/firebaseconfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPZy2KJ9QQwfWZx_3-4wz8UVn8onnUyGQ",
  authDomain: "neuropath-66527.firebaseapp.com",
  projectId: "neuropath-66527",
  storageBucket: "neuropath-66527.appspot.com", // ✅ corrected
  messagingSenderId: "701166027169",
  appId: "1:701166027169:web:bbac8718d05a845edd0be0",
  measurementId: "G-724MFSJ8PV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
