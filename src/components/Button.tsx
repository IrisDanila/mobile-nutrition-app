import React from 'react';
import { Pressable, ActivityIndicator, PressableProps } from 'react-native';
import { ThemedText } from './Themed';
import { colors } from '../theme/colors';

interface Props extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
}

export const Button: React.FC<Props> = ({ title, loading, variant='primary', style, ...rest }: Props) => {
  const base = {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  } as const;
  const bg = variant === 'primary' ? colors.primary : variant === 'outline' ? 'transparent' : 'transparent';
  const borderWidth = variant === 'outline' ? 1 : 0;
  const borderColor = colors.primary;
  const textColor = variant === 'primary' ? '#fff' : colors.primary;
  return (
  <Pressable disabled={loading} style={[base, { backgroundColor: bg, borderWidth, borderColor, opacity: loading?0.7:1 }, style as any]} {...rest}>
      {loading && <ActivityIndicator color={textColor} style={{ marginRight: 8 }} />}
      <ThemedText weight='600' style={{ color: textColor }}>{title}</ThemedText>
    </Pressable>
  );
};
