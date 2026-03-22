import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch extra profile data from Firestore (gracefully fail if rules block)
        let profile = {};
        try {
          const profileRef = doc(db, 'users', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) profile = profileSnap.data();
        } catch (e) {
          console.warn('Firestore read failed (check rules):', e.message);
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || profile.displayName || 'User',
          photoURL: firebaseUser.photoURL || profile.photoURL || null,
          ...profile,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Register with email + password
  async function register(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    // Save to Firestore (gracefully fail)
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        displayName,
        email,
        photoURL: null,
        createdAt: serverTimestamp(),
        theme: 'dark',
      });
    } catch (e) {
      console.warn('Firestore write failed (check rules):', e.message);
    }
    return cred.user;
  }

  // Login with email + password
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  // Login with Google
  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider);
    // Create Firestore profile if first login (gracefully fail)
    try {
      const profileRef = doc(db, 'users', cred.user.uid);
      const profileSnap = await getDoc(profileRef);
      if (!profileSnap.exists()) {
        await setDoc(profileRef, {
          displayName: cred.user.displayName || 'User',
          email: cred.user.email,
          photoURL: cred.user.photoURL,
          createdAt: serverTimestamp(),
          theme: 'dark',
        });
      }
    } catch (e) {
      console.warn('Firestore write failed (check rules):', e.message);
    }
    return cred.user;
  }

  // Logout
  async function logout() {
    await signOut(auth);
  }

  // Update profile
  async function updateUserProfile(data) {
    if (!user) return;
    const profileRef = doc(db, 'users', user.uid);
    await setDoc(profileRef, data, { merge: true });
    if (data.displayName) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }
    setUser(prev => ({ ...prev, ...data }));
  }

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
