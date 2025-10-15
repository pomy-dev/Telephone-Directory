import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, Modal, SafeAreaView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Appbar, Button, Text } from 'react-native-paper';

export default function MapPickerModal({ visible, onPick, onClose, initialCoords }) {
  const initialRegion = useMemo(() => ({
    latitude: initialCoords?.latitude ?? -26.5225, // Eswatini approx center
    longitude: initialCoords?.longitude ?? 31.4659,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  }), [initialCoords]);

  const [selectedCoord, setSelectedCoord] = useState(initialCoords ?? null);

  const handleLongPress = useCallback((e) => {
    setSelectedCoord(e.nativeEvent.coordinate);
  }, []);

  const handleSave = useCallback(() => {
    if (onPick && selectedCoord) {
      onPick(selectedCoord);
    }
    if (onClose) onClose();
  }, [onPick, onClose, selectedCoord]);

  return (
    <Modal visible={!!visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title="Pick Location" />
          <Button mode="contained" onPress={handleSave} disabled={!selectedCoord}>
            Use
          </Button>
        </Appbar.Header>

        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          onLongPress={handleLongPress}
        >
          {selectedCoord && (
            <Marker coordinate={selectedCoord} />
          )}
        </MapView>

        <View style={styles.footer}>
          <Text>
            {selectedCoord
              ? `Lat: ${selectedCoord.latitude.toFixed(6)}, Lng: ${selectedCoord.longitude.toFixed(6)}`
              : 'Long-press to select a location'}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  footer: {
    padding: 12,
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
});