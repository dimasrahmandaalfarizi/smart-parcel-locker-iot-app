import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

/**
 * SkeletonLoader — Komponen shimmer placeholder bergaya premium.
 * Gunakan sejumlah <SkeletonBox> di dalam layout untuk menggambarkan
 * struktur konten yang sedang dimuat dari API.
 *
 * Contoh Pemakaian:
 *   <SkeletonBox width="100%" height={60} borderRadius={12} />
 */
export const SkeletonBox = ({ width = '100%', height = 20, borderRadius = 8, style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: 'rgba(255,255,255,0.12)', opacity }, style]}
    />
  );
};

/** Skeleton untuk 1 kartu Paket di Dashboard User */
export const PackageCardSkeleton = () => (
  <View style={s.card}>
    <View style={s.row}>
      <SkeletonBox width={48} height={48} borderRadius={14} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <SkeletonBox width="60%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonBox width="40%" height={10} />
      </View>
      <SkeletonBox width={64} height={24} borderRadius={8} />
    </View>
    <SkeletonBox width="85%" height={10} style={{ marginTop: 14 }} borderRadius={6} />
  </View>
);

/** Skeleton untuk kartu Loker Admin */
export const LockerCardSkeleton = () => (
  <View style={[s.lockerCard]}>
    <SkeletonBox width={40} height={40} borderRadius={12} style={{ marginBottom: 10 }} />
    <SkeletonBox width={60} height={10} borderRadius={5} />
    <SkeletonBox width={40} height={8} borderRadius={5} style={{ marginTop: 6 }} />
  </View>
);

/** Skeleton untuk baris tabel Audit Log */
export const AuditRowSkeleton = () => (
  <View style={s.auditRow}>
    <SkeletonBox width={36} height={36} borderRadius={10} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <SkeletonBox width="70%" height={12} style={{ marginBottom: 6 }} />
      <SkeletonBox width="40%" height={8} />
    </View>
    <SkeletonBox width={50} height={20} borderRadius={8} />
  </View>
);

const s = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  row: { flexDirection: 'row', alignItems: 'center' },
  lockerCard: { width: '47%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  auditRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
});
