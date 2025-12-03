import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
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
  TextInput,
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
import { SaveFormat } from 'expo-image-manipulator';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { useIsFocused } from '@react-navigation/core';
import { API_BASE_URL } from '../../config/env';
import * as FileSystem from 'expo-file-system';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetBackdrop,
  SCREEN_HEIGHT,
} from '@gorhom/bottom-sheet';
import { addFlyerItems } from '../../service/Supabase-Fuctions';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';
import { AppContext } from '../../context/appContext';
import { CustomToast } from '../../components/customToast';

Reanimated.addWhitelistedNativeProps({ zoom: true });
const AnimatedCamera = Reanimated.createAnimatedComponent(Camera);
const ReanimatedText = Reanimated.createAnimatedComponent(Text);

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
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

const CommentBottomSheet = React.forwardRef(
  (
    {
      store,
      setStoreName,
      onSubmit,
      onDismiss,
      snapPoints,
      renderBackdrop,
      isSubmiting
    },
    ref
  ) => {
    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        onDismiss={onDismiss}
        keyboardBehavior="extend"
        android_keyboardInputMode="adjustResize"
        enablePanDownToClose
      >
        <BottomSheetView style={sheetStyles.content}>
          <Text style={sheetStyles.title}>Specify Store</Text>

          {/* store input */}
          <TextInput
            style={[sheetStyles.input, { minHeight: 50 }]}
            placeholder="Specify store of flyer"
            value={store}
            onChangeText={setStoreName}
            multiline
          />

          {/* Submit */}
          <TouchableOpacity style={[sheetStyles.submitBtn, isSubmiting && sheetStyles.submiting]} onPress={onSubmit}>
            {isSubmiting ? <ActivityIndicator size={20} color={'#eee'} /> : <Text style={sheetStyles.submitTxt}>Submit Review</Text>}
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal >
    );
  }
);
CommentBottomSheet.displayName = 'CommentBottomSheet';

const sheetStyles = StyleSheet.create({
  content: { padding: 20, flex: 1 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 8 },
  starBtn: { padding: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submiting: { backgroundColor: '#96b2edff' },
  submitTxt: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});

export default function PamphletScanner({ navigation }) {
  const { theme } = React.useContext(AppContext)
  const isFocused = useIsFocused();
  const device = useCameraDevice('back') || useCameraDevice('front');
  const camera = useRef(null);

  const [permissionGranted, setPermissionGranted] = useState(null);
  const [items, setItems] = useState([]);
  const [flash, setFlash] = useState('off');
  const [torch, setTorch] = useState('off');
  const [isInitialized, setIsInitialized] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [geminiProcessing, setGeminiProcessing] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isFAB, setIsFAB] = useState(false);

  // Bottom Sheet
  const bottomSheetRef = useRef(null);
  const [storeName, setStoreName] = useState('');
  const snapPoints = useMemo(() => ['50%', '55%'], []);

  const microphone = useMicrophonePermission()
  const location = useLocationPermission()

  // Zoom & Focus
  const zoom = useSharedValue(1);
  const focusRingScale = useSharedValue(0);
  const focusX = useSharedValue(0.5);
  const focusY = useSharedValue(0.5);
  const isZoomPickerOpen = useSharedValue(false);

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

  // FAB Animation
  const fabStyle = useAnimatedStyle(() => ({
    opacity: items.length > 0 ? withTiming(1, { duration: 300 }) : withTiming(0, { duration: 200 }),
    transform: [{ scale: items.length > 0 ? withSpring(1) : withSpring(0.8) }],
  }));

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

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

  const captureAndAnalyzeWithOpenAI = useCallback(async () => {
    if (!camera.current || !isFocused) return;
    setCapturing(true);

    try {
      const photo = await camera.current.takePhoto({
        flash,
        enableShutterSound: false,
      });
      console.log('Taken photo')
      setCapturing(false);

      await GeminiAIProcess(photo.path)
    } catch (err) {
      console.error('Capturing error:', err.message);
      Alert.alert(
        'Camera error',
        'Could not read the flyer. Try better lighting or a clearer image.'
      );
    }
  }, [camera, isFocused, flash]);

  const GeminiAIProcess = async (path) => {
    setGeminiProcessing(true)
    try {
      const photoUri = `file://${path}`;

      const base64 = await FileSystem.readAsStringAsync(photoUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(`${API_BASE_URL}/api/process-img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: base64,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error');
      }

      const extracted = data.items;

      console.log('From AI output: ', extracted)

      // Now crop each item using the bounding box
      const newItems = await Promise.all(
        extracted.map(async (it) => {
          let croppedImage = Images.product;

          if (it.boundingBox) {
            try {
              croppedImage = await cropImage(path, it.boundingBox);
            } catch (cropErr) {
              console.warn('Crop failed for item:', it.itemName, cropErr);
            }
          }

          return {
            name: Array.isArray(it.itemName) ? it.itemName.join(', ') : it.itemName || 'Unknown Item',
            price: it.price || '—',
            type: it.type || 'single item',
            description: it.description || '',
            image: croppedImage?.uri,
            unit: it.unit || 'each'
          };
        })
      );

      setItems((prev) => [...prev, ...newItems]);
      Alert.alert('Success!', `${newItems.length} items added with cropped images!`);
    } catch (e) {
      console.error('OpenAI error:', e);
      Alert.alert(
        'No items returned',
        e.message.includes('rate limit')
          ? 'Rate limited. Try again in a minute.'
          : 'Could not read the flyer. Try better lighting or a clearer image.'
      );
    } finally {
      setGeminiProcessing(false)
    }
  }

  const cropImage = async (photoPath, box, paddingPercent = 10) => {
    const { x, y, width, height } = box;

    // Convert normalized coords to pixels (with padding)
    const paddingX = (width * WINDOW_WIDTH * paddingPercent) / 100;
    const paddingY = (height * WINDOW_HEIGHT * paddingPercent) / 100;

    const cropRegion = {
      backgroundColor: null,
      originX: Math.max(0, Math.round(x * WINDOW_WIDTH - paddingX)),
      originY: Math.max(0, Math.round(y * WINDOW_HEIGHT - paddingY)),
      width: Math.round(width * WINDOW_WIDTH + paddingX * 2),
      height: Math.round(height * WINDOW_HEIGHT + paddingY * 2),
    };

    try {
      const imageContext = ImageManipulator.ImageManipulator.manipulate(`file://${photoPath}`);
      const croppedImage = imageContext.crop(cropRegion)
      const resultImg = await croppedImage.renderAsync()
      const cachedImg = await resultImg.saveAsync({ format: SaveFormat.PNG, })

      return cachedImg
    } catch (err) {
      console.warn('Manipulator crop failed:', err);
      return Images.product;
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

  const handleSaveFlyer = async () => {
    if (!storeName.trim()) {
      Alert.alert('Missing Store', 'Please enter the store name');
      return;
    }

    setIsSubmiting(true)
    try {
      const savedItems = await addFlyerItems(storeName, items);
      savedItems && CustomToast('Saved!', `${items.length} items from ${storeName} saved`)
    } catch (err) {
      console.error(err.message)
      setItems([]);
    } finally {
      setIsSubmiting(false);
      bottomSheetRef.current?.close();
      setIsFAB(false);
      setItems([]);
    }
  };

  return (
    <BottomSheetModalProvider>
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
                  enableFpsGraph={true}
                  outputOrientation="device"
                  audio={microphone.hasPermission}
                  enableLocation={location.hasPermission}
                  resizeMode="cover"
                />

                {/* Focus Ring */}
                <Reanimated.View style={[styles.focusRing, focusRingAnimatedStyle]} />

                {/* Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                  <Icons.Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>

                {/* Top Bar */}
                <View style={styles.topBar}>
                  <Text style={styles.title}>Flyer Scanner</Text>
                  <Text style={styles.subtitle}>Point at flyer → tap ADD ITEMS</Text>
                </View>

                {/* Bottom Controls */}
                <View style={styles.bottomBar}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setFlash(f => f === 'off' ? 'on' : 'off')}>
                    <Icons.MaterialIcons name={flash === 'on' ? 'flash-on' : 'flash-off'} size={28} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.captureBtn, capturing && styles.captureBtnDisabled]}
                    onPress={captureAndAnalyzeWithOpenAI}
                    disabled={capturing && geminiProcessing}
                  >
                    {capturing ? <ActivityIndicator color="#000" /> : <Text style={styles.captureText}>ADD ITEMS</Text>}
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
                      {`${currentZoomDisplay?.value.toString()}`}x
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

        {/* Results + FAB */}
        <View style={[styles.resultsContainer, { backgroundColor: theme.colors.background }]}>
          <ScrollView contentContainerStyle={styles.results}>
            {geminiProcessing ? (
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <ActivityIndicator size="large" color="#58a9f4" />
                <Text style={{ color: '#888', marginTop: 20 }}>AI processing flyer snapshot...</Text>
              </View>
            ) : items.length === 0 ? (
              <Text style={styles.empty}>No items yet. Scan a flyer!</Text>
            ) : (
              items.map((item, i) => (
                <View key={i} style={styles.card}>
                  <Image source={Images.priceTag} style={styles.thumb} />
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.price}>{item.price}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <Reanimated.View style={[styles.fab, fabStyle]}>
            <TouchableOpacity
              onPress={() => {
                bottomSheetRef.current?.present()
                setIsFAB(true)
              }}
              style={styles.fabButton}
              disabled={isFAB}
            >
              <Icons.Feather name="send" size={32} color="#fff" />
            </TouchableOpacity>
          </Reanimated.View>
        </View>

        <CommentBottomSheet
          ref={bottomSheetRef}
          store={storeName}
          setStoreName={setStoreName}
          onSubmit={handleSaveFlyer}
          onDismiss={() => setStoreName('')}
          snapPoints={snapPoints}
          renderBackdrop={renderBackdrop}
          isSubmiting={isSubmiting}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loadingText: { color: '#fff', marginTop: 16, fontSize: 16 },
  cameraContainer: { height: WINDOW_HEIGHT * 0.6 },
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
  resultsContainer: { height: WINDOW_HEIGHT * 0.4, marginBottom: 45 },
  results: { paddingHorizontal: 16, paddingVertical: 20 },
  empty: { textAlign: 'center', color: '#888', marginTop: 60, fontSize: 18 },
  card: { flexDirection: 'row', backgroundColor: '#222', borderRadius: 16, padding: 12, marginBottom: 12 },
  thumb: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#333' },
  info: { flex: 1, justifyContent: 'center', paddingLeft: 16 },
  name: { fontSize: 17, fontWeight: '600', color: '#fff' },
  price: { fontSize: 22, fontWeight: 'bold', color: '#0f0', marginTop: 6 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#00d4ff',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  fabButton: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },

  // Bottom Sheet
  sheetContent: { flex: 1, padding: 24 },
  sheetTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  sheetSubtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 8, marginBottom: 30 },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: '#00d4ff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});