import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/colors';
import { globalStyles } from '../../styles/globalStyles';
import StatusBadge from '../locker/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

export default function PackageCard({ trackingNumber, status, lockerNumber, onPress }) {
  return (
    <TouchableOpacity 
      activeOpacity={onPress ? 0.7 : 1} 
      onPress={onPress}
      style={[styles.card, globalStyles.shadow]}
      disabled={!onPress}
    >
      <View style={globalStyles.spaceBetween}>
        <View style={globalStyles.row}>
          <View style={styles.iconContainer}>
            <Ionicons name="cube-outline" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>{trackingNumber}</Text>
            <Text style={styles.subtitle}>{lockerNumber}</Text>
          </View>
        </View>
        <StatusBadge status={status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  }
});
