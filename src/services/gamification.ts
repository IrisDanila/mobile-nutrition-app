import { ref, get, set, update, child } from 'firebase/database';
import { db, auth } from './firebase';
import { format } from 'date-fns';

export interface MealSummaryInput { calories: number; protein: number; carbs: number; fat: number; }
interface BadgeDef { id: string; condition: (ctx:Ctx)=> boolean; label: string; }
interface Ctx { currentStreak: number; meal: MealSummaryInput; badges: Record<string, any>; firstLog: boolean; }

const badgeDefs: BadgeDef[] = [
  { id:'first_log', label:'First Log', condition: ctx => ctx.firstLog },
  { id:'streak_3', label:'3-Day Streak', condition: ctx => ctx.currentStreak >= 3 },
  { id:'streak_7', label:'7-Day Streak', condition: ctx => ctx.currentStreak >= 7 },
  { id:'protein_100', label:'Protein 100g Meal', condition: ctx => ctx.meal.protein >= 100 }
];

export async function updateGamificationAfterMeal(meal: MealSummaryInput) {
  const user = auth.currentUser; if(!user) return { newBadges: [] as string[] };
  const baseRef = ref(db, `users/${user.uid}/gamification`);
  const streakRef = child(baseRef, 'streak');
  const badgesRef = child(baseRef, 'badges');
  const today = format(new Date(), 'yyyy-MM-dd');
  const streakSnap = await get(streakRef);
  const badgesSnap = await get(badgesRef);
  let currentStreak = 0; let lastLogDate: string | null = null; let longest = 0;
  if (streakSnap.exists()) { const v = streakSnap.val(); currentStreak = v.currentStreak||0; lastLogDate = v.lastLogDate||null; longest = v.longestStreak||0; }
  let firstLog = !streakSnap.exists();
  if (lastLogDate === today) {
    // already counted today
  } else {
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    if (lastLogDate === yesterday) currentStreak += 1; else currentStreak = 1;
    lastLogDate = today;
  }
  if (currentStreak > longest) longest = currentStreak;
  await set(streakRef, { currentStreak, lastLogDate, longestStreak: longest });

  const earnedBadges = badgesSnap.exists()? badgesSnap.val(): {};
  const ctx: Ctx = { currentStreak, meal, badges: earnedBadges, firstLog };
  const newBadges: string[] = [];
  for (const def of badgeDefs) {
    if (!earnedBadges[def.id] && def.condition(ctx)) {
      newBadges.push(def.id);
      await update(badgesRef, { [def.id]: { earnedAt: Date.now(), label: def.label } });
    }
  }
  return { newBadges, currentStreak };
}

export async function getGamificationSnapshot() {
  const user = auth.currentUser; if(!user) return null;
  const baseRef = ref(db, `users/${user.uid}/gamification`);
  const streakSnap = await get(child(baseRef,'streak'));
  const badgesSnap = await get(child(baseRef,'badges'));
  return {
    streak: streakSnap.exists()? streakSnap.val(): { currentStreak:0, lastLogDate:null, longestStreak:0 },
    badges: badgesSnap.exists()? badgesSnap.val(): {}
  };
}

export const badgeCatalog = badgeDefs.map(b=> ({ id:b.id, label: b.label }));
