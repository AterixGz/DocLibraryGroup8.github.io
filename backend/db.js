const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDx-7GocGZlziCRzz1DlZAQWrfjuOzJ_Vc",
  authDomain: "doclibrary401.firebaseapp.com",
  projectId: "doclibrary401",
  storageBucket: "doclibrary401.firebasestorage.app",
  messagingSenderId: "888811334407",
  appId: "1:888811334407:web:a360d01dc5c49d7762f3a2",
  measurementId: "G-1213FTJW6G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };