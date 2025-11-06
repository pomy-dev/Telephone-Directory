// src/components/MoreDropdown.js
import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { Icons } from '../constants/Icons';
import { AppContext } from '../context/appContext';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 48;
const MENU_WIDTH = 210;

export const MoreDropdown = ({ items }) => {
  const { theme } = React.useContext(AppContext);
  const [visible, setVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const open = () => {
    setVisible(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  return (
    <>
      {/* Anchor: three-dot icon */}
      <TouchableOpacity onPress={open} activeOpacity={0.7}>
        <Icons.Entypo name="dots-three-vertical" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Modal with dropdown */}
      <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <Animated.View
            style={[
              styles.menu,
              {
                backgroundColor: theme.colors.card || '#fff',
                borderColor: theme.colors.border || '#e0e0e0',
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
          >
            {items.map((item, idx) => {
              const Icon = Icons[item.icon];
              const isLast = idx === items.length - 1;

              return (
                <View key={idx}>
                  <TouchableOpacity
                    style={styles.item}
                    activeOpacity={0.7}
                    onPress={() => {
                      close();
                      item.onPress();
                    }}
                  >
                    <Icon name={item.iconName} size={22} color="#666" />
                    <Text style={[styles.itemText, { color: theme.colors.text }]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>

                  {/* Separator line after each item except last */}
                  {!isLast && (
                    <View
                      style={{
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: theme.colors.border || '#e0e0e0',
                        marginLeft: 44, // align with icon + text padding
                      }}
                    />
                  )}
                </View>
              );
            })}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 16, // matches your header height
    paddingRight: 16,
  },
  menu: {
    width: MENU_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    paddingHorizontal: 16,
  },
  itemText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '500',
  },
});