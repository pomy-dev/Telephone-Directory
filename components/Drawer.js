import { useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Animated,
  Image,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Icons } from '../constants/Icons';
import { Images } from '../constants/Images';
import { AppContext } from '../context/appContext';

const CustomDrawerContent = ({ states, navigation }) => {
  const { isDarkMode, selectedState, setSelectedState, notificationsEnabled, isOnline, toggleTheme, toggleNotifications, toggleOnlineMode } = useContext(AppContext);

  const fadeAnims = useRef(states.map(() => new Animated.Value(1))).current;
  const scaleAnims = useRef(states.map(() => new Animated.Value(1))).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [pickerValue, setPickerValue] = useState(selectedState || 'BE');

  const handlePressIn = (index) => {
    Animated.parallel([
      Animated.timing(fadeAnims[index], {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = (index) => {
    Animated.parallel([
      Animated.timing(fadeAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const selectedStateData = states.find((state) => state.name === (selectedState));
  const emblemSource = selectedStateData && selectedStateData.coatOfArmsIcon;

  const renderPickerItem = ({ item }) => (
    <Pressable
      style={({ pressed }) => [
        styles.pickerItem,
        isDarkMode && styles.darkPickerItem,
        pressed && styles.pickerItemPressed,
      ]}
      onPress={() => {
        setPickerValue(item.name);
        setSelectedState(item.name);
        setModalVisible(false);
        navigation.closeDrawer();
      }}
    >
      <Image
        source={item.coatOfArmsIcon}
        style={styles.pickerEmblem}
        resizeMode="contain"
      />
      <Text style={[styles.pickerItemText, isDarkMode && styles.darkText]}>
        {item.name}
      </Text>
    </Pressable>
  );

  return (
    <DrawerContentScrollView
      style={[styles.drawerContainer, isDarkMode && styles.darkDrawerContainer]}
      contentContainerStyle={styles.contentContainer}
      scrollEnabled={true}
    >
      <View style={styles.drawerContent}>
        <Text style={[styles.drawerTitle, isDarkMode && styles.darkText]}>Explore</Text>

        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>State Directories</Text>

        <View style={styles.emblemContainer}>
          <Image
            source={emblemSource}
            style={[styles.emblemImage, isDarkMode && styles.darkEmblemImage]}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={[styles.pickerContainer, isDarkMode && styles.darkPickerContainer]}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.pickerDisplay}>
            <Text style={[styles.pickerText, isDarkMode && styles.darkText]}>
              {selectedState || 'Select a Directory'}
            </Text>
            <Icons.Ionicons
              name="chevron-down"
              size={20}
              color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
              style={styles.pickerIcon}
            />
          </View>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkText]}>
                Select a Directory
              </Text>
              <FlatList
                data={states}
                renderItem={renderPickerItem}
                keyExtractor={(item) => item.id}
                style={styles.pickerList}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Insights</Text>
        <Animated.View
          style={{
            opacity: fadeAnims[0],
            transform: [{ scale: scaleAnims[0] }],
          }}
        >
          <TouchableOpacity
            style={styles.drawerItem}
            onPressIn={() => handlePressIn(0)}
            onPressOut={() => handlePressOut(0)}
            onPress={() => {
              navigation.navigate('Publications', { screen: 'PublicationList', params: { contentType: 'Publications', selectedState } });
              navigation.closeDrawer();
            }}
          >
            <Icons.Ionicons
              name="newspaper-outline"
              size={20}
              color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
              style={styles.icon}
            />
            <Text style={[styles.itemText, isDarkMode && styles.darkText]}>Publications</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnims[1],
            transform: [{ scale: scaleAnims[1] }],
          }}
        >
          <TouchableOpacity
            style={styles.drawerItem}
            onPressIn={() => handlePressIn(1)}
            onPressOut={() => handlePressOut(1)}
            onPress={() => {
              navigation.navigate('Promotions', { screen: 'PublicationList', params: { contentType: 'Promotions', selectedState } });
              navigation.closeDrawer();
            }}
          >
            <Icons.AntDesign
              name="tags"
              size={20}
              color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
              style={styles.icon}
            />
            <Text style={[styles.itemText, isDarkMode && styles.darkText]}>Promotions</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnims[1],
            transform: [{ scale: scaleAnims[1] }],
          }}
        >
          <TouchableOpacity
            style={styles.drawerItem}
            onPressIn={() => handlePressIn(1)}
            onPressOut={() => handlePressOut(1)}
            onPress={() => {
              navigation.navigate('Corporate', { screen: 'Corporates' });
              navigation.closeDrawer();
            }}
          >
            <Icons.Feather
              name="briefcase"
              size={20}
              color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
              style={styles.icon}
            />
            <Text style={[styles.itemText, isDarkMode && styles.darkText]}>Corporates</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnims[1],
            transform: [{ scale: scaleAnims[1] }],
          }}
        >
          <TouchableOpacity
            style={styles.drawerItem}
            onPressIn={() => handlePressIn(1)}
            onPressOut={() => handlePressOut(1)}
            onPress={() => {
              navigation.navigate('Event', { screen: 'Events' });
              navigation.closeDrawer();
            }}
          >
            <Icons.MaterialIcons
              name="event"
              size={20}
              color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
              style={styles.icon}
            />
            <Text style={[styles.itemText, isDarkMode && styles.darkText]}>B.s Events</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            opacity: fadeAnims[1],
            transform: [{ scale: scaleAnims[1] }],
          }}
        >
          <TouchableOpacity
            style={styles.drawerItem}
            onPressIn={() => handlePressIn(1)}
            onPressOut={() => handlePressOut(1)}
            onPress={() => {
              navigation.navigate('LocalVendor', { screen: 'VendorLogin' });
              navigation.closeDrawer();
            }}
          >
            <Icons.MaterialIcons
              name="store"
              size={20}
              color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
              style={styles.icon}
            />
            <Text style={[styles.itemText, isDarkMode && styles.darkText]}>Local Market</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Preferences</Text>

        <View style={styles.drawerItem}>
          <Icons.Ionicons
            name={isDarkMode ? 'moon' : 'sunny'}
            size={20}
            color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
            style={styles.icon}
          />
          <Text style={[styles.itemText, isDarkMode && styles.darkText]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
            thumbColor={isDarkMode ? '#FBBF24' : '#FFFFFF'}
            style={styles.switch}
          />
        </View>

        <View style={styles.drawerItem}>
          <Icons.Ionicons
            name={notificationsEnabled ? "notifications" : "notifications-off"}
            size={20}
            color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
            style={styles.icon}
          />
          <Text style={[styles.itemText, isDarkMode && styles.darkText]}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
            thumbColor={notificationsEnabled ? '#FBBF24' : '#FFFFFF'}
            style={styles.switch}
          />
        </View>

        <View style={styles.drawerItem}>
          <Icons.Ionicons
            name={isOnline ? 'wifi' : 'cloud-offline'}
            size={20}
            color={isDarkMode ? '#E0E0E0' : '#4B5EAA'}
            style={styles.icon}
          />

          <Text style={[styles.itemText, isDarkMode && styles.darkText]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>

          <Switch
            value={isOnline}
            onValueChange={toggleOnlineMode}
            trackColor={{ false: '#D1D5DB', true: '#60A5FA' }}
            thumbColor={isOnline ? '#FBBF24' : '#FFFFFF'}
            style={styles.switch}
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    backgroundColor: "#F8FAFC",
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  darkDrawerContainer: {
    backgroundColor: "#1E293B",
  },
  contentContainer: {
    flexGrow: 1
  },
  drawerContent: {
    paddingHorizontal: 3,
  },
  drawerTitle: {
    fontSize: 22, // Slightly smaller for compactness
    fontWeight: "700",
    color: "#1E293B",
    // marginBottom: 20,
    fontFamily: "System",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    marginVertical: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12, // Reduced padding
    borderRadius: 10, // Slightly smaller radius
    marginBottom: 4, // Tighter spacing
    backgroundColor: "transparent",
  },
  activeDrawerItem: {
    backgroundColor: "#E0E7FF",
  },
  itemText: {
    fontSize: 15, // Slightly smaller text
    fontWeight: "500",
    color: "#1E293B",
    marginLeft: 10,
    flex: 1,
  },
  darkText: {
    color: "#E0E0E0",
  },
  icon: {
    marginRight: 10, // Reduced margin
  },
  switch: {
    transform: [{ scale: 0.85 }], // Slightly smaller switch
  },
  emblemContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  emblemImage: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  darkEmblemImage: {
    borderColor: "#4B5EAA",
    backgroundColor: "#2D3748",
  },
  pickerContainer: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  darkPickerContainer: {
    borderColor: "#4B5EAA",
    backgroundColor: "#2D3748",
  },
  pickerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1E293B",
    flex: 1,
  },
  pickerIcon: {
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxHeight: "50%",
  },
  darkModalContent: {
    backgroundColor: "#1E293B",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 15,
    textAlign: "center",
  },
  pickerList: {
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  darkPickerItem: {
    borderBottomColor: "#4B5EAA",
  },
  pickerItemPressed: {
    backgroundColor: "#E0E7FF",
  },
  pickerEmblem: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 5,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: "#053f86ff",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  }
});

export default CustomDrawerContent;