import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { scanOCR } from 'vision-camera-ocr';
import ImageEditor from '@react-native-community/image-editor';
import * as FileSystem from 'expo-file-system';

// -----------------------------------------------------------------------------
// Helper utils
// -----------------------------------------------------------------------------
const PRICE_REGEX = /(?:SZL|E|R|ZAR|USD)?\s?\d{1,3}(?:[,\.]\d{3})*(?:[\.,]\d{1,2})?/i;
const PADDING = 12; // pixels of padding when cropping

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Given OCR blocks with { text, bounding: { x,y,width,height } }
// Find price blocks and associate nearest non-price block above as product name
function groupBlocksIntoItems(blocks) {
  const priceBlocks = blocks.filter(b => PRICE_REGEX.test(b.text));
  const otherBlocks = blocks.filter(b => !PRICE_REGEX.test(b.text));

  const items = [];

  for (const p of priceBlocks) {
    // find candidate name blocks that are above the price vertically and reasonably close
    const candidates = otherBlocks.filter(o => o.bounding.y + o.bounding.height <= p.bounding.y + 20);
    // sort by vertical distance (closest above)
    candidates.sort((a, b) => (p.bounding.y - (a.bounding.y + a.bounding.height)) - (p.bounding.y - (b.bounding.y + b.bounding.height)));

    const nameBlock = candidates[0] || null;

    // create a crop box around name + price
    let x = p.bounding.x;
    let y = p.bounding.y;
    let width = p.bounding.width;
    let height = p.bounding.height;

    if (nameBlock) {
      x = Math.min(x, nameBlock.bounding.x);
      y = Math.min(y, nameBlock.bounding.y);
      width = Math.max(x + width, nameBlock.bounding.x + nameBlock.bounding.width) - x;
      height = Math.max(y + height, nameBlock.bounding.y + nameBlock.bounding.height) - y;
    }

    // add padding
    x = Math.max(0, Math.floor(x - PADDING));
    y = Math.max(0, Math.floor(y - PADDING));
    width = Math.floor(width + PADDING * 2);
    height = Math.floor(height + PADDING * 2);

    items.push({
      name: nameBlock ? nameBlock.text : null,
      price: p.text,
      box: { x, y, width, height }
    });
  }

  return items;
}

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------
export default function ExpoPamphletScanner() {
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  const takeAndProcessPhoto = async () => {
    if (!camera.current) return;
    try {
      setScanning(true);
      // take a photo with base64 (we use the uri/path for cropping but also keep base64)
      const photo = await camera.current.takePhoto({ flash: 'off', quality: 0.9, skipMetadata: true, base64: true });

      // NOTE: scanOCR expects a path/uri. Depending on platform, property may be `path` or `uri`.
      const path = photo.path || photo.uri || photo.filename;
      if (!path) throw new Error('Could not get photo path from camera result.');

      // Run OCR
      const ocr = await scanOCR(path);
      // ocr.textBlocks or ocr.textBlocks might be where blocks live depending on plugin shape
      const blocks = (ocr?.textBlocks || ocr?.blocks || []).map(b => ({
        text: b.text || b.value || '',
        bounding: b.bounding || b.boundingBox || b.rect || { x: 0, y: 0, width: 0, height: 0 }
      }));

      if (!blocks.length) {
        Alert.alert('No text detected', 'Try a clearer photo or better lighting.');
        setScanning(false);
        return;
      }

      // Group blocks into item candidates (basic heuristic)
      const items = groupBlocksIntoItems(blocks);

      // Crop each item from the original photo and convert to base64
      const processed = [];
      for (const it of items) {
        try {
          // cropImage expects the image uri and crop data in pixels
          const cropConf = {
            offset: { x: it.box.x, y: it.box.y },
            size: { width: it.box.width, height: it.box.height },
            displaySize: { width: it.box.width, height: it.box.height },
            resizeMode: 'cover'
          };

          const croppedUri = await ImageEditor.cropImage(path, cropConf);

          // read as base64
          const base64 = await FileSystem.readAsStringAsync(croppedUri, { encoding: FileSystem.EncodingType.Base64 });
          const dataUri = `data:image/jpeg;base64,${base64}`;

          processed.push({ name: it.name, price: it.price, imageBase64: dataUri });
        } catch (err) {
          console.warn('Crop/convert failed for item', it, err);
        }
      }

      setResults(processed);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', String(err.message || err));
    } finally {
      setScanning(false);
    }
  };

  if (!device) return (
    <View style={styles.center}><Text>Loading camera devices...</Text></View>
  );

  if (!hasPermission) return (
    <View style={styles.center}><Text>No camera permission. Grant it and reload the app.</Text></View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!scanning}
          photo={true}
        />
        <View style={styles.controls}>
          <TouchableOpacity style={styles.captureBtn} onPress={takeAndProcessPhoto} disabled={scanning}>
            {scanning ? <ActivityIndicator color="#fff" /> : <Text style={styles.captureText}>Scan</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.results} contentContainerStyle={{ padding: 12 }}>
        {results.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#666' }}>No items yet — capture pamphlet to extract items and prices.</Text>
        ) : (
          results.map((r, i) => (
            <View key={i} style={styles.itemCard}>
              {r.imageBase64 ? (
                <Image source={{ uri: r.imageBase64 }} style={styles.thumb} />
              ) : null}
              <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={styles.itemName}>{r.name || 'Unknown'}</Text>
                <Text style={styles.itemPrice}>{r.price || 'No price'}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  cameraContainer: { height: 360, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  controls: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  captureBtn: { backgroundColor: '#1f6feb', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999 },
  captureText: { color: '#fff', fontWeight: '700' },
  results: { flex: 1 },
  itemCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#f6f7fb', padding: 8, borderRadius: 10 },
  thumb: { width: 96, height: 96, borderRadius: 8, backgroundColor: '#ddd' },
  itemName: { fontWeight: '700' },
  itemPrice: { marginTop: 6, color: '#0b6623' }
});
