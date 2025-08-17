import { useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onValue, ref } from 'firebase/database';

export function useOnboardingStatus() {
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(()=>{
    const user = auth.currentUser;
    if(!user){ setCompleted(null); setLoading(false); return; }
    const profileRef = ref(db, `users/${user.uid}/profile/onboardingCompleted`);
    const unsub = onValue(profileRef, snap => {
      setCompleted(!!snap.val());
      setLoading(false);
    }, ()=> setLoading(false));
    return () => unsub();
  }, [auth.currentUser?.uid]);

  return { loading, completed };
}
