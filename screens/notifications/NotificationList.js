import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image, useWindowDimensions
} from "react-native";
import { AppContext } from "../../context/appContext";
import { AuthContext } from "../../context/authProvider";
import { Icons } from "../../constants/Icons";

const NotificationListScreen = ({ navigation, route }) => {
  const { theme, notifications } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const listRef = useRef(null);
  const { width } = useWindowDimensions();
  const { params } = route.params;
  const [layoutMode, setLayoutMode] = useState("list");
  const [filterType, setFilterType] = useState('all'); // all | company | application | employer

  // initialize selectedNotificationId
  const selectedNotificationId = params?.notificationId || null

  const toggleLayout = () => {
    setLayoutMode((prev) => (prev === "list" ? "grid" : "list"));
  };

  // apply filter to notifications before rendering
  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n._type === filterType;
  });

  useEffect(() => {
    if (selectedNotificationId && notifications.length > 0 && listRef.current) {
      const index = filteredNotifications.findIndex(
        (n) => n.application_id === selectedNotificationId || n._id === selectedNotificationId
      );
      if (index !== -1) {
        listRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [selectedNotificationId, notifications, filterType]);

  const handleNotificationPress = (item) => {
    navigation.navigate("JobInbox", { gigSelection: "notif", gigId: null, appId: item.application_id })
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

  const renderNotification = ({ item }) => {
    const isCompany = item._type === 'company';
    const isEmployer = item._type === 'employer';

    const bgColor =
      selectedNotificationId === (item._id || item.application_id)
        ? theme.colors.primary
        : theme.colors.card;

    const borderColor = isCompany
      ? theme.colors.indicator
      : isEmployer
        ? '#e08e0b'
        : theme.colors.success;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            borderLeftColor: selectedNotificationId === (item._id || item.application_id)
              ? theme.colors.notification : '#CCCCCC',
            borderLeftWidth: 4
          },
          layoutMode === "grid" && [styles.gridItem, { width: (width - 48) / 2 }],
          { backgroundColor: bgColor },
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        {/* Logo (show for both types if available) */}
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

        <View
          style={[
            styles.textContainer,
            layoutMode === "grid" && styles.gridTextContainer,
          ]}
        >
          {/* type indicator dot */}
          <View
            style={{
              position: 'absolute',
              right: 8,
              top: 0,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: borderColor,
            }}
          />

          {isCompany ? (
            // company/system notification layout
            <>
              <Text
                style={[
                  styles.notificationTitle,
                  { color: theme.colors.text },
                ]}
                numberOfLines={2}
              >
                {item.title || "Notification"}
              </Text>

              <Text
                style={[
                  styles.notificationBody,
                  { color: theme.colors.text },
                ]}
                numberOfLines={3}
              >
                {item.message}
              </Text>

              {renderCategoryIcon(item.category)}

              <Text
                style={[styles.notificationTime, { color: theme.colors.sub_text }]}
              >
                {new Date(item.created_at || item.startDate || item.applied_at).toLocaleString()}
              </Text>
            </>
          ) : (
            // application / gig notification layout (includes employer alerts)
            <>
              <Text
                style={[
                  styles.notificationTitle,
                  {
                    color:
                      selectedNotificationId === item._id ||
                        selectedNotificationId === item.application_id
                        ? theme.colors.secondary
                        : theme.colors.text,
                  },
                ]}
                numberOfLines={2}
              >
                {isEmployer ? 'New applicant:' : item.application_id ? 'Application:' : 'Applied for:'}{' '}
                {item.title || item.job_title || 'Untitled'}
              </Text>

              <Text
                style={[
                  styles.notificationBody,
                  {
                    color:
                      selectedNotificationId === item._id ||
                        selectedNotificationId === item.application_id
                        ? theme.colors.secondary
                        : theme.colors.text,
                  },
                ]}
                numberOfLines={3}
              >
                {item.message || item?.job_description}
              </Text>

              {renderCategoryIcon(item.category)}

              <Text
                style={[styles.companyInfo, {
                  color:
                    selectedNotificationId === item.application_id
                      ? theme.colors.secondary
                      : theme.colors.text,
                }]}
              >
                {item.company?.company_name
                  ? item.company.company_name
                  : isEmployer
                  && `Candidate: ${item?.applicant_details?.email || 'unknown'}${' '}\n`
                }
                {item.company?.company_type || `Status: ${item.application_status || 'N/A'}`}
              </Text>

              <Text
                style={[styles.notificationTime, {
                  color:
                    selectedNotificationId === item._id ||
                      selectedNotificationId === item.application_id
                      ? theme.colors.secondary
                      : theme.colors.text,
                }]}
              >
                {new Date(item.startDate || item.applied_at).toLocaleString()}
              </Text>
            </>
          )}

        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} >

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.colors.text }]}>
          Alert List
        </Text>
        <TouchableOpacity onPress={toggleLayout} style={styles.toggleButton}>
          <Icons.Ionicons
            name={layoutMode === "list" ? "grid-outline" : "list-outline"}
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* filter buttons row under header */}
      <View style={styles.filterRow}>
        {['all', 'company', 'application', 'employer'].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setFilterType(type)}
            style={[
              styles.filterButton,
              filterType === type && { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text
              style={{
                color: filterType === type ? '#fff' : theme.colors.sub_text,
                fontSize: 12,
                textTransform: 'capitalize',
              }}
            >
              {type === 'all' ? 'All'
                : type === 'company' ? "Market"
                  : type === 'application' ? 'My Approvals'
                    : 'Candidates'
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredNotifications.length === 0 ? (
        <Text style={[styles.noNotifications, { color: theme.colors.text }]}>
          No notifications
        </Text>
      ) : (
        <FlatList
          ref={listRef}
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item, index) => `${index}`}
          getItemLayout={
            (data, index) => ({
              length: 80,
              offset: 80 * index,
              index,
            })
          }
          key={layoutMode}
          numColumns={layoutMode === "grid" ? 2 : 1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  filterRow: {
    flexDirection: 'row', alignContent: 'center', alignItems: 'center',
    justifyContent: 'center', height: 30, gap: 10
  },
  filterButton: {
    borderRadius: 50, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f0f4ff'
  },
  approveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
    borderTopColor: '#cccccc',
    borderRightColor: "#CCCCCC",
    borderBottomColor: "#CCCCCC",
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
    paddingBottom: 30,
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
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 12,
    },
    filterButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      marginHorizontal: 2,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#ccc',
    },
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
