import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppContext } from "../context/appContext";
import { Icons } from "../constants/Icons";

const NotificationListScreen = ({ navigation }) => {
  const { theme, notifications } = useContext(AppContext);
  const route = useRoute();
  const listRef = useRef(null);
  const { width } = useWindowDimensions();
  const selectedNotificationId = route.params?.notificationId || null;
  const [error, setError] = useState(null);
  const [layoutMode, setLayoutMode] = useState("list");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleLayout = () => {
    setLayoutMode((prev) => (prev === "list" ? "grid" : "list"));
  };

  useEffect(() => {
    if (selectedNotificationId && notifications.length > 0 && listRef.current) {
      const index = notifications.findIndex(
        (n) =>
          n.id === selectedNotificationId || n._id === selectedNotificationId
      );
      if (index !== -1) {
        listRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [selectedNotificationId, notifications]);

  const handleNotificationPress = (item) => {
    setSelectedNotification(item);
    setModalVisible(true);
  };

  const renderCategoryIcon = (category) => {
    switch (category) {
      case "warning":
        return <Icons.AntDesign name="warning" color={"#e49d22ff"} />;
      case "alert":
        return <Icons.Feather name="alert-circle" color={"#f34f4fff"} />;
      case "announcement":
        return <Icons.MaterialIcons name="announcement" color={"#4fa1f3ff"} />;
      case "maintenance":
        return (
          <Icons.MaterialCommunityIcons name="tools" color={"#e97735ff"} />
        );
      case "update":
        return <Icons.MaterialIcons name="update" color={"#3bf6e0ff"} />;
      case "reminder":
        return (
          <Icons.MaterialIcons
            name="notifications-active"
            color={"#8e44adff"}
          />
        );
      default:
        return <Icons.AntDesign name="infocirlceo" color={"#03ff20ff"} />;
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        layoutMode === "grid" && [styles.gridItem, { width: (width - 48) / 2 }],
        {
          backgroundColor:
            selectedNotificationId === item._id
              ? theme.colors.primary
              : theme.colors.card,
        },
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      {/* Logo */}
      {item.company?.logo && (
        <View
          style={[
            styles.logoContainer,
            layoutMode === "grid" && styles.gridLogoContainer,
          ]}
        >
          <Image
            source={{ uri: item.company.logo }}
            style={[
              styles.companyLogo,
              { borderColor: theme.colors.card, borderWidth: 1 },
              layoutMode === "grid" && styles.gridCompanyLogo,
            ]}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Text */}
      <View
        style={[
          styles.textContainer,
          layoutMode === "grid" && styles.gridTextContainer,
        ]}
      >
        <Text
          style={[
            styles.notificationTitle,
            {
              color:
                selectedNotificationId === item._id
                  ? theme.colors.secondary
                  : theme.colors.text,
            },
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.notificationBody, {
            color:
              selectedNotificationId === item._id
                ? theme.colors.secondary
                : theme.colors.text,
          }]}
          numberOfLines={3}
        >
          {item.message}
        </Text>
        {renderCategoryIcon(item.category)}
        <Text style={[styles.companyInfo, {
          color:
            selectedNotificationId === item._id
              ? theme.colors.secondary
              : theme.colors.text,
        },]}>
          {item.company?.company_name} • {item.company?.company_type}
        </Text>
        <Text style={[styles.notificationTime, {
          color:
            selectedNotificationId === item._id
              ? theme.colors.secondary
              : theme.colors.text,
        },]}>
          {new Date(item.startDate).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderModalContent = () => (
    <View
      style={[
        styles.modalContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Header with close button */}
      <View
        style={[styles.modalHeader, { backgroundColor: theme.colors.card }]}
      >
        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
          {selectedNotification?.title}
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          style={styles.closeButton}
        >
          <Icons.Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.modalContent}>
        {selectedNotification?.company?.logo && (
          <View style={styles.modalLogoContainer}>
            <Image
              source={{ uri: selectedNotification.company.logo }}
              style={styles.modalCompanyLogo}
              resizeMode="contain"
            />
          </View>
        )}

        <Text style={[styles.modalMessage, { color: theme.colors.text }]}>
          {selectedNotification?.message}
        </Text>

        <View style={styles.modalCategoryContainer}>
          {renderCategoryIcon(selectedNotification?.category)}
          <Text
            style={[styles.modalCategoryText, { color: theme.colors.text }]}
          >
            Category: {selectedNotification?.category}
          </Text>
        </View>

        <Text style={[styles.modalCompanyInfo, { color: theme.colors.text }]}>
          {selectedNotification?.company?.company_name} •{" "}
          {selectedNotification?.company?.company_type}
        </Text>

        <Text style={[styles.modalTime, { color: theme.colors.text }]}>
          {new Date(selectedNotification?.startDate).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.colors.text }]}>
          Notifications
        </Text>
        <TouchableOpacity onPress={toggleLayout} style={styles.toggleButton}>
          <Icons.Ionicons
            name={layoutMode === "list" ? "grid-outline" : "list-outline"}
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text style={[styles.errorText, { color: "#b34141" }]}>{error}</Text>
      )}
      {notifications.length === 0 ? (
        <Text style={[styles.noNotifications, { color: theme.colors.text }]}>
          No notifications
        </Text>
      ) : (
        <FlatList
          ref={listRef}
          data={notifications}
          renderItem={renderNotification}
          // keyExtractor={(item, index) => `${item.id}-${index}`}
          keyExtractor={(item) => item._id} // Ensure unique keys
          getItemLayout={
            (data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            }) // Replace 80 with your item height
          }
          key={layoutMode}
          numColumns={layoutMode === "grid" ? 2 : 1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalSpacer} />
          </TouchableOpacity>
          <View style={[styles.modalWrapper, { width: width * 0.9 }]}>
            {renderModalContent()}
          </View>
          <TouchableOpacity
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalSpacer} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  toggleButton: {
    padding: 8,
  },
  noNotifications: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  gridItem: {
    flex: 1,
    flexDirection: "column",
    marginHorizontal: 4,
    padding: 12,
  },
  logoContainer: {
    marginRight: 12,
  },
  gridLogoContainer: {
    marginRight: 0,
    marginBottom: 8,
    alignItems: "center",
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  gridCompanyLogo: {
    width: 60,
    height: 60,
  },
  textContainer: {
    flex: 1,
  },
  gridTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 13,
    fontStyle: "italic",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlayTouchable: {
    flex: 1,
  },
  modalSpacer: {
    flex: 1,
  },
  modalWrapper: {
    borderRadius: 12,
    maxHeight: "80%",
  },
  modalContainer: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalLogoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalCompanyLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  modalCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalCategoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: "italic",
  },
  modalCompanyInfo: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 8,
    opacity: 0.8,
  },
  modalTime: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default NotificationListScreen;
