import { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onValue, ref } from 'firebase/database';

export function useGamification() {
  const [streak, setStreak] = useState({ currentStreak:0, longestStreak:0, lastLogDate:null as string | null });
  const [badges, setBadges] = useState<Record<string, any>>({});
  useEffect(()=>{
    const user = auth.currentUser; if(!user) return;
    const base = ref(db, `users/${user.uid}/gamification`);
    const unsub = onValue(base, snap => {
      const val = snap.val()||{};
      setStreak(val.streak || { currentStreak:0, longestStreak:0, lastLogDate:null });
      setBadges(val.badges || {});
    });
    return () => unsub();
  }, [auth.currentUser?.uid]);
  return { streak, badges };
}
