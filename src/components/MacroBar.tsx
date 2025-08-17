import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  protein: number;
  carbs: number;
  fat: number;
  style?: ViewStyle;
  height?: number;
}

// Stacked macro bar showing distribution
export const MacroBar: React.FC<Props> = ({ protein, carbs, fat, style, height = 10 }) => {
  const total = Math.max(protein + carbs + fat, 1);
  const pPct = (protein / total) * 100;
  const cPct = (carbs / total) * 100;
  const fPct = (fat / total) * 100;
  return (
    <View style={[{ flexDirection: 'row', width: '100%', borderRadius: height, overflow: 'hidden', backgroundColor: '#1f2430' }, style]}>
      <View style={{ width: `${pPct}%`, backgroundColor: colors.success, height }} />
      <View style={{ width: `${cPct}%`, backgroundColor: colors.primary, height }} />
      <View style={{ width: `${fPct}%`, backgroundColor: colors.accent, height }} />
    </View>
  );
};
