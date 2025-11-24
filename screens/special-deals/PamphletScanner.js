import React, { useRef, useState, useCallback, useEffect } from 'react';
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
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/core';
import ImageEditor from '@react-native-community/image-editor';
import * as FileSystem from 'expo-file-system';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

Reanimated.addWhitelistedNativeProps({ zoom: true });
const AnimatedCamera = Reanimated.createAnimatedComponent(Camera);

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const PRICE_REGEX = /(?:SZL|E|R|ZAR|USD)?\s?\d{1,3}(?:[,\.]\d{3})*(?:[\.,]\d{1,2})?/i;
const PADDING = 16;

export default function PamphletScanner() {
  const isFocused = useIsFocused();
  const device = useCameraDevice('back') || useCameraDevice('front');
  const camera = useRef(null);

  const [permissionGranted, setPermissionGranted] = useState(null);
  const [items, setItems] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [flash, setFlash] = useState('off');
  const [isInitialized, setIsInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Zoom & Focus
  const zoom = useSharedValue(1);
  const focusRingScale = useSharedValue(0);
  const focusX = useSharedValue(0.5);
  const focusY = useSharedValue(0.5);

  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 8, 8);
  const isZoomPickerOpen = useSharedValue(false);
  const currentZoomIndex = useSharedValue(0);
  const zoomLevels = [1, 1.5, 2, 3, 4, 6, 8];

  const animatedProps = useAnimatedProps(() => ({
    zoom: zoom.value,
  }));

  const zoomArcStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          zoom.value,
          [minZoom, maxZoom],
          [-90, 90],
          Extrapolate.CLAMP
        )}deg`,
      },
    ],
  }));

  const animatedZoomPanelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isZoomPickerOpen.value ? 1 : 0, { duration: 200 }),
    transform: [
      {
        translateX: withTiming(isZoomPickerOpen.value ? 0 : -120, { duration: 250 }),
      },
    ],
    pointerEvents: isZoomPickerOpen.value ? 'auto' : 'none',
  }));

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setPermissionGranted(status === 'authorized' || status === 'granted');
    })();
  }, []);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      zoom.value = Math.max(minZoom, Math.min(maxZoom, e.scale * zoom.value));
    })
    .onEnd(() => {
      const closest = zoomLevels.reduce((a, b) =>
        Math.abs(b - zoom.value) < Math.abs(a - zoom.value) ? b : a
      );
      zoom.value = withSpring(closest);
      currentZoomIndex.value = zoomLevels.indexOf(closest);
    });

  const handleTapToFocus = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    const x = locationX / WINDOW_WIDTH;
    const y = locationY / WINDOW_HEIGHT;

    focusX.value = x;
    focusY.value = y;
    focusRingScale.value = 0;

    camera.current?.setFocusPoint?.({ x, y });
    focusRingScale.value = withSpring(1);
  };

  const cycleZoom = () => {
    const nextIndex = (currentZoomIndex.value + 1) % zoomLevels.length;
    currentZoomIndex.value = nextIndex;
    zoom.value = withSpring(zoomLevels[nextIndex]);
  };

  const groupBlocks = useCallback((blocks) => {
    const prices = blocks.filter(b => PRICE_REGEX.test(b.text));
    const others = blocks.filter(b => !PRICE_REGEX.test(b.text));
    const result = [];

    prices.forEach(p => {
      const candidates = others
        .filter(o => o.boundingBox.y + o.boundingBox.height < p.boundingBox.y)
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
        name: nameBlock?.text?.trim() || null,
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
      runOnJS(setBoxesFromBlocks)(result?.blocks || []);
    } catch (e) { }
  }, []);

  const setBoxesFromBlocks = useCallback((blocks) => {
    if (!blocks.length) return setBoxes([]);
    const grouped = groupBlocks(blocks);
    const overlay = grouped.flatMap(item => [
      { ...item.priceBox, color: '#00ff0088', stroke: '#00ff00' },
      item.nameBox && { ...item.nameBox, color: '#0088ff88', stroke: '#0088ff' },
    ]).filter(Boolean);
    setBoxes(overlay);
  }, [groupBlocks]);

  const captureAndSave = async () => {
    if (!camera.current || processing) return;
    setProcessing(true);
    try {
      const photo = await camera.current.takePhoto({ quality: 0.9, flash });
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
          const base64 = await FileSystem.readAsStringAsync(cropped, { encoding: FileSystem.EncodingType.Base64 });
          newItems.push({
            name: item.name || '—',
            price: item.price,
            imageBase64: `data:image/jpeg;base64,${base64}`,
          });
        } catch (e) { }
      }

      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
        Alert.alert('Success!', `${newItems.length} item(s) added`);
      } else {
        Alert.alert('No prices found', 'Try better lighting or clearer text');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Capture failed');
    } finally {
      setProcessing(false);
    }
  };

  const onInitialized = useCallback(() => {
    setIsInitialized(true);
  }, []);

  if (!permissionGranted || !device) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>
          {!permissionGranted ? 'Requesting permission...' : 'No camera found'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinch}>
        <TouchableWithoutFeedback onPress={handleTapToFocus}>
          <Reanimated.View style={styles.cameraContainer}>
            <AnimatedCamera
              ref={camera}
              style={styles.absoluteFill}
              device={device}
              isActive={isFocused && isInitialized}
              photo={true}
              flash={flash}
              onInitialized={onInitialized}
              animatedProps={animatedProps}
              frameProcessor={frameProcessor}
              frameProcessorFps={2}
              resizeMode="cover"
            />

            {/* Focus Ring */}
            <Reanimated.View
              style={[
                styles.focusRing,
                {
                  left: focusX.value * WINDOW_WIDTH - 40,
                  top: focusY.value * WINDOW_HEIGHT - 40,
                  opacity: focusRingScale.value,
                  transform: [{ scale: focusRingScale.value }],
                },
              ]}
            />

            {/* OCR Boxes */}
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
                  borderRadius: 12,
                }}
                pointerEvents="none"
              />
            ))}

            {/* Top Bar */}
            <View style={styles.topBar}>
              <Text style={styles.title}>Price Scanner</Text>
              <Text style={styles.subtitle}>Green = price • Blue = name</Text>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomBar}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}>
                <MaterialIcon name={flash === 'on' ? 'flash' : 'flash-off'} size={28} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.captureBtn, processing && styles.captureBtnDisabled]} onPress={captureAndSave} disabled={processing}>
                {processing ? <ActivityIndicator color="#000" /> : <Text style={styles.captureText}>ADD ITEMS</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconBtn} onPress={() => setItems([])}>
                <MaterialIcon name="trash-can-outline" size={28} color="#fff" />
                {items.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{items.length}</Text></View>}
              </TouchableOpacity>
            </View>

            {/* === ZOOM & TORCH CONTROL — Bottom Left === */}
            <View style={styles.zoomControlContainer}>
              {/* Torch Toggle */}
              <TouchableOpacity
                style={[styles.controlBtn, styles.torchBtn, { borderColor: flash === 'torch' ? '#ffd60a' : 'transparent' }]}
                onPress={() => setFlash(prev => prev === 'torch' ? 'off' : 'torch')}
              >
                <MaterialIcon
                  name={flash === 'torch' ? 'flashlight' : 'flashlight-off'}
                  size={28}
                  color={flash === 'torch' ? '#ffd60a' : '#fff'}
                />
              </TouchableOpacity>

              {/* Zoom Picker Button */}
              <TouchableOpacity
                style={styles.zoomPickerBtn}
                onPress={() => {
                  isZoomPickerOpen.value = !isZoomPickerOpen.value;
                }}
              >
                <Text style={styles.zoomPickerText}>
                  {zoom.value.toFixed(1)}x
                </Text>
                <MaterialIcon name="chevron-right" size={24} color="#fff" style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              {/* Animated Zoom Picker Panel */}
              <Reanimated.View style={[styles.zoomPickerPanel, animatedZoomPanelStyle]}>
                {zoomLevels.map((level, index) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.zoomLevelBtn,
                      zoom.value >= level - 0.1 && zoom.value <= level + 0.1 && styles.zoomLevelActive,
                    ]}
                    onPress={() => {
                      zoom.value = withSpring(level);
                      currentZoomIndex.value = index;
                      isZoomPickerOpen.value = false;
                    }}
                  >
                    <Text style={[
                      styles.zoomLevelText,
                      zoom.value >= level - 0.1 && zoom.value <= level + 0.1 && styles.zoomLevelTextActive,
                    ]}>
                      {level}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </Reanimated.View>
            </View>
          </Reanimated.View>
        </TouchableWithoutFeedback>
      </GestureDetector>

      {/* Results */}
      <ScrollView style={styles.results}>
        {items.length === 0 ? (
          <Text style={styles.empty}>No items added yet</Text>
        ) : (
          items.map((item, i) => (
            <View key={i} style={styles.card}>
              <Image source={{ uri: item.imageBase64 }} style={styles.thumb} />
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
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: '#fff', marginTop: 16, fontSize: 16 },
  cameraContainer: { flex: 2 },
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  topBar: { position: 'absolute', top: 50, left: 0, right: 0, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#aaa', marginTop: 4 },
  bottomBar: { position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 50 },
  captureBtn: { backgroundColor: '#fff', paddingHorizontal: 36, paddingVertical: 18, borderRadius: 50, minWidth: 180, alignItems: 'center' },
  captureBtnDisabled: { opacity: 0.7 },
  captureText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  badge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#ff3b30', borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  zoomControlContainer: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    alignItems: 'flex-start',
  },
  torchBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 14,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2
  },
  zoomPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#444',
  },
  zoomPickerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  zoomPickerPanel: {
    position: 'absolute',
    left: -130,
    bottom: 0,
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  zoomLevelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  zoomLevelActive: {
    backgroundColor: '#00ff00',
  },
  zoomLevelText: {
    color: '#ddd',
    fontWeight: '600',
  },
  zoomLevelTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
  focusRing: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#00ff00', backgroundColor: 'transparent' },
  results: { flex: 1, backgroundColor: '#111', padding: 16 },
  empty: { textAlign: 'center', color: '#888', marginTop: 60, fontSize: 18 },
  card: { flexDirection: 'row', backgroundColor: '#222', borderRadius: 16, padding: 12, marginBottom: 12 },
  thumb: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#333' },
  info: { flex: 1, justifyContent: 'center', paddingLeft: 16 },
  name: { fontSize: 17, fontWeight: '600', color: '#fff' },
  price: { fontSize: 22, fontWeight: 'bold', color: '#0f0', marginTop: 6 },
});