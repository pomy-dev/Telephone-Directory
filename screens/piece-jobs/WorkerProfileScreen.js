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
  Modal,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import SecondaryNav from "../../components/SecondaryNav";
import { AppContext } from "../../context/appContext";
import { AuthContext } from "../../context/authProvider";
import { Icons } from "../../constants/Icons";
import Carousel from "react-native-reanimated-carousel";
import {
  logUserActivity,
  getWorkerProfileClient,
} from "../../service/Supabase-Fuctions";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
// Responsive grid: 1 column per ~120px, min 2, max 5
const NUM_COLS = Math.min(5, Math.max(2, Math.floor(width / 120)));
const GRID_PADDING = 12; // card inner padding
const GRID_GAP = 2; // gap between thumbs
const THUMB_SIZE = Math.min(
  100, // max height cap
  Math.floor((width - GRID_PADDING * 2 - GRID_GAP * (NUM_COLS - 1)) / NUM_COLS),
);

const WorkerProfileScreen = ({ route, navigation }) => {
  const { user, isWorker } = React.useContext(AuthContext);
  const workerIdFromRoute =
    route.params?.workerId || route.params?.workerID || [];
  const [worker, setWorker] = useState(route.params?.worker || null);
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [loading, setLoading] = useState(!route.params?.worker);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const insets = useSafeAreaInsets();

  React.useEffect(() => { }, []);

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
          console.log("Error fetching worker profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        if (user) {
          await logUserActivity({
            userId: user.uid,
            itemId: worker.id,
            action: "click",
            itemType: "pomy_workers",
          });
        }
      }
    };
    fetchWorkerData();
  }, [workerIdFromRoute]);

  if (loading) {
    return (
      <View
        style={[
          styles.centerState,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!worker) {
    return (
      <View
        style={[
          styles.centerState,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Icons.Ionicons
          name="person-circle-outline"
          size={56}
          color={theme.colors.sub_text}
        />
        <Text style={[styles.emptyText, { color: theme.colors.sub_text }]}>
          Profile not found
        </Text>
      </View>
    );
  }

  const locationString =
    typeof worker.location === "object"
      ? worker.location?.address
      : worker.location || "Eswatini";

  const handleEmail = () =>
    Linking.openURL(`mailto:${worker.contact_options?.email}`);

  const handleWhatsApp = () =>
    Linking.openURL(
      `whatsapp://send?phone=${worker.contact_options?.whatsapp}`,
    );

  const handleSocial = (platform) =>
    Linking.openURL(worker[platform] || "https://facebook.com");

  const handleCall = () => Linking.openURL(`tel:${worker.phone}`);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  const hasImages =
    worker.experience_images && worker.experience_images.length > 0;
  const hasProfile = worker.worker_pp && worker.worker_pp.length > 0;
  const hasSkills = worker.skills && worker.skills.length > 0;
  const hasDocs = worker.documents && worker.documents.length > 0;

  const SOCIAL_CHANNELS = [
    {
      key: "whatsapp",
      icon: "logo-whatsapp",
      color: "#25D366",
      bg: isDarkMode ? "#052e16" : "#dcfce7",
      handler: handleWhatsApp,
    },
    {
      key: "email",
      icon: "mail",
      color: "#EA4335",
      bg: isDarkMode ? "#450a0a" : "#fee2e2",
      handler: handleEmail,
    },
    {
      key: "facebook",
      icon: "logo-facebook",
      color: "#1877F2",
      bg: isDarkMode ? "#172554" : "#dbeafe",
      handler: () => handleSocial("facebook"),
    },
    {
      key: "instagram",
      icon: "logo-instagram",
      color: "#E4405F",
      bg: isDarkMode ? "#4a044e" : "#fce7f3",
      handler: () => handleSocial("instagram"),
    },
  ].filter((s) => worker.contact_options?.[s.key]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      {hasImages ? (
        <View style={styles.heroHeader}>
          <Carousel
            loop={worker.experience_images?.length > 1}
            width={width}
            height={300}
            autoPlay={worker.experience_images.length > 1}
            data={worker.experience_images}
            scrollAnimationDuration={5000}
            onSnapToItem={setCarouselIndex}
            renderItem={({ item, index }) => (
              <TouchableOpacity activeOpacity={0.92} onPress={() => openLightbox(index)}>
                <Image source={{ uri: item.url || item }} style={styles.heroImage} />
              </TouchableOpacity>
            )}
          />
          <SecondaryNav
            title="Freelancer Profile"
            containerStyle={styles.heroNav}
            tintColor="#fff"
          />
          {worker.experience_images.length > 1 && (
            <View style={styles.dotRow}>
              {worker.experience_images?.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === carouselIndex
                          ? theme.colors.primary
                          : "rgba(255,255,255,0.7)",
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        <SecondaryNav title="Freelancer Profile" />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.pagePad}>
          {/* ── IDENTITY CARD ── */}
          {/* <View style={[styles.menuCard, { backgroundColor: theme.colors.card }]}> */}
          <View>
            <View style={styles.heroContent}>
              <View style={styles.avatarContainer}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  {hasProfile ? (
                    <Image
                      source={{
                        uri: worker.worker_pp[0].url || worker.worker_pp[0],
                      }}
                      style={styles.avatarImg}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.avatarInitial,
                        { color: theme.colors.text },
                      ]}
                    >
                      {worker.name?.charAt(0)?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.onlineIndicator,
                    { borderColor: theme.colors.card },
                  ]}
                >
                  <Icons.Ionicons name="ellipse" size={10} color="#10b981" />
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={[styles.workerName, { color: theme.colors.text }]}>
                  {worker.name}
                </Text>
                <View style={styles.locationRow}>
                  <Icons.Ionicons
                    name="location-sharp"
                    size={13}
                    color={theme.colors.indicator}
                  />
                  <Text
                    style={[
                      styles.locationText,
                      { color: theme.colors.sub_text },
                    ]}
                  >
                    {locationString}
                  </Text>
                </View>
                <View style={styles.likesBadge}>
                  <Icons.Ionicons
                    name="thumbs-up"
                    size={13}
                    color={theme.colors.card2}
                  />
                  <Text
                    style={[styles.likesText, { color: theme.colors.sub_text }]}
                  >
                    {worker.likes || 0} likes
                  </Text>
                </View>
              </View>
            </View>

            {SOCIAL_CHANNELS.length > 0 && (
              <>
                <View
                  style={[
                    styles.divider,
                    { backgroundColor: theme.colors.border, marginLeft: 0 },
                  ]}
                />
                <View style={styles.socialRow}>
                  {SOCIAL_CHANNELS?.map((s) => (
                    <TouchableOpacity
                      key={s.key}
                      style={[
                        styles.menuIconContainer,
                        { backgroundColor: s.bg, borderColor: "transparent" },
                      ]}
                      onPress={s.handler}
                      activeOpacity={0.7}
                    >
                      <Icons.Ionicons name={s.icon} size={20} color={s.color} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* ── ABOUT ── */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.sub_text }]}
            >
              Biography
            </Text>
            <View>
              <View style={styles.bioRow}>
                <Text style={[styles.bioText, { color: theme.colors.text }]}>
                  {worker.bio ||
                    "No detailed biography provided. This professional is verified and ready for work."}
                </Text>
              </View>
            </View>
          </View>

          {/* ── SERVICES ── */}
          {hasSkills && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.sub_text }]}
              >
                Services Offered
              </Text>
              <View
                style={[
                  styles.menuCard,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                {worker.skills?.map((skill, index) => (
                  <React.Fragment key={index}>
                    <View style={styles.menuItem}>
                      <View style={styles.menuItemLeft}>
                        <View
                          style={[
                            styles.menuIconContainer,
                            {
                              backgroundColor: theme.colors.card2,
                              borderColor: theme.colors.card2,
                            },
                          ]}
                        >
                          <Icons.Ionicons
                            name="checkmark-circle-outline"
                            size={20}
                            color={"#fff"}
                          />
                        </View>
                        <Text
                          style={[
                            styles.menuItemTitle,
                            { color: theme.colors.text },
                          ]}
                        >
                          {skill}
                        </Text>
                      </View>
                    </View>
                    {index < worker.skills.length - 1 && (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: theme.colors.border },
                        ]}
                      />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}

          {/* ── ASSOCIATED SCHOOL ── */}
          {/* {worker.school && ( */}
          <View style={styles.schoolAssociationSection}>
            <View
              style={[
                styles.schoolAssociationLine,
                { backgroundColor: theme.colors.border },
              ]}
            />

            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                styles.schoolAssociation,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() =>
                navigation.navigate("AssociatedSchool")
              }
            >
              <View style={styles.schoolAssociationLogo}>
                {/* {worker.school.logo ? (
                  <Image
                    source={{ uri: worker.school.logo }}
                    style={styles.schoolAssociationLogoImage}
                  />
                ) : ( */}
                <Text
                  style={[
                    styles.schoolAssociationInitial,
                    { color: theme.colors.text },
                  ]}
                >
                  S {/* {worker.school.name?.charAt(0)?.toUpperCase()} */}
                </Text>
                {/* )} */}
              </View>

              <View style={styles.schoolAssociationInfo}>
                <Text
                  style={[
                    styles.schoolAssociationLabel,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  ASSOCIATED SCHOOL
                </Text>

                <Text
                  style={[
                    styles.schoolAssociationName,
                    { color: theme.colors.text },
                  ]}
                  numberOfLines={1}
                >
                  School Academy {/* {worker.school.name} */}
                </Text>
              </View>

              <Icons.Feather
                name="chevron-right"
                size={18}
                color={theme.colors.sub_text}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.schoolAssociationLine,
                { backgroundColor: theme.colors.border },
              ]}
            />
          </View>
          {/* )} */}

          {/* ── QUALIFICATIONS ── */}
          {hasDocs && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: theme.colors.sub_text }]}
              >
                Qualifications
              </Text>
              <View
                style={[
                  styles.menuCard,
                  { backgroundColor: theme.colors.card },
                ]}
              >
                {worker.documents?.map((doc, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => doc?.url && Linking.openURL(doc.url)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemLeft}>
                        <View
                          style={[
                            styles.menuIconContainer,
                            {
                              backgroundColor: theme.colors.card2,
                              borderColor: theme.colors.card2,
                            },
                          ]}
                        >
                          <Icons.Ionicons
                            name="document-text-outline"
                            size={20}
                            color={theme.colors.text}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.menuItemTitle,
                              { color: theme.colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {doc.name || `Document ${index + 1}`}
                          </Text>
                          <Text
                            style={[
                              styles.docSub,
                              { color: theme.colors.sub_text },
                            ]}
                          >
                            Tap to open
                          </Text>
                        </View>
                      </View>
                      <Icons.Feather
                        name="external-link"
                        size={16}
                        color={theme.colors.sub_text}
                      />
                    </TouchableOpacity>
                    {index < worker.documents.length - 1 && (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: theme.colors.border },
                        ]}
                      />
                    )}
                  </React.Fragment>
                ))}
              </View>
            </View>
          )}

          {/* ── PORTFOLIO ── */}
          {hasImages && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.sub_text },
                  ]}
                >
                  Portfolio
                </Text>
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: theme.colors.card2 },
                  ]}
                >
                  <Text style={[styles.countText, { color: "#fff" }]}>
                    {worker.experience_images.length} photos
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.menuCard,
                  { backgroundColor: theme.colors.card, padding: GRID_PADDING },
                ]}
              >
                <View style={[styles.portfolioGrid, { gap: GRID_GAP }]}>
                  {worker.experience_images?.map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openLightbox(index)}
                      activeOpacity={0.85}
                      style={[
                        styles.portfolioThumbWrap,
                        { width: THUMB_SIZE, height: THUMB_SIZE },
                      ]}
                    >
                      <Image
                        source={{ uri: img?.url || img }}
                        style={styles.portfolioThumb}
                      />
                      {index === 0 && (
                        <View
                          style={[
                            styles.mainBadge,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        >
                          <Text style={styles.mainBadgeText}>MAIN</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ── TRUST NOTICE ── */}
          <View style={styles.section}>
            <View
              style={[
                styles.menuCard,
                {
                  backgroundColor: isDarkMode ? "#052e16" : "#f0fdf4",
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#14532d" : "#bbf7d0",
                },
              ]}
            >
              <View style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      {
                        backgroundColor: isDarkMode ? "#14532d" : "#dcfce7",
                        borderColor: "transparent",
                      },
                    ]}
                  >
                    <Icons.Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#10b981"
                    />
                  </View>
                  <Text
                    style={[
                      styles.trustText,
                      { color: isDarkMode ? "#86efac" : "#166534" },
                    ]}
                  >
                    Always meet in public places and{"\n"}never pay upfront for
                    services.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      {/* ── BOTTOM ACTION BAR ── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 7 : 18,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.smsBtn,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.card2,
            },
          ]}
          onPress={() => Linking.openURL(`sms:${worker.phone}`)}
        >
          <Icons.Ionicons
            name="chatbubble-outline"
            size={22}
            color="#ffff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.callBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleCall}
        >
          <Icons.Ionicons name="call" size={18} color="#fff" />
          <Text style={styles.callBtnText}>Contact Now</Text>
        </TouchableOpacity>
      </View>

      {/* ── LIGHTBOX MODAL ── */}
      <Modal
        visible={lightboxVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.lightboxOverlay}>
          <TouchableOpacity
            style={styles.lightboxClose}
            onPress={() => setLightboxVisible(false)}
          >
            <Icons.Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={styles.lightboxCounter}>
            <Text style={styles.lightboxCounterText}>
              {lightboxIndex + 1} / {worker.experience_images?.length}
            </Text>
          </View>
          <Carousel
            loop={worker.experience_images?.length > 1}
            width={width}
            height={height}
            defaultIndex={lightboxIndex}
            data={worker.experience_images}
            onSnapToItem={(i) => setLightboxIndex(i)}
            renderItem={({ item }) => (
              <View style={styles.lightboxImgWrap}>
                <Image
                  source={{ uri: item?.url || item }}
                  style={styles.lightboxImg}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 15, fontWeight: "600" },

  heroImage: { width, height: 300, resizeMode: "cover" },
  heroHeader: { height: 300, position: "relative", overflow: "hidden" },
  heroNav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  dotRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },

  pagePad: { paddingHorizontal: 16, paddingTop: 16 },

  // schools associate
  schoolAssociationSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
    marginBottom: 4,
    gap: 8,
  },

  schoolAssociationLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },

  schoolAssociation: {
    minWidth: "80%",
    maxWidth: "90%",
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  schoolAssociationLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  schoolAssociationLogoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  schoolAssociationInitial: {
    fontSize: 16,
    fontWeight: "800",
  },

  schoolAssociationInfo: {
    flex: 1,
    justifyContent: "center",
  },

  schoolAssociationLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 1,
  },

  schoolAssociationName: {
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Card — mirrors SettingsScreen menuCard exactly ──
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
      android: { elevation: 1 },
    }),
  },

  // ── Identity ──
  heroContent: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 36 },
  avatarInitial: { fontSize: 26, fontWeight: "800" },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    borderRadius: 10,
    borderWidth: 2,
    padding: 1,
  },
  profileInfo: { flex: 1, marginLeft: 8 },
  workerName: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  locationText: { fontSize: 13, fontWeight: "500" },
  likesBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  likesText: { fontSize: 12, fontWeight: "600" },

  socialRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  // ── Section — mirrors SettingsScreen section ──
  section: { marginTop: 24 },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  // ── Menu row — mirrors SettingsScreen menuItem exactly ──
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  menuItemTitle: { fontSize: 15, fontWeight: "600" },
  skillIndex: { fontSize: 13, fontWeight: "700" },
  docSub: { fontSize: 12, marginTop: 2 },

  // ── Divider — mirrors SettingsScreen divider ──
  divider: { height: 1, marginLeft: 76 },

  bioRow: { paddingHorizontal: 20, paddingVertical: 16 },
  bioText: { fontSize: 14, lineHeight: 22 },

  // ── Count badge — mirrors SettingsScreen countBadge ──
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: "center",
  },
  countText: { fontSize: 13, fontWeight: "700", color: "#3b82f6" },

  // ── Portfolio ──
  portfolioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    // gap is set inline from GRID_GAP so it matches the thumb calculation exactly
  },
  portfolioThumbWrap: {
    borderRadius: 2,
    overflow: "hidden",
    position: "relative",
    // width + height come from THUMB_SIZE inline — no fixed values here
  },
  portfolioThumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  mainBadge: {
    position: "absolute",
    top: 5,
    left: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: { color: "#fff", fontSize: 8, fontWeight: "900" },
  expandOverlay: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 6,
    padding: 3,
  },

  trustText: { flex: 1, fontSize: 13, fontWeight: "500", lineHeight: 19 },

  // ── Bottom bar ──
  bottomBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    gap: 12,
  },

  smsBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    height: 52,
    gap: 8,
  },
  callBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // ── Lightbox ──
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 8,
  },
  lightboxCounter: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 44,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  lightboxCounterText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  lightboxImgWrap: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxImg: { width, height: height * 0.75 },
});

export default WorkerProfileScreen;
