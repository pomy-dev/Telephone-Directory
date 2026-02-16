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

// Increased dimensions for a more "Spacious" feel
const ITEM_HEIGHT = 60; // Was 48 - higher targets feel more premium
const MENU_WIDTH = width * 0.65; // Wider menu (around 250-280px)

export const MoreDropdown = ({ items }) => {
  const { theme, isDarkMode } = React.useContext(AppContext);
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

  const textColor = isDarkMode ? "#fff" : "#000";

  return (
    <>
      <TouchableOpacity onPress={open} activeOpacity={0.7} style={styles.anchor}>
        <Icons.Entypo name="dots-three-vertical" size={24} color={textColor} />
      </TouchableOpacity>

      <Modal transparent visible={visible} animationType="none" onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <Animated.View
            style={[
              styles.menu,
              {
                backgroundColor: isDarkMode ? "#000" : "#fff",
                borderColor: isDarkMode ? "#222" : "#f0f0f0",
                transform: [{ scale: scaleAnim }],
                opacity: scaleAnim,
              },
            ]}
          >
            {/* Optional Header matching your Drawer feel */}
            <View style={styles.menuHeader}>
              <Text style={[styles.headerText, { color: textColor }]}>
                OPTIONS<Text style={{ color: '#10b981' }}>.</Text>
              </Text>
            </View>

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
                    <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#111' : '#f9f9f9' }]}>
                      <Icon name={item.iconName} size={22} color={isDarkMode ? "#fff" : "#666"} />
                    </View>
                    <Text style={[styles.itemText, { color: textColor }]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>

                  {!isLast && <View style={[styles.separator, { backgroundColor: isDarkMode ? '#222' : '#f0f0f0' }]} />}
                </View>
              );
            })}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  anchor: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dimmed background makes the modal "pop"
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60, // Adjusted for header height
    paddingRight: 20,
  },
  menu: {
    width: MENU_WIDTH,
    borderRadius: 20, // More rounded, modern corners
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    paddingVertical: 10,
  },
  menuHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f010',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#999',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemText: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
    opacity: 0.5,
  },
});