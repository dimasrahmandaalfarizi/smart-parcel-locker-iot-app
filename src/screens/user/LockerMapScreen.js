import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import api from '../../services/api';

const { width, height } = Dimensions.get('window');

// Peta custom style untuk tema gelap (Dark Mode) yang sangat premium
const mapDarkStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#263c3f" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#6b9a76" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2f3948" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
];

const DUMMY_LOCATIONS = [
  { id: 1, name: "Stasiun KRL Sudirman", address: "Jl. Jend. Sudirman", latitude: -6.2023, longitude: 106.8228, totalLockers: 20, availableLockers: 5 },
  { id: 2, name: "Mall Grand Indonesia", address: "Jl. M.H. Thamrin", latitude: -6.1952, longitude: 106.8206, totalLockers: 15, availableLockers: 0 },
  { id: 3, name: "Apartemen Menteng", address: "Menteng, Jakarta Pusat", latitude: -6.1913, longitude: 106.8335, totalLockers: 10, availableLockers: 4 },
];

export default function LockerMapScreen({ navigation }) {
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const mapRef = useRef(null);

  // Fallback untuk platform web karena react-native-maps error jika di-render mentah di web
  const isWeb = Platform.OS === 'web';

  const loadData = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data?.data || res.data || []);
    } catch {
      setLocations(DUMMY_LOCATIONS);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleMarkerPress = (loc) => {
    setSelectedLoc(loc);
  };

  if (isWeb) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.headerAbsolute}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color={colors.white} />
          </TouchableOpacity>
        </View>
        <Ionicons name="map-outline" size={80} color="rgba(255,255,255,0.1)" />
        <Text style={[globalStyles.body, { textAlign: 'center', marginTop: 16, fontWeight: '700' }]}>Peta Interaktif Tidak Tersedia di Web</Text>
        <Text style={[globalStyles.bodySmall, { textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }]}>Silakan gunakan aplikasi di HP fisik (Android/iOS) untuk melihat peta titik persebaran Smart Locker.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapDarkStyle}
        initialRegion={{
          latitude: -6.198,
          longitude: 106.825,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {locations.map((loc) => {
          const isFull = loc.availableLockers === 0;
          return (
            <Marker
              key={loc.id}
              coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
              onPress={() => handleMarkerPress(loc)}
            >
              <View style={[styles.markerBody, isFull && styles.markerFull]}>
                <Ionicons name="cube" size={16} color={colors.white} />
                <View style={styles.markerBadge}>
                  <Text style={styles.markerBadgeText}>{loc.availableLockers}</Text>
                </View>
              </View>
              
              <Callout tooltip>
                <View style={styles.calloutBox}>
                  <Text style={styles.calloutTitle}>{loc.name}</Text>
                  <Text style={styles.calloutSubtitle}>{loc.address}</Text>
                  <View style={styles.calloutRow}>
                    <Ionicons name={isFull ? 'close-circle' : 'checkmark-circle'} size={14} color={isFull ? '#EF4444' : '#10B981'} style={{marginRight: 4}}/>
                    <Text style={[styles.calloutStatus, { color: isFull ? '#EF4444' : '#10B981' }]}>
                      {isFull ? 'Loker Penuh' : `${loc.availableLockers} Loker Kosong`}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating Header */}
      <View style={[styles.headerAbsolute, globalStyles.shadow]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Lokasi Mesin</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Bottom Panel if Selected */}
      {selectedLoc && (
        <View style={[styles.bottomPanel, globalStyles.shadow]}>
          <View style={styles.panelHeader}>
             <View style={[styles.iconBox, { backgroundColor: selectedLoc.availableLockers > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)' }]}>
               <Ionicons name="location" size={24} color={selectedLoc.availableLockers > 0 ? '#10B981' : '#EF4444'} />
             </View>
             <View style={{marginLeft: 14, flex: 1}}>
               <Text style={styles.panelTitle}>{selectedLoc.name}</Text>
               <Text style={styles.panelAddr}>{selectedLoc.address}</Text>
             </View>
             <TouchableOpacity style={styles.closePanelBtn} onPress={() => setSelectedLoc(null)}>
               <Ionicons name="close" size={20} color={colors.textSecondary} />
             </TouchableOpacity>
          </View>
          <View style={styles.panelStatsRow}>
            <View style={styles.miniStatBox}>
              <Text style={styles.miniStatLabel}>Total Rak</Text>
              <Text style={styles.miniStatNum}>{selectedLoc.totalLockers}</Text>
            </View>
            <View style={styles.miniStatBox}>
              <Text style={styles.miniStatLabel}>Kosong (Available)</Text>
              <Text style={[styles.miniStatNum, { color: selectedLoc.availableLockers > 0 ? '#10B981' : '#EF4444' }]}>{selectedLoc.availableLockers}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { width: width, height: height },
  
  headerAbsolute: { position: 'absolute', top: 56, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(30,30,30,0.85)', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  title: { fontSize: 18, fontWeight: '800', color: colors.white },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },

  markerBody: { backgroundColor: colors.primary, padding: 8, borderRadius: 12, borderWidth: 2, borderColor: colors.white, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.4, shadowRadius: 5 },
  markerFull: { backgroundColor: '#EF4444' },
  markerBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#10B981', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#121212' },
  markerBadgeText: { color: colors.white, fontSize: 10, fontWeight: '900' },

  calloutBox: { width: 200, backgroundColor: '#1c1c1c', padding: 14, borderRadius: 16, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 },
  calloutTitle: { color: colors.white, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  calloutSubtitle: { color: colors.textSecondary, fontSize: 11, marginBottom: 8 },
  calloutRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 8 },
  calloutStatus: { fontSize: 11, fontWeight: '700' },

  bottomPanel: { position: 'absolute', bottom: 40, left: 24, right: 24, backgroundColor: 'rgba(30,30,30,0.95)', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  panelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  panelTitle: { color: colors.white, fontSize: 18, fontWeight: '800' },
  panelAddr: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  closePanelBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  
  panelStatsRow: { flexDirection: 'row', gap: 10 },
  miniStatBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  miniStatLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  miniStatNum: { color: colors.white, fontSize: 24, fontWeight: '900' },
});
