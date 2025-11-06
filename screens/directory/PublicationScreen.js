import { useEffect, useState, useRef, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  Linking,
  StatusBar,
  RefreshControl
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { Icons } from "../../constants/Icons";
import CustomLoader from '../../components/customLoader';
import { AppContext } from "../../context/appContext";
import { fetchPromotions, fetchPublications } from "../../service/getApi";

const CompanyCard = ({ item, navigation, theme, contentType }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const data = contentType === "Promotions" ? item.promotions : item.publications;

  useEffect(() => {
    if (data?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data?.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [data?.length]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.card }]}
      onPress={() =>
        navigation.navigate("BusinessArticlesScreen", { company: item, contentType })
      }
      activeOpacity={0.8}
      accessibilityLabel={`View ${contentType} for ${item.company_name}`}
    >
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.logo }}
          style={styles.companyLogo}
          resizeMode="contain"
        />
        <View style={styles.companyInfo}>
          <Text style={[styles.companyName, { color: theme.colors.text }]} numberOfLines={1} ellipsizeMode="tail">
            {item.company_name}
          </Text>
          <Text style={[styles.companyIndustry, { color: theme.colors.sub_text }]}>
            {item.company_type}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={({ item }) => (
          <ImageBackground
            source={{ uri: contentType === "Promotions" ? item.banner : item.featured_image }}
            style={styles.highlightBackground}
            imageStyle={styles.highlightImage}
            key={item._id}
          >
            <View style={[styles.highlightOverlay, { backgroundColor: theme.colors.highlight }]}>
              <Text style={[styles.highlightTeaser, { color: "#CCC" }]}>{item.teaser_message}</Text>
              <Text style={[styles.highlightDate, { color: "#CCC" }]}>
                {contentType === "Promotions"
                  ? `Valid until ${new Date(item.validUntil).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}`
                  : new Date(item.publish_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
              </Text>
            </View>
          </ImageBackground>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollToIndexFailed={() => { }}
      />
    </TouchableOpacity>
  );
};

const PublicationScreen = () => {
  const { isDarkMode, theme, isOnline } = useContext(AppContext);
  const navigation = useNavigation();
  const route = useRoute();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const contentType = route.params?.contentType || "Publications";
  const [isConnected, setIsConnected] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [publications, setPublications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check network status on mount
  useEffect(() => {
    const checkNetwork = async () => {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Alert.alert(
          "No Internet Connection",
          "Please turn on Wi-Fi or mobile data to view content.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    };

    checkNetwork();

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Fetch data based on contentType
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (contentType === "Promotions") {
        const fetchedPromotions = await fetchPromotions((newPromotions) => {
          setPromotions(newPromotions || []); // Update state with each page
        });
        setPromotions(fetchedPromotions.promotions || []);
      } else {
        const fetchedPublications = await fetchPublications((newPublications) => {
          setPublications(newPublications || []); // Update state with each page
        });
        setPublications(fetchedPublications.publications || []);
      }
    } catch (err) {
      setError(`Failed to load ${contentType.toLowerCase()}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isConnected) return;
    loadData();
  }, [contentType, isConnected]);

  // Retry connection or data fetch
  const retryConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
    if (!state.isConnected) {
      Alert.alert(
        "No Internet Connection",
        "Please turn on Wi-Fi or mobile data to view content.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    setIsLoading(true);
    setError(null);
    loadData();
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (contentType === "Promotions") {
        const companyPromotions = await fetchPromotions();
        setPromotions(companyPromotions.promotions);
      } else {
        const companyPublications = await fetchPublications();
        setPublications(companyPublications.publications);
      }
    } catch (err) {
      console.log("Refresh Error:", err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Move useCallback above early returns
  const onRefresh = useCallback(() => {
    if (isOnline) {
      handleRefresh();
    } else {
      Alert.alert(
        "Online Mode is Disabled",
        "Please turn on Wi-Fi or mobile data to get content.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Ok", style: "ok" },
        ]
      );
    }
  }, [isOnline]);

  // Select data based on contentType
  const data = contentType === "Promotions" ? promotions : publications;
  const filteredCompanies = Array.isArray(data)
    ? data.filter(
      (company) =>
        company.company_name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        searchQuery === ""
    )
    : [];

  if (!isConnected) {
    return (
      <View style={[styles.noConnectionContainer, { backgroundColor: theme.colors.card }]}>
        <Icons.MaterialIcons
          name="signal-wifi-off"
          size={80}
          color="#CCC"
          style={styles.noConnectionIcon}
        />

        <Text style={[styles.noConnectionText, { color: theme.colors.text }]}>
          No Internet Connection
        </Text>

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={retryConnection}
        >
          <Text style={[styles.retryButtonText, { color: "#CCC" }]}>
            Turn On Wi-Fi or Data
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.noConnectionContainer, { backgroundColor: theme.colors.background }]}>
        <CustomLoader />
        <Text style={[styles.noConnectionText, { color: theme.colors.text }]}>
          Loading {contentType.toLowerCase()}...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.noConnectionContainer, { backgroundColor: theme.colors.background }]}>
        <Icons.MaterialIcons
          name="error-outline"
          size={80}
          color={theme.colors.text}
          style={styles.noConnectionIcon}
        />
        <Text style={[styles.noConnectionText, { color: theme.colors.text }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={retryConnection}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.text }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={{ left: 10 }} onPress={() => navigation.goBack()}>
          <Icons.Ionicons
            name="arrow-back-outline"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "700", left: "13%", color: theme.colors.text }}>
          {contentType === "Promotions" ? "Promotions" : "Publications"}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchWrapper, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border }]}>
          <Icons.Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.text}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Filter by business..."
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholderTextColor={theme.colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
            numberOfLines={1}
          />
        </View>
      </View>

      <FlatList
        data={filteredCompanies}
        renderItem={({ item }) => (
          <CompanyCard
            item={item}
            navigation={navigation}
            theme={theme}
            contentType={contentType}
          />
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={[styles.listContainer, { backgroundColor: theme.colors.background }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No {contentType.toLowerCase()} available.
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.card}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 5,
    paddingBottom: 20,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "400",
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 10,
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 50,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  companyLogo: {
    width: 50,
    height: 50,
    objectFit: "cover",
    borderRadius: 8,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  companyIndustry: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  highlightBackground: {
    width: 300,
    height: 120,
  },
  highlightImage: {
    borderRadius: 8,
  },
  highlightOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 12,
  },
  highlightTeaser: {
    fontSize: 17,
    fontWeight: "700",
  },
  highlightDate: {
    fontSize: 12,
    fontWeight: "400",
    textAlign: "right",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 20,
  },
  noConnectionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noConnectionIcon: {
    marginBottom: 20,
  },
  noConnectionText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PublicationScreen;