import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBsS_AcUw6kO6881GbpKVEs8lyJdWZmXVo',
  authDomain: 'test-64a06.firebaseapp.com',
  projectId: 'test-64a06',
  storageBucket: 'test-64a06.firebasestorage.app',
  messagingSenderId: '948962394934',
  appId: '1:948962394934:web:fe0a6acfc6bd5deaeee997',
  measurementId: 'G-GE1BSYTX3E',
};

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const getFirebaseServices = () => ({
  app: firebaseApp,
  auth: getAuth(firebaseApp),
  db: getFirestore(firebaseApp),
});

export const ADMIN_EMAIL = 'ntujj@ms.tyc.edu.tw';
