// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, DocumentData } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyC7uluw_8K0IKdzLjYqPrkqlcCIrn8HpM0",
  authDomain: "webscrapping-5fe35.firebaseapp.com",
  projectId: "webscrapping-5fe35",
  storageBucket: "webscrapping-5fe35.firebasestorage.app",
  messagingSenderId: "968437353906",
  appId: "1:968437353906:web:ed95ddc57294492721a8ab",
  measurementId: "G-8CLRXB56YR"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Function to fetch offers from the 'offers' collection
export const fetchOffers = async (): Promise<DocumentData[]> => {
  const offersCollection = collection(db, "offers");
  const offersSnapshot = await getDocs(offersCollection);

  const offers: DocumentData[] = [];

  offersSnapshot.forEach((doc) => {
    // Assuming each document has a field called 'offers' which is an array
    const documentData = doc.data();
    if (documentData.offers && Array.isArray(documentData.offers)) {
      offers.push(...documentData.offers);
    }
  });
  console.log(offers)
  return offers;
};