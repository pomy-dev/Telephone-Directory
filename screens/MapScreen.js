import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useState } from 'react';
import { Icons } from '../constants/Icons';

const nearbyDrivers = [
  { id: '1', name: 'Driver 1', latitude: 40.7489, longitude: -73.9680, distance: '0.5 km' },
  { id: '2', name: 'Driver 2', latitude: 40.7519, longitude: -73.9710, distance: '1.2 km' },
  { id: '3', name: 'Driver 3', latitude: 40.7459, longitude: -73.9650, distance: '0.8 km' },
];

const nearbyShops = [
  { id: '1', name: 'Fresh Grocery', type: 'Grocery', latitude: 40.7509, longitude: -73.9690, distance: '0.3 km' },
  { id: '2', name: 'Quick Mart', type: 'Convenience', latitude: 40.7479, longitude: -73.9720, distance: '0.7 km' },
  { id: '3', name: 'Electronics Hub', type: 'Electronics', latitude: 40.7529, longitude: -73.9660, distance: '1.1 km' },
];

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDrivers, setShowDrivers] = useState(true);
  const [showShops, setShowShops] = useState(true);
  const [region] = useState({
    latitude: 40.7489,
    longitude: -73.9680,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  return (
    <View style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icons.Feather name='search' size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops, drivers, or locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>
        <TouchableOpacity style={styles.locationButton}>
          <Icons.Feather name='navigation' size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {showDrivers && nearbyDrivers.map((driver) => (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: driver.latitude,
                longitude: driver.longitude,
              }}
              title={driver.name}
              description={`Distance: ${driver.distance}`}
            >
              <View style={styles.driverMarker}>
                <Icons.AntDesign name='car' size={20} color="#fff" />
              </View>
            </Marker>
          ))}

          {showShops && nearbyShops.map((shop) => (
            <Marker
              key={shop.id}
              coordinate={{
                latitude: shop.latitude,
                longitude: shop.longitude,
              }}
              title={shop.name}
              description={`${shop.type} • ${shop.distance}`}
            >
              <View style={styles.shopMarker}>
                <Icons.MaterialIcons name='store' size={20} color="#fff" />
              </View>
            </Marker>
          ))}
        </MapView>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, showDrivers && styles.filterButtonActive]}
            onPress={() => setShowDrivers(!showDrivers)}
          >
            <Icons.AntDesign name='car' size={18} color={showDrivers ? '#fff' : '#64748b'} />
            <Text style={[styles.filterText, showDrivers && styles.filterTextActive]}>
              Drivers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterButton, showShops && styles.filterButtonActive]}
            onPress={() => setShowShops(!showShops)}
          >
            <Icons.MaterialIcons name='store' size={18} color={showShops ? '#fff' : '#64748b'} />
            <Text style={[styles.filterText, showShops && styles.filterTextActive]}>Shops</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Nearby Locations</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.locationsList}>
          {showDrivers && (
            <>
              <Text style={styles.categoryTitle}>Available Drivers</Text>
              {nearbyDrivers.map((driver) => (
                <TouchableOpacity key={driver.id} style={styles.locationCard}>
                  <View style={styles.locationIcon}>
                    <Icons.AntDesign name='car' size={20} color="#1a1a1a" />
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{driver.name}</Text>
                    <Text style={styles.locationDistance}>{driver.distance} away</Text>
                  </View>
                  <TouchableOpacity style={styles.callButton}>
                    <Text style={styles.callButtonText}>Request</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </>
          )}

          <Text style={styles.categoryTitle}>Nearby Shops</Text>
          {nearbyShops.map((shop) => (
            <TouchableOpacity key={shop.id} style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Icons.MaterialIcons name='store' size={20} color="#1a1a1a" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{shop.name}</Text>
                <Text style={styles.locationDistance}>
                  {shop.type} • {shop.distance} away
                </Text>
              </View>
              <TouchableOpacity style={styles.directionsButton}>
                <Icons.FontAwesome name='map-marker' size={16} color="#2563eb" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 12,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 50,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  locationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  filterContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: '#1a1a1a',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTextActive: {
    color: '#fff',
  },
  driverMarker: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  shopMarker: {
    width: 40,
    height: 40,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    maxHeight: '40%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  locationsList: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 12,
    marginTop: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  locationDistance: {
    fontSize: 13,
    color: '#64748b',
  },
  callButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  directionsButton: {
    width: 36,
    height: 36,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
