import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';
import StatusBadge from './StatusBadge';
import { Ionicons } from '@expo/vector-icons';

export default function LockerCard({ lockerNumber, status }) {
  return (
    <View style={styles.card}>
      <Ionicons 
        name={status === 'available' ? "lock-open-outline" : "lock-closed-outline"} 
        size={28} 
        color={status === 'available' ? colors.success : colors.warning} 
        style={{ marginBottom: 12 }}
      />
      <Text style={styles.title}>Locker #{lockerNumber}</Text>
      <StatusBadge status={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%', // For a 2-column grid
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  }
});
