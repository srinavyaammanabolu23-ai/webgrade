import { useState, useEffect, useCallback } from 'react';
import {
  collection, addDoc, query, where, orderBy, limit,
  getDocs, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const MAX_HISTORY = 50;

export function useSearchHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load history on mount / user change
  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'searchHistory'),
          where('uid', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(MAX_HISTORY)
        );
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHistory(items);
      } catch (err) {
        console.warn('Failed to load search history:', err.message);
        // Fallback to localStorage
        try {
          const local = JSON.parse(localStorage.getItem(`wg-history-${user.uid}`) || '[]');
          setHistory(local);
        } catch { setHistory([]); }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  // Add a search to history
  const addSearch = useCallback(async (queryStr, resultCount, topResult) => {
    if (!user) return;

    const entry = {
      uid: user.uid,
      query: queryStr,
      resultCount: resultCount || 0,
      topResult: topResult || '',
      timestamp: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'searchHistory'), entry);
      const localEntry = {
        id: docRef.id,
        ...entry,
        timestamp: { seconds: Math.floor(Date.now() / 1000) },
      };
      setHistory(prev => [localEntry, ...prev].slice(0, MAX_HISTORY));
    } catch (err) {
      console.warn('Failed to save search history to Firestore:', err.message);
      // Fallback: save to localStorage
      const localEntry = {
        id: Date.now().toString(),
        ...entry,
        timestamp: { seconds: Math.floor(Date.now() / 1000) },
      };
      setHistory(prev => {
        const updated = [localEntry, ...prev].slice(0, MAX_HISTORY);
        localStorage.setItem(`wg-history-${user.uid}`, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  // Clear all history
  const clearHistory = useCallback(async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'searchHistory'),
        where('uid', '==', user.uid)
      );
      const snap = await getDocs(q);
      const deletes = snap.docs.map(d => deleteDoc(doc(db, 'searchHistory', d.id)));
      await Promise.all(deletes);
    } catch (err) {
      console.warn('Failed to clear Firestore history:', err.message);
    }
    localStorage.removeItem(`wg-history-${user.uid}`);
    setHistory([]);
  }, [user]);

  return { history, loading, addSearch, clearHistory };
}
