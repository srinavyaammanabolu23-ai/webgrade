import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBdpd7KEQD3WxEfdy8O9WAhNy3wT0Dg1z8',
  authDomain: 'webgrade-8a442.firebaseapp.com',
  projectId: 'webgrade-8a442',
  storageBucket: 'webgrade-8a442.appspot.com',
  messagingSenderId: '',
  appId: '',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
