import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';

export default function Card({ children, style }) {
  return (
    <View style={[styles.card, globalStyles.shadow, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginVertical: 8,
  },
});
