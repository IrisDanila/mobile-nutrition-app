import React from 'react';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { colors } from '../theme/colors';

export const Splash = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={{ width:96, height:96, marginBottom:24 }} />
      <ActivityIndicator size='large' color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: colors.bg, alignItems:'center', justifyContent:'center' }
});
