import React, { useEffect, useMemo, useCallback, useContext } from "react";
import {
  Modal, View, StyleSheet, useWindowDimensions, Keyboard, Platform,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
  interpolate, Extrapolation, runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function CustomBottomSheet({
  visible,
  onClose,
  children,
  snapPoints = [45], // default matches your old 45% modal
  initialSnapIndex = 0,
  backgroundColor = "#fff",
  handleColor = "#E6E7EA",
  enablePanDownToClose = true,
}) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  // ── Shared values for smooth UI-thread animation ─────────────────────
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const minSnapShared = useSharedValue(SCREEN_HEIGHT);
  const screenHShared = useSharedValue(SCREEN_HEIGHT);
  const startY = useSharedValue(0);

  // Calculate translateY positions (smaller = more open)
  const snapPositions = useMemo(() => {
    const positions = snapPoints
      .map((perc) => SCREEN_HEIGHT * (1 - perc / 100))
      .sort((a, b) => a - b); // smallest first (most open)

    return positions;
  }, [snapPoints, SCREEN_HEIGHT]);

  // Update shared config when screen/snapPoints change
  useEffect(() => {
    if (snapPositions.length > 0) {
      minSnapShared.value = snapPositions[0];
    }
    screenHShared.value = SCREEN_HEIGHT;
  }, [snapPositions, SCREEN_HEIGHT]);

  // ── Open / Close animation when visible prop changes ─────────────────
  useEffect(() => {
    if (visible) {
      const target = snapPositions[initialSnapIndex] ?? snapPositions[0] ?? SCREEN_HEIGHT * 0.55;
      translateY.value = withSpring(target, {
        damping: 50,
        stiffness: 300,
      });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, {
        damping: 40,
        stiffness: 280,
      });
    }
  }, [visible, snapPositions, initialSnapIndex, SCREEN_HEIGHT]);

  const handleDismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleClose = () => {
    onClose();
  };

  // ── Pan Gesture (draggable everywhere on the sheet) ───────────────────
  const panGesture = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .failOffsetX([-20, 20])
    .onBegin(() => {
      "worklet";
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      "worklet";

      const minSnap = minSnapShared.value;
      const maxSnap = screenHShared.value;
      const next = startY.value + event.translationY;

      // allow slight over-drag
      translateY.value = Math.max(
        minSnap - 80,
        Math.min(maxSnap + 50, next)
      );
    })
    .onEnd((event) => {
      "worklet";

      const current = translateY.value;
      const velocity = event.velocityY;

      const minSnap = minSnapShared.value;
      const maxSnap = screenHShared.value;

      let target = maxSnap;

      if (enablePanDownToClose && velocity > 700 && current > SCREEN_HEIGHT * 0.45) {
        target = maxSnap;
      } else {
        let closest = maxSnap;
        let minDist = Infinity;

        for (const pos of snapPositions) {
          const dist = Math.abs(current - pos);
          if (dist < minDist) {
            minDist = dist;
            closest = pos;
          }
        }

        if (
          Math.abs(current - maxSnap) < minDist + 80 ||
          (velocity > 400 && current > maxSnap * 0.8)
        ) {
          target = maxSnap;
        } else {
          target = closest;
        }
      }

      const springConfig =
        target === maxSnap
          ? { damping: 40, stiffness: 280 }
          : { damping: 50, stiffness: 300 };

      translateY.value = withSpring(target, springConfig, (finished) => {
        "worklet";
        if (finished && target === maxSnap) {
          runOnJS(handleClose)();
          runOnJS(handleDismissKeyboard)();
        }
      });
    });

  // ── Animated styles ─────────────────────────────────────────────────────
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [minSnapShared.value, screenHShared.value],
      [0.65, 0],
      Extrapolation.CLAMP
    ),
  }));

  // ── Backdrop tap to close ───────────────────────────────────────────────
  const handleBackdropPress = useCallback(() => {
    if (!enablePanDownToClose) return;

    translateY.value = withSpring(SCREEN_HEIGHT, { damping: 40, stiffness: 280 }, (finished) => {
      'worklet';
      if (finished) {
        runOnJS(handleClose)();
        runOnJS(handleDismissKeyboard)();
      }
    });
  }, [enablePanDownToClose, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]} />
        <View style={styles.backdropTouchableArea} onTouchStart={handleBackdropPress} />

        {/* Draggable Sheet */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheet,
              sheetStyle,
              { backgroundColor, paddingHorizontal: 16 },
              Platform.select({
                ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 12 },
                android: { elevation: 12 },
              }),
            ]}
          >
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: handleColor }]} />
            </View>

            {/* Your content goes here */}
            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  backdropTouchableArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%", // full height so we can drag freely
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleContainer: {
    paddingTop: 12,
    marginTop: 5,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 6,
  },
});