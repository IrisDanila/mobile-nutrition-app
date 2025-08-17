import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../theme/colors';

export const GlassCard: React.FC<ViewProps & { elevated?: boolean }> = ({ style, children, elevated, ...rest }) => {
  return (
    <View accessibilityRole='summary' style={[styles.base, elevated && styles.elevated, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.glassDark,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    borderRadius: 24
  },
  elevated: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 }
  }
});
