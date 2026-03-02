import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "../context/appContext";
import { AuthContext } from "../context/authProvider";
import {
  getPersonalizedRecommendations,
  logUserActivity,
} from "../service/Supabase-Fuctions";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.72;

const AdCard = ({ ad, onPress, onView, theme }) => {
  const viewedRef = useRef(false);

  useEffect(() => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      onView(ad.item_id);
    }
  }, []);

  return (
    <TouchableOpacity
      style={[
        styles.adCard,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.dark ? "#334155" : "#e2e8f0",
        },
      ]}
      onPress={() => onPress(ad)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {/* SMART IMAGE/TEXT LOGIC */}
        {ad.imageUrl ? (
          <Image source={{ uri: ad.imageUrl }} style={styles.adImage} />
        ) : (
          <View
            style={[
              styles.noImageContainer,
              { backgroundColor: theme.colors.highlight },
            ]}
          >
            <Text
              style={[styles.noImageText, { color: theme.colors.text }]}
              numberOfLines={6}
            >
              {ad.description}
            </Text>
          </View>
        )}

        <View style={styles.typeTag}>
          <Text style={styles.typeText}>
            {ad.item_type.replace("pomy_", "").replace("_", " ").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.adContent}>
        <Text
          style={[styles.adTitle, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {ad.title}
        </Text>

        <Text
          style={[styles.adDescription, { color: theme.colors.sub_text }]}
          numberOfLines={2}
        >
          {ad.description}
        </Text>

        <View style={styles.cardFooter}>
          <View>
          {ad.price ? (<>
            <Text style={[styles.priceLabel, { color: theme.colors.sub_text }]}>
              Starting from
            </Text>
            <Text style={[styles.priceText, { color: theme.colors.text }]}>
              {ad.price ? `E${ad.price}` : "Quote"}
            </Text>
          </>) : (<>
              <Text  style={[styles.priceText, { color: theme.colors.text }]}>
            </Text>
          </>)}
          </View>
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const PersonalizedAdsSection = () => {
  const navigation = useNavigation();
  const { theme } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [personalizedAds, setPersonalizedAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getRag();
    }
  }, [user]);

  const getRag = async () => {
    setLoading(true);
    try {
      const result = await getPersonalizedRecommendations(user.uid);
      if (result.success) {
        const formatted = result.data.map((item) => ({
          item_id: item.item_id,
          item_type: item.item_type,
          title: item.real_title,
          imageUrl: item.real_image,
          description: item.real_description,
          price: item.price,
        }));
        setPersonalizedAds(formatted);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdClick = (ad) => {
    logUserActivity(user.uid, ad.item_id, ad.item_type);

    if (ad.item_type === "pomy_gigs") {
      const jobPayload = {
        id: ad.item_id,
        job_title: ad.title,
        job_description: ad.description,
        job_price: ad.price,
        images: ad.imageUrl ? [ad.imageUrl] : [],
        category: "Recommended",
      };
      navigation.navigate("JobDetailScreen", {
        job: jobPayload,
        from: "recommendation",
      });
    } else if (ad.item_type === "pomy_workers") {
      navigation.navigate("WorkerProfileScreen", { workerID: ad.item_id });
    } else if (ad.item_type === "pomy_forhire_transport") {
      const vehiclePayload = {
        id: ad.item_id,
        vehicle_make: ad.title?.split(" ")[0] || "Vehicle", // Basic parsing
        vehicle_model: ad.title || "Details",
        description: ad.description,
        price: ad.price,
        vehicle_images: ad.imageUrl ? [{ url: ad.imageUrl }] : [],
        // Fallback owner info to prevent email/phone crashes
        owner_info: {
          name: "Loading...",
          email: "",
          phone: "",
        },
      };
      navigation.navigate("TransportationDetailsScreen", {
        vehicle: vehiclePayload,
        from: "recommendation",
      });
    }
  };

  if (loading)
    return (
      <ActivityIndicator style={{ margin: 20 }} color={theme.colors.primary} />
    );
  if (personalizedAds.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Recommended For You
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {personalizedAds.map((ad, index) => (
          <AdCard
            key={`${ad.item_id}-${index}`}
            ad={ad}
            theme={theme}
            onPress={handleAdClick}
            onView={(id) => {}}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  adCard: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  imageContainer: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  adImage: {
    width: "100%",
    height: "100%",
  },
  // New styles for the text-only card variant
  noImageContainer: {
    width: "100%",
    height: "100%",
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "500",
  },
  typeTag: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  typeText: {
    color: "#1e293b",
    fontSize: 9,
    fontWeight: "800",
  },
  adContent: {
    padding: 12,
  },
  adTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
    height: 32,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "800",
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PersonalizedAdsSection;
