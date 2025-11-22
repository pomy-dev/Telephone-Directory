import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { scanOCR } from 'vision-camera-ocr-plugin';
import { runOnJS } from 'react-native-reanimated';
import ImageEditor from '@react-native-community/image-editor';
import * as FileSystem from 'expo-file-system';

const { width: WINDOW_WIDTH } = Dimensions.get('window');
const CAMERA_HEIGHT = 480;

const PRICE_REGEX = /(?:SZL|E|R|ZAR|USD)?\s?\d{1,3}(?:[,\.]\d{3})*(?:[\.,]\d{1,2})?/i;
const PADDING = 16;

// type Item = {
//   name: string | null;
//   price: string;
//   imageBase64: string;
// };

export default function PamphletScanner() {
  const devices = useCameraDevices();
  const device = devices.back ?? devices.front;
  const camera = useRef(null);

  const [permission, setPermission] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [items, setItems] = useState([]);
  const [boxes, setBoxes] = useState([]); // For live overlay

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setPermission(status === 'authorized');
    })();
  }, []);

  const groupBlocks = useCallback((blocks) => {
    const prices = blocks.filter((b) => PRICE_REGEX.test(b.text));
    const others = blocks.filter((b) => !PRICE_REGEX.test(b.text));
    const result = [];

    prices.forEach((p) => {
      const candidates = others
        .filter((o) => o.boundingBox.y + o.boundingBox.height < p.boundingBox.y)
        .sort((a, b) =>
          p.boundingBox.y - (a.boundingBox.y + a.boundingBox.height) -
          (p.boundingBox.y - (b.boundingBox.y + b.boundingBox.height))
        );

      const nameBlock = candidates[0] || null;
      let x = p.boundingBox.x, y = p.boundingBox.y;
      let w = p.boundingBox.width, h = p.boundingBox.height;

      if (nameBlock) {
        x = Math.min(x, nameBlock.boundingBox.x);
        y = Math.min(y, nameBlock.boundingBox.y);
        w = Math.max(x + w, nameBlock.boundingBox.x + nameBlock.boundingBox.width) - x;
        h = Math.max(y + h, nameBlock.boundingBox.y + nameBlock.boundingBox.height) - y;
      }

      x = Math.max(0, x - PADDING);
      y = Math.max(0, y - PADDING);
      w += PADDING * 2;
      h += PADDING * 2;

      result.push({
        name: nameBlock?.text?.trim(),
        price: p.text.trim(),
        cropBox: { x, y, width: w, height: h },
        priceBox: p.boundingBox,
        nameBox: nameBlock?.boundingBox,
      });
    });

    return result;
  }, []);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (!global.scanOCR) return;
    try {
      const result = global.scanOCR(frame);
      runOnJS(updateOverlay)(result?.blocks || []);
    } catch (e) { }
  }, []);

  const updateOverlay = useCallback((blocks) => {
    if (blocks.length === 0) {
      setBoxes([]);
      return;
    }

    const grouped = groupBlocks(blocks);
    const overlay = [];

    grouped.forEach((item) => {
      overlay.push({ ...item.priceBox, color: '#00ff0088', stroke: '#00ff00' });
      if (item.nameBox) {
        overlay.push({ ...item.nameBox, color: '#0088ff88', stroke: '#0088ff' });
      }
    });

    setBoxes(overlay);
  }, [groupBlocks]);

  const captureAndSave = async () => {
    if (!camera.current || processing) return;
    setProcessing(true);

    try {
      const photo = await camera.current.takePhoto({ quality: 0.9, flash: 'off' });
      const path = photo.path;

      const ocr = await scanOCR(path, { detailedDetection: true });
      const grouped = groupBlocks(ocr?.blocks || []);

      const newItems = [];
      for (const item of grouped) {
        try {
          const cropped = await ImageEditor.cropImage(path, {
            offset: { x: item.cropBox.x, y: item.cropBox.y },
            size: { width: item.cropBox.width, height: item.cropBox.height },
            displaySize: { width: 300, height: 300 },
            resizeMode: 'contain',
          });

          const base64 = await FileSystem.readAsStringAsync(cropped, {
            encoding: FileSystem.EncodingType.Base64,
          });

          newItems.push({
            name: item.name || '—',
            price: item.price,
            imageBase64: `data:image/jpeg;base64,${base64}`,
          });
        } catch (e) {
          console.warn('Failed to crop one item');
        }
      }

      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
        Alert.alert('Success', `${newItems.length} item(s) added!`);
      } else {
        Alert.alert('Nothing found', 'Try aiming at clear prices.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Capture failed');
    } finally {
      setProcessing(false);
    }
  };

  const clearAll = () => setItems([]);

  if (!permission) return (
    <View style={styles.center}>
      <Text style={styles.error}>Camera permission required</Text>
    </View>
  );

  if (!devices.back && !devices.front) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066ff" />
        <Text style={{ marginTop: 16, color: '#000000', fontSize: 16 }}>
          Detecting camera...
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066ff" />
        <Text style={{ marginTop: 16, color: '#fff', fontSize: 16 }}>
          No camera available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
          frameProcessor={frameProcessor}
          frameProcessorFps={2}
        />

        {/* Live overlay using absolute Views (no Skia!) */}
        {boxes.map((box, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.height,
              borderWidth: 3,
              borderColor: box.stroke,
              backgroundColor: box.color,
              borderRadius: 8,
            }}
            pointerEvents="none"
          />
        ))}

        <View style={styles.topBar}>
          <Text style={styles.title}>Scan Prices</Text>
          <Text style={styles.hint}>Green = price • Blue = name</Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
            <Text style={styles.clearText}>Clear ({items.length})</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureBtn, processing && styles.disabled]}
            onPress={captureAndSave}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.captureText}>Add Items</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.results}>
        {items.length === 0 ? (
          <Text style={styles.empty}>Point camera at prices and tap "Add Items"</Text>
        ) : (
          items.map((item, i) => (
            <View key={i} style={styles.card}>
              {item.imageBase64 && (
                <Image source={{ uri: item.imageBase64 }} style={styles.thumb} />
              )}
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  error: { fontSize: 18, color: '#d32f2f', textAlign: 'center' },

  cameraContainer: { height: CAMERA_HEIGHT, backgroundColor: '#000' },
  topBar: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  hint: { fontSize: 13, color: '#ddd', marginTop: 4 },

  bottomBar: { position: 'absolute', bottom: 30, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  clearBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  clearText: { color: '#fff', fontWeight: '600' },
  captureBtn: { backgroundColor: '#0066ff', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30 },
  disabled: { opacity: 0.6 },
  captureText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  results: { flex: 1, padding: 16 },
  empty: { textAlign: 'center', color: '#888', fontSize: 16, marginTop: 40 },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  thumb: { width: 90, height: 90, borderRadius: 10, backgroundColor: '#eee' },
  info: { flex: 1, justifyContent: 'center', paddingLeft: 14 },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#0b8a0b', marginTop: 6 },
});