import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';

export default function StatusBadge({ status }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'stored':
      case 'occupied':
        return { text: status === 'stored' ? 'Tersimpan' : 'Terisi', color: colors.warning, bg: 'rgba(245, 158, 11, 0.15)' };
      case 'picked_up':
      case 'available':
        return { text: status === 'picked_up' ? 'Diambil' : 'Tersedia', color: colors.success, bg: 'rgba(16, 185, 129, 0.15)' };
      case 'expired':
      case 'maintenance':
        return { text: status === 'expired' ? 'Kedaluwarsa' : 'Perbaikan', color: colors.error, bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { text: 'Unknown', color: colors.textSecondary, bg: colors.border };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  }
});
