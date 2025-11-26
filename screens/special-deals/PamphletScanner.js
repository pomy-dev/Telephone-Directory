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
  useLocationPermission,
  useMicrophonePermission
} from 'react-native-vision-camera';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  runOnJS,
  useDerivedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
// import { scanOCR } from 'vision-camera-ocr-plugin';
import * as MediaLibrary from 'expo-media-library';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { useIsFocused } from '@react-navigation/core';
import ImageEditor from '@react-native-community/image-editor';
import * as FileSystem from 'expo-file-system';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';

Reanimated.addWhitelistedNativeProps({ zoom: true });
const AnimatedCamera = Reanimated.createAnimatedComponent(Camera);
const ReanimatedText = Reanimated.createAnimatedComponent(Text);

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const PRICE_REGEX = /(?:SZL|E|R|ZAR|USD)?\s?\d{1,3}(?:[,\.]\d{3})*(?:[\.,]\d{1,2})?/i;
const PADDING = 16;
const zoomLevels = [1, 2, 3, 4, 5, 6];

const ZoomLevelButton = ({ level, zoom, onSelect }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      Math.abs(zoom.value - level) < 0.2
        ? '#00ff00'
        : 'rgba(255,255,255,0.1)',
  }), [level]);

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: Math.abs(zoom.value - level) < 0.2 ? '#000' : '#ddd',
    fontWeight: Math.abs(zoom.value - level) < 0.2 ? 'bold' : '600',
  }), [level]);

  return (
    <TouchableOpacity
      style={[styles.zoomLevelBtn, animatedStyle]}
      onPress={() => onSelect(level)}
    >
      <Reanimated.Text style={[styles.zoomLevelText, animatedTextStyle]}>
        {level}x
      </Reanimated.Text>
    </TouchableOpacity>
  );
};

export default function PamphletScanner({ navigation }) {
  const { theme } = React.useContext(AppContext)
  const isFocused = useIsFocused();
  const device = useCameraDevice('back') || useCameraDevice('front');
  const camera = useRef(null);

  const [permissionGranted, setPermissionGranted] = useState(null);
  const [items, setItems] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [flash, setFlash] = useState('off');
  const [torch, setTorch] = useState('off');
  const [isInitialized, setIsInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false)

  const microphone = useMicrophonePermission()
  const location = useLocationPermission()

  // Zoom & Focus
  const zoom = useSharedValue(1);
  const focusRingScale = useSharedValue(0);
  const focusX = useSharedValue(0.5);
  const focusY = useSharedValue(0.5);
  const isZoomPickerOpen = useSharedValue(false);

  const snapshotInterval = useRef(null);

  useEffect(() => {
    if (!isFocused || !isInitialized || !camera.current) {
      setBoxes([]);
      if (snapshotInterval.current) clearInterval(snapshotInterval.current);
      return;
    }

    // Start taking low-res snapshots every 400ms (≈2.5 FPS) — smooth enough for boxes
    snapshotInterval.current = setInterval(async () => {
      if (!camera.current || isCapturing) return; // Don't run during capture

      try {
        // takeSnapshot = fast, low-res, never blocks takePhoto()
        const snapshot = await camera.current.takeSnapshot({
          quality: 0.5
        });

        const result = await TextRecognition.recognize(snapshot.path);
        const blocks = result.blocks.map(b => ({
          text: b.text,
          boundingBox: {
            x: b.frame.x,
            y: b.frame.y,
            width: b.frame.width,
            height: b.frame.height,
          },
        }));

        const grouped = groupBlocks(blocks);
        const overlay = grouped.flatMap(item => [
          { ...item.priceBox, color: '#00ff0088', stroke: '#00ff00' },
          item.nameBox && { ...item.nameBox, color: '#0088ff88', stroke: '#0088ff' },
        ]).filter(Boolean);

        setBoxes(overlay);

        // Clean up snapshot file
        await FileSystem.deleteAsync(snapshot.path, { idempotent: true });
      } catch (e) {
        // Silently ignore — OCR fails sometimes on blurry frames
      }
    }, 400);

    return () => {
      if (snapshotInterval.current) clearInterval(snapshotInterval.current);
    };
  }, [isFocused, isInitialized, isCapturing]);

  useEffect(() => {
    (async () => {
      // camera permission
      const cameraStatus = await Camera.requestCameraPermission();
      setPermissionGranted(cameraStatus === 'granted');

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to save photos to your gallery.');
      }
    })();
  }, []);

  const focusRingAnimatedStyle = useAnimatedStyle(() => ({
    left: focusX.value * WINDOW_WIDTH - 40,
    top: focusY.value * WINDOW_HEIGHT - 40,
    opacity: focusRingScale.value,
    transform: [{ scale: focusRingScale.value }],
  }));

  const currentZoomDisplay = useDerivedValue(() => {
    return Number(zoom.value.toFixed(1));
  }, [zoom]);

  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 8, 8);

  const animatedZoomPanelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isZoomPickerOpen.value ? 1 : 0, { duration: 200 }),
    transform: [
      {
        translateX: withTiming(isZoomPickerOpen.value ? 0 : -120, { duration: 250 }),
      },
    ],
    pointerEvents: isZoomPickerOpen.value ? 'auto' : 'none',
  }));

  const closeZoomPicker = useCallback(() => {
    if (isZoomPickerOpen.value) {
      isZoomPickerOpen.value = false;
    }
  }, []);

  // Pinch to zoom
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      zoom.value = Math.max(minZoom, Math.min(maxZoom, e.scale * zoom.value));
    })
    .onEnd(() => {
      const closest = zoomLevels.reduce((a, b) =>
        Math.abs(b - zoom.value) < Math.abs(a - zoom.value) ? b : a
      );
      zoom.value = withSpring(closest);
    });

  const handleTapToFocus = (e) => {
    const { locationX, locationY } = e.nativeEvent;
    const x = locationX / WINDOW_WIDTH;
    const y = locationY / WINDOW_HEIGHT;

    focusX.value = x;
    focusY.value = y;
    focusRingScale.value = withSpring(1);
    // camera.current?.setFocusPoint?.({ x, y });
  };

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
        name: nameBlock?.text?.trim() || null,
        price: p.text.trim(),
        cropBox: { x, y, width: w, height: h },
        priceBox: p.boundingBox,
        nameBox: nameBlock?.boundingBox,
      });
    });

    return result;
  }, []);

  // const frameProcessor = useFrameProcessor((frame) => {
  //   'worklet';
  //   try {
  //     const result = scanOCR(frame)
  //     runOnJS(setBoxesFromBlocks)(result?.result?.blocks || []);
  //   } catch (e) { }
  // }, []);

  // const setBoxesFromBlocks = useCallback((blocks: any) => {
  //   if (!blocks.length) return setBoxes([]);
  //   const grouped = groupBlocks(blocks);
  //   const overlay = grouped.flatMap(item => [
  //     { ...item.priceBox, color: '#00ff0088', stroke: '#00ff00' },
  //     item.nameBox && { ...item.nameBox, color: '#0088ff88', stroke: '#0088ff' },
  //   ]).filter(Boolean);
  //   setBoxes(overlay);
  // }, [groupBlocks]);

  const captureAndSave = useCallback(async () => {
    if (!camera.current || !isFocused || !isInitialized) {
      console.log('Early return: camera not ready');
      setProcessing(false);
      return;
    }

    setProcessing(true);
    setIsCapturing(true); // ← pauses your live boxes (snapshot loop)

    try {
      // Small delay + resume preview (Android stability)
      await new Promise(r => setTimeout(r, 300));

      console.log('Taking photo...');
      const photo = await camera.current.takePhoto({
        flash,
        enableShutterSound: false
      });

      console.log('Photo taken (cache path):', photo.path);

      const photoUri = `file://${photo.path}`;
      await MediaLibrary.saveToLibraryAsync(photoUri);
      console.log('Photo saved to gallery!');

      const asset = await MediaLibrary.createAssetAsync(photoUri);  // <== key fix
      const contentUri = asset.localUri || asset.uri; // now a content:// URI

      console.log("Using content URI for ML Kit:", contentUri);

      // ML Kit OCR — now works perfectly on Android
      const mlResult = await TextRecognition.recognize(contentUri);

      // Fix TypeScript "Property 'x' does not exist" (known type bug)
      const blocks = mlResult.blocks.map(b => ({
        text: b.text,
        boundingBox: {
          x: b.frame.x,
          y: b.frame.y,
          width: b.frame.width,
          height: b.frame.height,
        },
      }));

      const grouped = groupBlocks(blocks);
      console.log('Step 2 – Found items:', grouped.length);

      const newItems = [];
      for (const item of grouped) {
        try {
          const cropped = await ImageEditor.cropImage(contentUri, {
            offset: {
              x: Math.round(item.cropBox.x),
              y: Math.round(item.cropBox.y),
            },
            size: {
              width: Math.round(item.cropBox.width),
              height: Math.round(item.cropBox.height),
            },
            displaySize: { width: 300, height: 300 },
            resizeMode: 'contain',
          });

          const base64 = await FileSystem.readAsStringAsync(cropped.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Clean up cropped temp file
          await FileSystem.deleteAsync(cropped.uri, { idempotent: true });

          newItems.push({
            name: item.name || '—',
            price: item.price,
            imageBase64: `data:image/jpeg;base64,${base64}`,
          });
        } catch (cropError) {
          console.warn('Cropping failed for one item:', cropError);
        }
      }

      // Success feedback
      if (newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
        Alert.alert('Success!', `${newItems.length} item(s) added`);
      } else {
        Alert.alert('No prices found', 'Try better lighting or clearer text');
      }

    } catch (err) {
      console.error('Capture failed:', err);
      Alert.alert('Error', err.message || 'Failed to capture photo');
    } finally {
      setProcessing(false);
      setIsCapturing(false); // ← resume live boxes
    }
  }, [camera, isFocused, isInitialized, flash, groupBlocks, setItems]);

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
      <TouchableWithoutFeedback onPress={closeZoomPicker}>
        <GestureDetector gesture={pinch}>
          <TouchableWithoutFeedback onPress={handleTapToFocus}>
            <Reanimated.View style={styles.cameraContainer}>
              <AnimatedCamera
                ref={camera}
                style={styles.absoluteFill}
                device={device}
                isActive={isFocused && isInitialized}
                onInitialized={onInitialized}
                photo={true}
                torch={torch}
                exposure={0}
                // frameProcessor={isCapturing ? undefined : frameProcessor}
                enableFpsGraph={true}
                outputOrientation="device"
                audio={microphone.hasPermission}
                enableLocation={location.hasPermission}
                resizeMode="cover"
              />

              {/* Focus Ring */}
              <Reanimated.View style={[styles.focusRing, focusRingAnimatedStyle]} />

              {/* OCR Boxes */}
              {boxes.map((box, i) => (
                <View key={i} style={[StyleSheet.absoluteFill, {
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                  borderWidth: 3,
                  borderColor: box.stroke,
                  backgroundColor: box.color,
                  borderRadius: 12,
                }]} pointerEvents="none" />
              ))}

              {/* Back Button */}
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Icons.Ionicons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>

              {/* Top Bar */}
              <View style={styles.topBar}>
                <Text style={styles.title}>Price Scanner</Text>
                <Text style={styles.subtitle}>Green = price • Blue = name</Text>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}>
                  <Icons.MaterialIcons name={flash === 'on' ? 'flash-on' : 'flash-off'} size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.captureBtn, processing && styles.captureBtnDisabled]}
                  onPress={captureAndSave}
                  disabled={processing}
                >
                  {processing ? <ActivityIndicator color="#000" /> : <Text style={styles.captureText}>ADD ITEMS</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconBtn} onPress={() => setItems([])}>
                  <Icons.MaterialCommunityIcons name="delete-variant" size={28} color="#fff" />
                  {items.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{items.length}</Text></View>}
                </TouchableOpacity>
              </View>

              {/* ZOOM & TORCH CONTROLS */}
              <View style={styles.zoomControlContainer} pointerEvents="box-none">
                {/* Torch Button */}
                <TouchableOpacity style={[styles.torchBtn, torch === 'on' && styles.torchActive]} onPress={() => setTorch(prev => prev === 'off' ? 'on' : 'off')} >
                  <Icons.MaterialIcons name={torch === 'on' ? 'flashlight-on' : 'flashlight-off'} size={28} color={torch === 'on' ? '#ffd60a' : '#fff'} />
                </TouchableOpacity>

                {/* Zoom Picker Button */}
                <TouchableOpacity
                  style={styles.zoomPickerBtn}
                  onPress={() => { isZoomPickerOpen.value = !isZoomPickerOpen.value; }}
                >
                  <ReanimatedText style={styles.zoomPickerText}>
                    {currentZoomDisplay?.value}x
                  </ReanimatedText>
                  <Icons.Feather name="chevron-right" size={24} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>

                {/* Zoom Level Panel */}
                <Reanimated.View style={[styles.zoomPickerPanel, animatedZoomPanelStyle]}>
                  {zoomLevels.map((level) => (
                    <ZoomLevelButton
                      key={level}
                      level={level}
                      zoom={zoom}
                      onSelect={(selected) => {
                        zoom.value = withSpring(selected);
                        isZoomPickerOpen.value = false;
                      }}
                    />
                  ))}
                </Reanimated.View>
              </View>
            </Reanimated.View>
          </TouchableWithoutFeedback>
        </GestureDetector>
      </TouchableWithoutFeedback>

      {/* Results */}
      <ScrollView style={[styles.results, { backgroundColor: theme.colors.background }]}>
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
  backBtn: { position: 'absolute', top: 30, left: 20, padding: 5, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)' },
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
    left: 20,
    alignItems: 'flex-start',
  },
  torchBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 14,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 2
  },
  torchActive: {
    shadowColor: "#fcd34d",
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
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
    left: -15,
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
  results: { flex: 1, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 48 },
  empty: { textAlign: 'center', color: '#888', marginTop: 60, fontSize: 18 },
  card: { flexDirection: 'row', backgroundColor: '#222', borderRadius: 16, padding: 12, marginBottom: 12 },
  thumb: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#333' },
  info: { flex: 1, justifyContent: 'center', paddingLeft: 16 },
  name: { fontSize: 17, fontWeight: '600', color: '#fff' },
  price: { fontSize: 22, fontWeight: 'bold', color: '#0f0', marginTop: 6 },
});