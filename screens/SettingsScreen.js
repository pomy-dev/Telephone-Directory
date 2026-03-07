import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  ImageBackground,
  Platform,
  Switch,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native-paper";
import { Icons } from "../constants/Icons";
import { AppContext } from "../context/appContext";
import { AuthContext } from "../context/authProvider";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Reusable Menu Item Component
const MenuItem = ({ item, theme, darkMode }) => (
  <TouchableOpacity
    onPress={() => Linking.openURL("https://business-faq.vercel.app/")}
    style={styles.menuItem}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View
        style={[styles.menuIconContainer, darkMode && styles.iconContainerDark]}
      >
        <Icons.Ionicons name={item.icon} size={20} color={theme.colors.text} />
      </View>
      <Text
        style={[styles.menuItemTitle, darkMode && { color: theme.colors.text }]}
      >
        {item.title}
      </Text>
    </View>
    <View style={styles.menuItemRight}>
      <Icons.Feather
        name="chevron-right"
        size={20}
        color={theme.colors.sub_text}
      />
    </View>
  </TouchableOpacity>
);

const PreferenceItem = ({
  item,
  theme,
  darkMode,
  isDarkMode,
  isOnline,
  isNotifications,
  onToggleDarkMode,
  onToggleOnline,
  onToggleNotifications,
}) => {
  const isToggle = item.toggle;

  return (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <View
          style={[
            styles.menuIconContainer,
            darkMode && styles.iconContainerDark,
          ]}
        >
          <Icons.Feather
            name={
              isDarkMode
                ? item.icon1
                : isOnline
                  ? item.icon1
                  : isNotifications
                    ? item.icon1
                    : item.icon2
            }
            size={20}
            color={darkMode ? "#e2e8f0" : "#1a1a1a"}
          />
        </View>
        <Text
          style={[
            styles.menuItemTitle,
            darkMode && { color: theme.colors.text },
          ]}
        >
          {item.title}
        </Text>
      </View>

      {isToggle ? (
        <Switch
          value={
            item.title === "Dark Mode"
              ? isDarkMode
              : item.title === "Is Online"
                ? isOnline
                : isNotifications
          }
          onValueChange={(value) =>
            item.title === "Dark Mode"
              ? onToggleDarkMode(value)
              : item.title === "Is Online"
                ? onToggleOnline(value)
                : onToggleNotifications(value)
          }
          trackColor={{ false: "#cbd5e1", true: "#3b82f6" }}
          thumbColor={
            (item.title === "Dark Mode" && isDarkMode) ||
            (item.title === "Is Online" && isOnline) ||
            (item.title === "Notifications" && isNotifications)
              ? "#1e40af"
              : "#f1f5f9"
          }
          ios_backgroundColor="#e2e8f0"
        />
      ) : (
        <Icons.Feather name="chevron-right" size={20} color="#94a3b8" />
      )}
    </View>
  );
};

const preferencesItems = [
  { id: "4", title: "Dark Mode", icon1: "sun", icon2: "moon", toggle: true },
  {
    id: "5",
    title: "Is Online",
    icon1: "wifi",
    icon2: "wifi-off",
    toggle: true,
  },
  {
    id: "6",
    title: "Notifications",
    icon1: "bell",
    icon2: "bell-off",
    toggle: true,
  },
];

const supportItems = [
  { id: "6", title: "Help & Support", icon: "help-circle-outline" },
  { id: "7", title: "Privacy Policy", icon: "shield-outline" },
  { id: "8", title: "Terms of Service", icon: "list-outline" },
];

export default function ProfileScreen() {
  const {
    theme,
    isDarkMode,
    notificationsEnabled,
    isOnline,
    toggleTheme,
    toggleNotifications,
    toggleOnlineMode,
  } = React.useContext(AppContext);
  const { user, logout, updateUserProfile, handleDeleteAccount } =
    React.useContext(AuthContext);
  // State for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [requestDate, setRequestDate] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  // "email" | "password"

  const [modalData, setModalData] = useState({
    currentPassword: "",
    newEmail: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Check for existing timer on load
  React.useEffect(() => {
    const checkTimer = async () => {
      const storedDate = await AsyncStorage.getItem(
        `deletion_timer_${user?.uid}`,
      );
      if (storedDate) setRequestDate(new Date(storedDate));
    };
    checkTimer();
  }, [user]);

  // Calculate days remaining
  const today = new Date();
  const daysDiff = requestDate
    ? Math.floor((today - requestDate) / (1000 * 60 * 60 * 24))
    : 0;
  const canDeleteNow = daysDiff >= 5;
  const daysLeft = 5 - daysDiff;

  const startTimer = async () => {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(`deletion_timer_${user?.uid}`, now);
    setRequestDate(new Date(now));
  };

  const cancelTimer = async () => {
    await AsyncStorage.removeItem(`deletion_timer_${user?.uid}`);
    setRequestDate(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      const isEmailChanged = formData.email !== user.email;
      const isPasswordChanging = !!formData.newPassword;

      // 🔐 Require current password only for email/password change
      if ((isEmailChanged || isPasswordChanging) && !formData.currentPassword) {
        Alert.alert(
          "Password Required",
          "To change your email or password, please enter your current password.",
        );
        setLoading(false);
        return;
      }

      await updateUserProfile({
        name: formData.name,
        newEmail: isEmailChanged ? formData.email : null,
        currentPassword: formData.currentPassword,
        newPassword: isPasswordChanging ? formData.newPassword : null,
      });

      setIsEditing(false);

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));

      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      Alert.alert("Update Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSave = async () => {
    setLoading(true);
    setErrors({});

    try {
      if (modalType === "email") {
        if (!modalData.currentPassword) {
          Alert.alert("Required", "Enter your current password.");
          return;
        }

        await updateUserProfile({
          newEmail: modalData.newEmail,
          currentPassword: modalData.currentPassword,
        });

        setModalVisible(false);
        setModalData({
          currentPassword: "",
          newEmail: "",
          newPassword: "",
          confirmPassword: "",
        });

        Alert.alert("Success", "Email updated successfully.");
      }

      if (modalType === "password") {
        if (!modalData.currentPassword) {
          Alert.alert("Required", "Enter your current password.");
          return;
        }

        if (modalData.newPassword !== modalData.confirmPassword) {
          Alert.alert("Error", "Passwords do not match.");
          return;
        }

        await updateUserProfile({
          newPassword: modalData.newPassword,
          currentPassword: modalData.currentPassword,
        });

        setModalVisible(false);
        setModalData({
          currentPassword: "",
          newEmail: "",
          newPassword: "",
          confirmPassword: "",
        });
        Alert.alert("Success", "Password updated successfully.");
      }
    } catch (err) {
      Alert.alert("Update Failed", err.message);
    } finally {
      setLoading(false);
    }
  };




  // Check for existing timer on load
  React.useEffect(() => {
    const checkTimer = async () => {
      const storedDate = await AsyncStorage.getItem(
        `deletion_timer_${user?.uid}`,
      );
      if (storedDate) setRequestDate(new Date(storedDate));
    };
    checkTimer();
  }, [user]);

  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Profile text */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Profile
        </Text>

        {/* Logout Button */}
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Icons.AntDesign name="logout" size={20} color="#ef4444" />
          <Text style={[styles.logoutText, { color: "#ef4444" }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero Profile Card with Gradient */}
      {!isEditing ? (
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1506784983877-45594f17c721?w=800&q=80",
          }}
          style={styles.heroCard}
          imageStyle={{ borderRadius: 20, opacity: 0.15 }}
        >
          <LinearGradient
            colors={[theme.colors.background, "rgba(250, 210, 247, 0.9)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Icons.Ionicons name="person" size={48} color="#fff" />
              </View>
              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: theme.colors.text }]}>
                {user.displayName}
              </Text>
              <Text style={[styles.email, { color: theme.colors.sub_text }]}>
                {user.email}
              </Text>
              {user.uid && (
                <View style={styles.verifiedBadge}>
                  <Icons.Feather
                    name="check-circle"
                    size={16}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.verifiedText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    Verified Account
                  </Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.editButton,
              { backgroundColor: theme.colors.indicator },
            ]}
            activeOpacity={0.8}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Icons.Feather name="edit-2" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </ImageBackground>
      ) : (
        // Edit view (Form)
        <>
          <View style={styles.section}>
            <TextInput
              label="Full Name"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              // mode="outlined"
              style={[styles.editInput, { borderColor: theme.colors.sub_text }]}
              mode="outlined"
              error={!!errors.name}
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="account" />}
            />
            <View style={styles.securityNotice}>
              <Icons.Feather
                name="lock"
                size={14}
                color={theme.colors.sub_text}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.sub_text,
                  marginLeft: 5,
                }}
              >
                • Changing email or password requires your current password
                {"\n"}• Changing name or phone does NOT require password
              </Text>
            </View>

            <View style={{ marginTop: 10 }}>
              {/* CHANGE EMAIL */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.settingActionButton,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => {
                  setModalType("email");
                  setModalVisible(true);
                }}
              >
                <View style={styles.settingActionLeft}>
                  <View
                    style={[
                      styles.settingIconContainer,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Icons.Feather name="mail" size={16} color="#fff" />
                  </View>

                  <Text
                    style={[
                      styles.settingActionText,
                      { color: theme.colors.text },
                    ]}
                  >
                    Change Email
                  </Text>
                </View>

                <Icons.Feather
                  name="chevron-right"
                  size={18}
                  color={theme.colors.sub_text}
                />
              </TouchableOpacity>

              {/* CHANGE PASSWORD */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.settingActionButton,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() => {
                  setModalType("password");
                  setModalVisible(true);
                }}
              >
                <View style={styles.settingActionLeft}>
                  <View
                    style={[
                      styles.settingIconContainer,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  >
                    <Icons.Feather name="lock" size={16} color="#fff" />
                  </View>

                  <Text
                    style={[
                      styles.settingActionText,
                      { color: theme.colors.text },
                    ]}
                  >
                    Change Password
                  </Text>
                </View>

                <Icons.Feather
                  name="chevron-right"
                  size={18}
                  color={theme.colors.sub_text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Preferences
          </Text>
          <View
            style={[styles.menuCard, { backgroundColor: theme.colors.card }]}
          >
            {preferencesItems.map((item, index) => (
              <View key={item.id}>
                <PreferenceItem
                  item={item}
                  theme={theme}
                  darkMode={isDarkMode}
                  isDarkMode={item.title === "Dark Mode" && isDarkMode}
                  isOnline={item.title === "Is Online" && isOnline}
                  isNotifications={
                    item.title === "Notifications" && notificationsEnabled
                  }
                  onToggleDarkMode={toggleTheme}
                  onToggleOnline={toggleOnlineMode}
                  onToggleNotifications={toggleNotifications}
                />
                {index < preferencesItems.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { marginBottom: 60 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Support
          </Text>
          <View
            style={[styles.menuCard, { backgroundColor: theme.colors.card }]}
          >
            {supportItems.map((item, index) => (
              <View key={item.id}>
                <MenuItem item={item} theme={theme} darkMode={isDarkMode} />
                {index < supportItems.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
          <>
            {/* Divider before the Danger Zone */}
            <View style={styles.divider} />

            {/* The Trigger Button */}
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(true)}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View
                  style={[
                    styles.menuIconContainer,
                    isDarkMode && styles.iconContainerDark,
                  ]}
                >
                  <Icons.Ionicons
                    name={requestDate ? "time-outline" : "trash-outline"}
                    size={20}
                    color={requestDate ? "#FF9500" : "#FF3B30"}
                  />
                </View>
                <Text
                  style={[
                    styles.menuItemTitle,
                    {
                      color: requestDate ? "#FF9500" : "#FF3B30",
                      fontWeight: "600",
                    },
                  ]}
                >
                  {requestDate ? "View Deletion Status" : "Delete Account"}
                </Text>
              </View>
              <Icons.Feather
                name="chevron-right"
                size={20}
                color={theme.colors.text}
                style={{ opacity: 0.3 }}
              />
            </TouchableOpacity>
          </>
        </View>

        <Text
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: theme.colors.sub_text,
            marginBottom: 60,
            marginTop: 10,
            alignSelf: "center",
          }}
        >
          Version 1.0.0
        </Text>
      </ScrollView>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 15 }}>
              <Icons.Ionicons
                name="warning-outline"
                size={48}
                color="#FF3B30"
              />
              <Text
                style={[
                  styles.modalTitle,
                  { color: theme.colors.text, marginTop: 10, marginBottom: 0 },
                ]}
              >
                Delete Account
              </Text>
            </View>

            {/* STEP 1 — No deletion requested yet */}
            {!requestDate && (
              <>
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 16,
                    fontWeight: "700",
                    marginBottom: 10,
                  }}
                >
                  What happens if you delete?
                </Text>

                <View style={{ marginBottom: 20 }}>
                  {[
                    "All your posted gigs will be removed.",
                    "Your worker profile & applications will vanish.",
                    "This action is permanent and cannot be undone.",
                  ].map((text, i) => (
                    <View
                      key={i}
                      style={{
                        flexDirection: "row",
                        marginBottom: 5,
                        paddingRight: 10,
                      }}
                    >
                      <Icons.Entypo
                        name="dot-single"
                        size={20}
                        color={theme.colors.text}
                      />
                      <Text
                        style={{
                          color: theme.colors.text,
                          opacity: 0.8,
                          fontSize: 14,
                        }}
                      >
                        {text}
                      </Text>
                    </View>
                  ))}
                </View>

                <View
                  style={{
                    backgroundColor: isDarkMode ? "#332100" : "#FFF9E6",
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      color: isDarkMode ? "#FFD60A" : "#856404",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    🛡️ Security Policy: A 5-day cooling-off period is required
                    before permanent deletion.
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={startTimer}
                  style={[styles.saveBtn, { backgroundColor: "#FF9500" }]}
                >
                  <Text style={styles.saveBtnText}>
                    Begin 5-Day Wait Period
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2 — Timer Running */}
            {requestDate && canDeleteNow && (
              <>
                <View style={{ alignItems: "center", marginVertical: 20 }}>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    Day {daysDiff + 1} of 5
                  </Text>

                  <View
                    style={{
                      width: "100%",
                      height: 8,
                      backgroundColor: theme.colors.border,
                      borderRadius: 4,
                      marginTop: 15,
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(((daysDiff + 1) / 5) * 100, 100)}%`,
                        height: 8,
                        backgroundColor: "#FF9500",
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>

                <Text
                  style={{
                    color: theme.colors.text,
                    textAlign: "center",
                    marginBottom: 20,
                    opacity: 0.8,
                  }}
                >
                  Your account is scheduled for deletion. Return in {daysLeft}{" "}
                  days to finalize deletion.
                </Text>
              </>
            )}

            {/* STEP 3 — Timer Finished */}
            {requestDate && canDeleteNow && (
              <>
                <Text
                  style={{
                    color: theme.colors.text,
                    textAlign: "center",
                    marginBottom: 15,
                    fontWeight: "700",
                  }}
                >
                  Final confirmation required
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                      borderWidth: 1,
                      color: theme.colors.text,
                    },
                  ]}
                  placeholder="Enter your current password"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                />

                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await handleDeleteAccount(deletePassword);
                      setDeletePassword("");
                      setDeleteModalVisible(false);

                      Alert.alert("Deleted", "Your account has been removed.");
                    } catch (err) {
                      Alert.alert(
                        "Error",
                        "Could not delete account. Check your password.",
                      );
                    }
                  }}
                  style={[styles.saveBtn, { backgroundColor: "#FF3B30" }]}
                >
                  <Text style={styles.saveBtnText}>
                    Permanently Delete Account
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setDeleteModalVisible(false)}
              style={{ marginTop: 20, padding: 10 }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  textAlign: "center",
                  opacity: 0.5,
                }}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.colors.card },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {modalType === "email" ? "Change Email" : "Change Password"}
            </Text>

            {/* EMAIL MODAL */}
            {modalType === "email" && (
              <>
                {/* CURRENT EMAIL (READ ONLY) */}
                <TextInput
                  label="Current Email"
                  value={user?.email || ""}
                  mode="outlined"
                  editable={false}
                  style={[
                    styles.editInput,
                    { borderColor: theme.colors.sub_text, opacity: 0.8 },
                  ]}
                  theme={{ roundness: 12 }}
                  left={<TextInput.Icon icon="email-outline" />}
                />

                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.sub_text,
                    marginBottom: 10,
                    marginLeft: 4,
                  }}
                >
                  This is your current registered email.
                </Text>

                <TextInput
                  label="New Email"
                  value={modalData.newEmail}
                  onChangeText={(t) =>
                    setModalData({ ...modalData, newEmail: t })
                  }
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[
                    styles.editInput,
                    { borderColor: theme.colors.sub_text },
                  ]}
                  theme={{ roundness: 12 }}
                  left={<TextInput.Icon icon="email" />}
                />

                <TextInput
                  label="Current Password"
                  secureTextEntry
                  value={modalData.currentPassword}
                  onChangeText={(t) =>
                    setModalData({
                      ...modalData,
                      currentPassword: t,
                    })
                  }
                  mode="outlined"
                  style={[
                    styles.editInput,
                    { borderColor: theme.colors.sub_text },
                  ]}
                  theme={{ roundness: 12 }}
                  left={<TextInput.Icon icon="lock" />}
                />
              </>
            )}

            {/* PASSWORD MODAL */}
            {modalType === "password" && (
              <>
                <TextInput
                  label="Current Password"
                  secureTextEntry
                  value={modalData.currentPassword}
                  onChangeText={(t) =>
                    setModalData({
                      ...modalData,
                      currentPassword: t,
                    })
                  }
                  mode="outlined"
                  style={[
                    styles.editInput,
                    { borderColor: theme.colors.sub_text },
                  ]}
                  theme={{ roundness: 12 }}
                  left={<TextInput.Icon icon="lock" />}
                />

                <TextInput
                  label="New Password"
                  secureTextEntry
                  value={modalData.newPassword}
                  onChangeText={(t) =>
                    setModalData({
                      ...modalData,
                      newPassword: t,
                    })
                  }
                  mode="outlined"
                  style={[
                    styles.editInput,
                    { borderColor: theme.colors.sub_text },
                  ]}
                  theme={{ roundness: 12 }}
                  left={<TextInput.Icon icon="lock" />}
                />

                <TextInput
                  label="Confirm New Password"
                  secureTextEntry
                  value={modalData.confirmPassword}
                  onChangeText={(t) =>
                    setModalData({
                      ...modalData,
                      confirmPassword: t,
                    })
                  }
                  mode="outlined"
                  style={[
                    styles.editInput,
                    { borderColor: theme.colors.sub_text },
                  ]}
                  theme={{ roundness: 12 }}
                  left={<TextInput.Icon icon="lock-check" />}
                />
              </>
            )}

            {/* UPDATE BUTTON */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: theme.colors.primary,
                  marginTop: 20,
                },
              ]}
              onPress={handleModalSave}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Update</Text>
              )}
            </TouchableOpacity>

            {/* CANCEL BUTTON */}
            <TouchableOpacity
              style={{
                marginTop: 12,
                paddingVertical: 10,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: theme.colors.sub_text,
                  fontWeight: "600",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: "200",
    letterSpacing: -0.5,
  },
  settingsBtn: {
    padding: 8,
  },
  heroCard: {
    marginBottom: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 84,
    height: 84,
    backgroundColor: "#1e293b",
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 8,
    right: 4,
    width: 16,
    height: 16,
    backgroundColor: "#10b981",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: "600",
  },
  editButton: {
    position: "absolute",
    bottom: 10,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    gap: 6,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: "center",
  },
  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#3b82f6",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 76, // Align with title
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    gap: 10,
  },
  approvalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#f5f2feff",
    gap: 10,
  },
  containerDark: {
    backgroundColor: "#0f172a",
  },
  iconContainerDark: {
    backgroundColor: "#334155",
    borderColor: "#475569",
  },

  // Update section title in dark mode
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  //
  //5555555555555555555555555555555
  editInput: {
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  //modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalContainer: {
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },

  settingActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },

  settingActionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  settingIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  settingActionText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
