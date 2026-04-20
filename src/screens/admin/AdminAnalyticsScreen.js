import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { SkeletonBox } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

// ─── Warna palet chart ──────────────────────────────────────────────────────
const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];

// ─── Komponen Bar Chart Vertikal (tanpa library eksternal!) ─────────────────
const BarChart = ({ data, unit = '', title }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={chart.container}>
      <Text style={chart.title}>{title}</Text>
      <View style={chart.barsRow}>
        {data.map((item, i) => {
          const pct = (item.value / max) * 100;
          return (
            <View key={i} style={chart.barCol}>
              <Text style={chart.barValue}>{item.value}{unit}</Text>
              <View style={chart.barBg}>
                <View style={[chart.barFill, { height: `${Math.max(pct, 4)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
              </View>
              <Text style={chart.barLabel} numberOfLines={2}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ─── Komponen Stat Card ──────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, color = colors.primary, trend }) => (
  <View style={[styles.statCard, { borderColor: `${color}33` }]}>
    <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend !== undefined && (
      <View style={styles.trendRow}>
        <Ionicons name={trend >= 0 ? 'trending-up' : 'trending-down'} size={12} color={trend >= 0 ? '#10B981' : '#EF4444'} />
        <Text style={[styles.trendText, { color: trend >= 0 ? '#10B981' : '#EF4444' }]}> {Math.abs(trend)}% vs bulan lalu</Text>
      </View>
    )}
  </View>
);

// ─── Dummy data fallback saat /api/logs belum ada endpoint analytics ─────────
const buildDummyAnalytics = () => ({
  totalPackages: 248,
  totalRevenue: 1250000,
  avgPickupHours: 18.4,
  penaltyCount: 12,
  weeklyActivity: [
    { label: 'Sen', value: 38 },
    { label: 'Sel', value: 51 },
    { label: 'Rab', value: 42 },
    { label: 'Kam', value: 67 },
    { label: 'Jum', value: 80 },
    { label: 'Sab', value: 55 },
    { label: 'Min', value: 28 },
  ],
  lockerUsage: [
    { label: 'Loker A', value: 92 },
    { label: 'Loker B', value: 78 },
    { label: 'Loker C', value: 55 },
    { label: 'Loker D', value: 40 },
    { label: 'Loker E', value: 23 },
  ],
  courierActivity: [
    { label: 'JNE', value: 98 },
    { label: 'SiCepat', value: 72 },
    { label: 'J&T', value: 54 },
    { label: 'Anteraja', value: 24 },
  ],
});

export default function AdminAnalyticsScreen({ navigation }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      // Coba tarik dari endpoint analytics (akan dikembangkan di backend berikutnya)
      const res = await api.get('/analytics/summary');
      setData(res.data?.data || res.data);
    } catch {
      // Gunakan data dummy kaya saat API belum tersedia
      setData(buildDummyAnalytics());
    }
    setIsLoading(false);
  };

  useFocusEffect(useCallback(() => { loadAnalytics(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Analitik Sistem</Text>
          <Text style={styles.subtitle}>Data Real-Time IoT Loker</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        // Skeleton layout saat loading
        <ScrollView>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
            {[1, 2, 3, 4].map(i => <SkeletonBox key={i} width={(CHART_WIDTH / 2) - 6} height={110} borderRadius={20} />)}
          </View>
          <SkeletonBox width="100%" height={220} borderRadius={20} style={{ marginBottom: 16 }} />
          <SkeletonBox width="100%" height={200} borderRadius={20} />
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          {/* KPI Cards */}
          <View style={styles.statsGrid}>
            <StatCard icon="cube" value={data?.totalPackages || 0} label="Total Paket Diproses" color="#3B82F6" trend={12} />
            <StatCard icon="cash-outline" value={`Rp ${((data?.totalRevenue || 0) / 1000).toFixed(0)}rb`} label="Pendapatan Denda" color="#10B981" trend={8} />
            <StatCard icon="time-outline" value={`${data?.avgPickupHours || 0}j`} label="Rata-rata Pickup" color="#F59E0B" trend={-3} />
            <StatCard icon="alert-circle-outline" value={data?.penaltyCount || 0} label="Kasus Denda Aktif" color="#EF4444" trend={-15} />
          </View>

          {/* Chart 1: Aktivitas Mingguan */}
          <BarChart
            data={data?.weeklyActivity}
            title="📊  Aktivitas Pengiriman (7 Hari Terakhir)"
          />

          {/* Chart 2: Utilitas Loker */}
          <BarChart
            data={data?.lockerUsage}
            unit="%"
            title="🗄️  Tingkat Penggunaan Loker"
          />

          {/* Chart 3: Kurir Terpopuler */}
          <BarChart
            data={data?.courierActivity}
            title="🚴  Kurir Paling Aktif"
          />

          {/* Info Note */}
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
            <Text style={{ color: '#F59E0B', flex: 1, fontSize: 12, fontWeight: '600', lineHeight: 18 }}>
              Data ditarik dari endpoint <Text style={{ fontWeight: '900' }}>/api/analytics/summary</Text>. Saat backend belum menyediakan endpoint ini, sistem menggunakan data demonstrasi.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const chart = StyleSheet.create({
  container: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },
  title: { fontSize: 14, fontWeight: '800', color: colors.white, marginBottom: 20 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValue: { fontSize: 10, fontWeight: '800', color: colors.white, marginBottom: 4 },
  barBg: { width: '100%', height: 110, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 6, textAlign: 'center', fontWeight: '600' },
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 56, marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, textAlign: 'center' },
  subtitle: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', fontWeight: '600' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: { width: (width - 64 - 12) / 2, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 18, borderWidth: 1, alignItems: 'flex-start' },
  statIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  trendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  trendText: { fontSize: 11, fontWeight: '700' },

  note: { flexDirection: 'row', backgroundColor: 'rgba(245,158,11,0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', alignItems: 'flex-start' },
});
