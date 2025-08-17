// Multi-item AI analysis stub. Replace with real endpoint/model later.
export interface MealItemAnalysis {
  id: string;
  name: string;
  confidence: number; // 0-1
  quantity: string;
  calories: number;
  macros: { protein: number; carbs: number; fat: number };
}

export async function analyzeMeal(imageUris: string[]): Promise<MealItemAnalysis[]> {
  await new Promise(r=>setTimeout(r, 900));
  const base: MealItemAnalysis[] = [
    { id: 'item1', name: 'Grilled Chicken', confidence: 0.92, quantity: '120g', calories: 198, macros: { protein:36, carbs:0, fat:5 }},
    { id: 'item2', name: 'Quinoa', confidence: 0.81, quantity: '100g', calories: 120, macros: { protein:4, carbs:21, fat:2 } }
  ];
  if (imageUris.length > 1) {
    base.push({ id: 'item3', name: 'Steamed Broccoli', confidence: 0.74, quantity: '60g', calories: 20, macros: { protein:2, carbs:4, fat:0 } });
  }
  return base;
}
