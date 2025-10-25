import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import {
  Avatar,
  Badge,
  Card,
  Text
} from 'react-native-paper';
import { AppContext } from '../context/appContext';
import { AuthContext } from '../context/authProvider';
import { Icons } from '../constants/Icons';
import { useNavigation } from '@react-navigation/native';

export default function VendorCard({ item, loadStock }) {
  const { theme } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);
  const navigation = useNavigation();
  const [isModal, setIsModal] = useState(false);

  const handlePlaceOrder = (vendor) => {
    Alert.alert(
      'Place Order',
      `Order from ${vendor.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Vendor', onPress: () => console.log('Call vendor') },
        { text: 'WhatsApp', onPress: () => console.log('WhatsApp vendor') }
      ]
    );
  };

  const handleVendorPress = () => {
    // if (item && item.email === user.email) {
    //   setIsModal(true);
    //   return;
    // }
    // Alert.alert(
    //   'Vendor Details',
    //   `Name: ${item.name}\nType: ${item.type}\nCategory: ${item.category}\nRating: ${item.rating}\nLocation: ${item.location.area}\n\nWould you like to place an order?`,
    //   [
    //     { text: 'Cancel', style: 'cancel' },
    //     { text: 'View Details', onPress: () => console.log('View vendor details') },
    //     { text: 'Place Order', onPress: () => handlePlaceOrder(item) }
    //   ]
    // );
    console.log(item.id)
    navigation.navigate('VendorInventory', { vendorId: item.id, vendor: item });
  }

  const handleViewStock = () => {
    navigation.navigate('MakertStore', { vendor: item })
  }

  return (
    <TouchableOpacity style={[styles.vendorCard, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]} onPress={handleVendorPress}>
      <Card.Content>
        <View style={styles.vendorHeader}>
          <Avatar.Image
            size={50}
            source={{ uri: item.user_avatar }}
            style={styles.vendorAvatar}
          />
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName}>{item.business_name}</Text>
            <Text style={[styles.vendorType, { color: theme.colors.placeholder }]}>{item.business_type}</Text>
            <View style={styles.ratingContainer}>
              <Icons.Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={[styles.reviewCount, { color: theme.colors.placeholder }]}>({item.review_count})</Text>
            </View>
          </View>
          <Badge style={[styles.onlineBadge, { backgroundColor: theme.colors.success }]}>
            {item.is_online ? 'Online' : 'Offline'}
          </Badge>
        </View>

        <Text numberOfLines={2} ellipsizeMode={'tail'} style={[styles.vendorDescription, { color: theme.colors.text }]}>
          {item.description}
        </Text>

        {/* view my Today's display */}
        <View style={{ backgroundColor: theme.colors.indicator, borderRadius: 10, alignItems: 'center', paddingVertical: 10, marginBottom: 5 }}>
          <TouchableOpacity onPress={handleViewStock}>
            <Text style={{ color: '#ccc', fontSize: 15, textAlign: 'center' }}>View Today's stock</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.vendorDetails}>
          <View style={styles.detailItem}>
            <Icons.Ionicons name="location-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>{item.address}</Text>
          </View>
          <View style={styles.detailText}>
            <Icons.Ionicons name="time-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>
              {item.working_hours.monday || 'Closed today'}
            </Text>
          </View>
          <View style={styles.detailText}>
            <Icons.MaterialIcons name="delivery-dining" size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, { color: theme.colors.placeholder }]}>{item.delivery_radius}km delivery</Text>
          </View>
        </View>
      </Card.Content>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  vendorCard: {
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vendorAvatar: {
    marginRight: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vendorType: {
    fontSize: 14,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  onlineBadge: {
    color: 'white',
    fontSize: 10,
  },
  vendorDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  vendorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
})