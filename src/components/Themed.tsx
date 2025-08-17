import React from 'react';
import { View, Text, ViewProps, TextProps } from 'react-native';
import { colors } from '../theme/colors';

export const ThemedView: React.FC<ViewProps & { variant?: 'card' | 'surface' }> = ({ style, children, variant, ...rest }) => {
  const backgroundColor = variant === 'card' ? colors.bgAlt : colors.bg;
  return <View style={[{ backgroundColor }, style]} {...rest}>{children}</View>;
};

export const ThemedText: React.FC<TextProps & { dim?: boolean; weight?: '400'|'500'|'600'|'700' }> = ({ style, children, dim, weight='500', ...rest }) => {
  return <Text style={[{ color: dim ? colors.textDim : colors.text, fontWeight: weight }, style]} {...rest}>{children}</Text>;
};
