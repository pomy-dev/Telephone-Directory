import { Icons } from '../constants/Icons';
import { StyleSheet, Image, Text, View, TouchableOpacity } from 'react-native'

export default function CustomCard({ business, index, theme, onBusinessPress, toggleFavorite, isInFavorites, handleCall, handleEmail, handleWhatsapp, handleLocation }) {
  return (
    <TouchableOpacity
      key={index}
      style={[styles.favoriteCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      activeOpacity={0.8}
      onPress={() => onBusinessPress(business)}
    >
      <View style={styles.favoriteHeader}>
        <View style={styles.businessImageContainer}>
          {business.logo ? (
            <Image
              source={{ uri: business.logo }}
              style={styles.businessImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.businessInitialContainer, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.businessInitial, { color: theme.colors.background }]}>
                {business.company_name.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.businessInfo}>
          <Text
            style={[styles.businessName, { color: theme.colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {business.company_name}
          </Text>
          <Text
            style={[styles.businessCategory, { color: theme.colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {business.company_type}
          </Text>
          <Text
            style={[styles.businessAddress, { color: theme.colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {business.address}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(business);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons.Ionicons
            name={
              isInFavorites(business._id) ? "heart" : "heart-outline"
            }
            size={22}
            color={isInFavorites(business._id) ? theme.colors.primary : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.colors.secondary }]} />

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={(e) => {
            e.stopPropagation();
            handleCall(business.phone, business.name);
          }}
        >
          <Icons.Ionicons name="call-outline" size={18} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.light }]}>Call</Text>
        </TouchableOpacity>

        {business.phone &&
          business.phone.some((p) => p.phone_type === "whatsapp") && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
              onPress={(e) => {
                e.stopPropagation();
                handleWhatsapp(business.phone);
              }}
            >
              <Icons.Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={[styles.actionButtonText, { color: theme.colors.light }]}>WhatsApp</Text>
            </TouchableOpacity>
          )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={(e) => {
            e.stopPropagation();
            handleEmail(business.email, e);
          }}
        >
          <Icons.Ionicons name="mail-outline" size={18} color="#FF9500" />
          <Text style={[styles.actionButtonText, { color: theme.colors.light }]}>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={(e) => {
            e.stopPropagation();
            handleLocation(business.address, e);
          }}
        >
          <Icons.Ionicons name="location-outline" size={18} color="#5856D6" />
          <Text style={[styles.actionButtonText, { color: theme.colors.light }]}>Map</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.viewDetailsButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => onBusinessPress(business)}
      >
        <Text style={[styles.viewDetailsText, { color: "#FFFF" }]}>View Details</Text>
        <Icons.Ionicons name="chevron-forward" size={16} color='#FFFF' />
      </TouchableOpacity>

    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  favoriteCard: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  favoriteHeader: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  businessImageContainer: {
    marginRight: 16,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  businessInitialContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  businessInitial: {
    fontSize: 24,
    fontWeight: "bold",
  },
  businessInfo: {
    flex: 1,
    paddingRight: 30,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  businessAddress: {
    fontSize: 13,
  },
  favoriteButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 4,
    zIndex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  // modalOverlay: {
  //   flex: 1,
  //   backgroundColor: "rgba(0, 0, 0, 0.5)",
  //   justifyContent: "center",
  //   alignItems: "center",
  //   padding: 16,
  // },
})