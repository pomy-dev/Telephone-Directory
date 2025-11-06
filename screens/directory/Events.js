import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';
import { AppContext } from '../../context/appContext';
import { mockEvents, allIndustries } from '../../utils/mockData';

export default function EventsScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const industries = ['all', ...allIndustries];

  const handleFilterChange = (industry) => {
    setSelectedFilter(industry);
    if (industry === 'all') {
      setFilteredEvents(mockEvents);
    } else {
      setFilteredEvents(mockEvents.filter(event => event.industry === industry));
    }
  };

  const handleJoinEvent = (event) => {
    if (event.joinLink) {
      Linking.openURL(`mailto:${event.joinLink}`)
    } else {
      Alert.alert("No Join Link", "The link to join or register for the event was not set.")
    }
  };

  const handleViewImage = (item) => {
    if (item.imageUrl) {
      setSelectedImage(item.imageUrl);
      setShowImageModal(true);
    } else {
      setSelectedImage(Images.noImage);
      setShowImageModal(true);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'conference': return '#2563eb';
      case 'workshop': return '#f97316';
      case 'networking': return '#10b981';
      case 'seminar': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text, textAlign: 'center' }]}>Business Events</Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.sub_text }]}>Discover opportunities to learn and network</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
        {industries.map((industry) => (
          <TouchableOpacity
            key={industry}
            style={[
              styles.filterChip,
              selectedFilter === industry && styles.filterChipActive
            ]}
            onPress={() => handleFilterChange(industry)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === industry && styles.filterTextActive
            ]}>
              {industry === 'all' ? 'All Industries' : industry}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        {filteredEvents.length > 0 ?
          filteredEvents.map((event) => (
            <TouchableOpacity key={event.id}
              onPress={() => handleViewImage(event)}
              style={[styles.eventCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.eventHeader}>
                <View style={[
                  styles.eventTypeBadge,
                  { backgroundColor: getEventTypeColor(event.type) }
                ]}>
                  <Text style={styles.eventTypeBadgeText}>
                    {event.type.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.industryBadge}>
                  <Text style={styles.industryBadgeText}>{event.industry}</Text>
                </View>
              </View>

              <Text style={[styles.eventTitle, { color: theme.colors.text }]}>{event.title}</Text>

              <Image source={event.imageUrl} style={styles.eventImage} />

              <Text style={[styles.eventDescription, { color: theme.colors.sub_text }]}>{event.description}</Text>

              <View style={styles.eventDetails}>
                <View style={styles.eventDetailRow}>
                  <Icons.MaterialIcons name='event' size={16} color={theme.colors.sub_text} />
                  <Text style={[styles.eventDetailText, { color: theme.colors.sub_text }]}>{formatDate(event.date)}</Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Icons.Feather name='map-pin' size={16} color={theme.colors.sub_text} />
                  <Text style={[styles.eventDetailText, { color: theme.colors.sub_text }]}>{event.location}</Text>
                </View>
              </View>

              <View style={styles.eventFooter}>
                <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.companyName, { color: theme.colors.text }]}>Hosted by {event.company}</Text>
                <TouchableOpacity
                  style={[styles.joinButton, { backgroundColor: theme.colors.indicator }]}
                  onPress={() => handleJoinEvent(event)}
                >
                  <Text style={styles.joinButtonText}>Join Event</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )) :
          <View style={styles.emptyStateContainer}>
            <Image
              source={Images.noImage}
              style={styles.emptyStateImage}
              resizeMode="cover"
            />
            <Text style={styles.emptyStateText}>
              No events available in this category.
            </Text>
          </View>
        }
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowImageModal(false)}
      >
        <SafeAreaView style={styles.imageModalContainer}>
          <Image
            source={selectedImage}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.imageModalCloseButton}
            onPress={() => setShowImageModal(false)}
          >
            <Icons.FontAwesome name="remove" size={24} color="#ffffff" />
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    marginLeft: '16%',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  filterContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  filterChip: {
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 32,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  eventsList: {
    height: '100%',
    paddingHorizontal: 10,
  },
  eventCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTypeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  industryBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  industryBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  eventImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    borderRadius: 10
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '400',
  },
  joinButton: {
    paddingHorizontal: '30%',
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start', // Not centered vertically
    marginTop: 30, // Space beneath header
    width: '100%',
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
});