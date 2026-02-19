// js/firebase-config.js
// // 1. Firebase SDKs (Internet se load honge)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// // 2. Your Web App's Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOQQ2pagkbbIzeOj3hzds8xXcxpPzzc5E",
    authDomain: "railwaylabsystem.firebaseapp.com",
    projectId: "railwaylabsystem",
    storageBucket: "railwaylabsystem.firebasestorage.app",
    messagingSenderId: "39811010112",
    appId: "1:39811010112:web:42204f026a1028768dd9a5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sabhi zaroori tools ko export karein
export { db, collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion };