// Placeholder AI service. In production integrate a backend or on-device model.
// For now we simulate detection with random-ish outputs.
import { v4 as uuid } from 'uuid';

export type FoodAnalysis = {
  id: string;
  name: string;
  calories: number;
  quantity: string;
  macros: { protein: number; carbs: number; fat: number };
  confidence: number;
};

const sampleFoods = [
  { name: 'Apple', baseCalories: 95 },
  { name: 'Banana', baseCalories: 105 },
  { name: 'Grilled Chicken Breast', baseCalories: 165 },
  { name: 'Avocado Toast', baseCalories: 250 },
  { name: 'Greek Yogurt', baseCalories: 130 },
  { name: 'Oatmeal Bowl', baseCalories: 180 },
  { name: 'Caesar Salad', baseCalories: 220 },
  { name: 'Sushi Roll', baseCalories: 300 }
];

export async function analyzeFood(imageUri: string): Promise<FoodAnalysis> {
  // simulate latency
  await new Promise(r => setTimeout(r, 1200));
  const pick = sampleFoods[Math.floor(Math.random() * sampleFoods.length)];
  const multiplier = 0.5 + Math.random() * 1.5; // 0.5x - 2x
  const calories = Math.round(pick.baseCalories * multiplier);
  const protein = Math.round(calories * 0.25 / 4);
  const carbs = Math.round(calories * 0.5 / 4);
  const fat = Math.round(calories * 0.25 / 9);
  return {
    id: uuid(),
    name: pick.name,
    calories,
    quantity: `${(multiplier * 100).toFixed(0)}g`,
    macros: { protein, carbs, fat },
    confidence: 0.6 + Math.random() * 0.4
  };
}
