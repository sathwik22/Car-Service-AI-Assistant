// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyClToHQGEylkWceIR_lvoT8xYkIffnZ_E8',
    authDomain: 'bosch-car-service-ai.firebaseapp.com',
    projectId: 'bosch-car-service-ai',
    storageBucket: 'bosch-car-service-ai.firebasestorage.app',
    messagingSenderId: '818672878625',
    appId: '1:818672878625:web:4ef9c0816cc456da018f60',
    measurementId: 'G-WNV8N7GT97',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
