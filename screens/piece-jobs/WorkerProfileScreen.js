import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  Share,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import SecondaryNav from "../../components/SecondaryNav";
import { AppContext } from "../../context/appContext";
import { AuthContext } from "../../context/authProvider";
import { Icons } from "../../constants/Icons";
import {
  logUserActivity,
  getWorkerProfileClient,
} from "../../service/Supabase-Fuctions";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const WorkerProfileScreen = ({ route }) => {
  const { user, isWorker } = React.useContext(AuthContext);
  const workerIdFromRoute =
    route.params?.workerId || route.params?.workerID || [];
  const [worker, setWorker] = useState(route.params?.worker || null);
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [loading, setLoading] = useState(!route.params?.worker);

  React.useEffect(() => {}, []);

  React.useEffect(() => {
    const fetchWorkerData = async () => {
      if (!worker && workerIdFromRoute) {
        setLoading(true);
        try {
          const response = await getWorkerProfileClient(workerIdFromRoute);

          if (response && response.success && response.data) {
            setWorker(response.data);
          } else if (response && !response.data) {
            setWorker(null);
          }
        } catch (error) {
          console.log("Error fetching worker profile isues:", error);
        } finally {
          setLoading(false);
        }
      } else {
        if (user) {
          logUserActivity(user.uid, worker.id, "pomy_workers");
        }
      }
    };

    fetchWorkerData();
  }, [workerIdFromRoute]);

  // 3. Handle Loading State
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: "center",
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // 4. Handle Not Found State
  if (!worker) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: theme.colors.text }}>
          Worker profile not found.
        </Text>
      </View>
    );
  }

  // --- DATA FIXES ---
  const locationString =
    typeof worker.location === "object"
      ? worker.location?.address
      : worker.location || "Eswatini";

  // --- CONTACT HANDLERS ---
  const handleEmail = () =>
    Linking.openURL(`mailto:${worker.contact_options?.email}`);

  const handleWhatsApp = () =>
    Linking.openURL(
      `whatsapp://send?phone=${worker.contact_options?.whatsapp}`,
    );

  const handleSocial = (platform) => {
    // Logic to open social media links if they exist in your worker object
    const url = worker[platform] || "https://facebook.com";
    Linking.openURL(url);
  };

  const handleCall = () => Linking.openURL(`tel:${worker.phone}`);

  // SMART LOGIC: Only true if images array exists and has content
  const hasImages =
    worker.experience_images && worker.experience_images.length > 0;
  const hasProfile = worker.worker_pp && worker.worker_pp.length > 0;
  const hasSkills = worker.skills && worker.skills.length > 0;

  return (
    <SafeAreaView   style={[styles.container, { backgroundColor: theme.colors.background }]}  edges={['top']}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
      <SecondaryNav title={"Freelancer Profile"} />

      {/* BODY CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
      >
        {/* SMART HERO SECTION: Only renders if images exist */}
        {hasImages && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          >
            {worker.experience_images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img.url || img }}
                style={styles.heroImage}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.profileInfoContainer}>
          {/* NAME & REPUTATION */}
          <View style={styles.mainRow}>
            <View style={styles.avatarSquare}>
              {hasProfile ? (
                <Image
                  source={{
                    uri: worker.worker_pp[0].url || worker.worker_pp[0],
                  }}
                  style={{
                    objectFit: "cover",
                    borderRaduis: 6,
                    height: "100%",
                    width: "100%",
                  }}
                />
              ) : (
                <Text style={styles.avatarText}>{worker.name?.charAt(0)}</Text>
              )}
            </View>
            <View style={styles.nameGroup}>
              <Text style={styles.workerName}>{worker.name}</Text>
              <View style={styles.locationRow}>
                <Icons.Ionicons
                  name="location-sharp"
                  size={14}
                  color="#10b981"
                />
                <Text style={styles.locationText}>{locationString}</Text>
              </View>
            </View>
            <View style={styles.statsBadge}>
              <Icons.Ionicons name="thumbs-up" size={16} color="#10b981" />
              <Text style={styles.statsText}>{worker.likes}</Text>
            </View>
          </View>

          {/* NEW: SOCIAL & CONTACT BUTTONS SECTION */}
          <View style={styles.socialContainer}>
            {worker.contact_options?.whatsapp && (
              <TouchableOpacity
                style={styles.socialIconBtn}
                onPress={handleWhatsApp}
              >
                <Icons.Ionicons
                  name="logo-whatsapp"
                  size={22}
                  color="#25D366"
                />
              </TouchableOpacity>
            )}

            {worker.contact_options?.email && (
              <TouchableOpacity
                style={styles.socialIconBtn}
                onPress={handleEmail}
              >
                <Icons.Ionicons name="mail" size={22} color="#EA4335" />
              </TouchableOpacity>
            )}

            {worker.contact_options?.facebook && (
              <TouchableOpacity
                style={styles.socialIconBtn}
                onPress={() => handleSocial("facebook")}
              >
                <Icons.Ionicons
                  name="logo-facebook"
                  size={22}
                  color="#1877F2"
                />
              </TouchableOpacity>
            )}

            {worker.contact_options?.instagram && (
              <TouchableOpacity
                style={styles.socialIconBtn}
                onPress={() => handleSocial("instagram")}
              >
                <Icons.Ionicons
                  name="logo-instagram"
                  size={22}
                  color="#E4405F"
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* ABOUT / BIO */}
          <Text style={styles.sectionTitle}>About the Professional</Text>
          <Text style={styles.bioText}>
            {worker.bio ||
              "No detailed biography provided. This professional is verified and ready for work."}
          </Text>

          {/* SERVICES LIST */}
          {hasSkills && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
                Services Offered
              </Text>
              <View style={styles.skillsList}>
                {worker.skills.map((skill, index) => (
                  <View key={index} style={styles.skillItem}>
                    <View style={styles.skillNumberContainer}>
                      <Text style={styles.skillNumber}>{index + 1}.</Text>
                    </View>
                    <Text style={styles.skillValue}>{skill}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* TRUST BOX */}
          <View style={styles.trustBox}>
            <Icons.Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.trustText}>
              Always meet in public places and never pay upfront for services.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM ACTION BAR - Moved outside ScrollView, removed absolute positioning */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={() => Linking.openURL(`sms:${worker.phone}`)}
        >
          <Icons.Ionicons name="mail-outline" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Text style={styles.callBtnText}>CONTACT NOW</Text>
          <Icons.Ionicons name="call" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  },
  headerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    zIndex: 10, // Ensure button stays clickable above the absolute title
    padding: 4,
  },
  headerTitleContainer: {
    ...StyleSheet.absoluteFillObject, // Fills the whole header
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Sits behind the back button
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: width,
    height: 200,
    backgroundColor: "#f8fafc",
    resizeMode: "cover",
    objectFit: "cover",
  },
  profileInfoContainer: {
    padding: 20,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarSquare: {
    width: 60,
    height: 60,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  nameGroup: {
    flex: 1,
    marginLeft: 15,
  },
  workerName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    marginLeft: 4,
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dcfce7",
  },
  statsText: {
    marginLeft: 6,
    fontWeight: "900",
    color: "#166534",
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  bioText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 24,
    fontWeight: "450",
  },
  skillsList: {
    gap: 2,
  },
  skillItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  skillNumberContainer: {
    width: 28,
  },
  skillNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10b981",
  },
  skillValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    lineHeight: 22,
  },
  trustBox: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trustText: {
    flex: 1,
    fontSize: 12,
    color: "#64748b",
    lineHeight: 18,
    fontWeight: "500",
  },
  bottomBar: {
    backgroundColor: "#fff",
    flexDirection: "row",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 60,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 12,
  },
  messageBtn: {
    width: 58,
    height: 58,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  callBtn: {
    flex: 1,
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    gap: 10,
  },
  callBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },
  // SOCIAL BUTTONS STYLES
  socialContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  socialIconBtn: {
    width: 45,
    height: 45,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },

  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 25 },
});

export default WorkerProfileScreen;
