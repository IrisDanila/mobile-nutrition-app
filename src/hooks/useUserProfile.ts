import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../services/firebase';
import { ref, onValue, set } from 'firebase/database';
import { updateProfile } from 'firebase/auth';

export function useUserProfile() {
  const user = auth.currentUser;
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    if(!user){ setLoading(false); return; }
    const r = ref(db, `users/${user.uid}/profile/username`);
    const unsub = onValue(r, snap => {
      if (snap.exists()) setUsername(snap.val());
      else setUsername(user.displayName || user.email?.split('@')[0] || '');
      setLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const saveUsername = useCallback(async (value: string) => {
    if (!user) return; setUsername(value);
    await set(ref(db, `users/${user.uid}/profile/username`), value);
    try { await updateProfile(user, { displayName: value }); } catch {}
  }, [user]);

  return { username, setUsername, saveUsername, loading };
}
