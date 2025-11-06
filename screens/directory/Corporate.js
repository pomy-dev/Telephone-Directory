import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  StatusBar,
  Image,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import * as MediaLibrary from 'expo-media-library';
import CustomLoader from '../../components/customLoader';
import { Icons } from '../../constants/Icons';
import { Images } from '../../constants/Images';
import { AppContext } from '../../context/appContext';
import { mockTenders, mockVacancies, mockInternships, allIndustries } from '../../utils/mockData';

export default function CorporatePlaceScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const [contentType, setContentType] = useState('Vacancy');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filteredTenders, setFilteredTenders] = useState(mockTenders);
  const [filteredVacancies, setFilteredVacancies] = useState(mockVacancies);
  const [filteredInternships, setFilteredInternships] = useState(mockInternships);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const industries = ['all', ...allIndustries];
  const contentTypes = [
    { label: 'Tenders', value: 'Tender' },
    { label: 'Vacancies', value: 'Vacancy' },
    { label: 'Internships', value: 'Internship' },
  ];

  const handleFilterChange = (industry) => {
    setSelectedFilter(industry);
    if (industry === 'all') {
      setFilteredVacancies(mockVacancies);
      setFilteredTenders(mockTenders);
      setFilteredInternships(mockInternships);
    } else {
      setFilteredVacancies(mockVacancies?.filter((vacancy) => vacancy.industry === industry));
      setFilteredTenders(mockTenders?.filter((tender) => tender.industry === industry));
      setFilteredInternships(mockInternships?.filter((intern) => intern.industry === industry));
    }
  };

  const handleActionButton = (item) => {
    const email = item.type === 'vacancy' ? item.recruitmentEmail : item.type === 'tender' ? item.enquiryEmail : item.internshipEmail;
    const subject = item.type === 'tender' ? `Inquiry for Tender: ${item.title}` : `Application for ${item.title}`;
    if (email) {
      Linking.openURL(`mailto:${email}?subject=${subject}`);
    } else {
      Alert.alert('Error', `No ${item.type === 'tender' ? 'enquiry' : 'application'} email available for this ${item.type}`);
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

  const handleShare = async (item) => {
    try {
      const shareContent = {
        message: `Check out this ${item.type}: ${item.title}\n${item.description}\nIndustry: ${item.industry}\nPosted: ${formatDate(
          item.postedDate
        )}${item.shareLink ? `\nLearn more: ${item.shareLink}` : ''}`,
      };
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', `Failed to share ${item.type}`);
    }
  };

  const handleSaveImage = async (item) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to photos to save the image.');
        return;
      }
      const imageUri = item.imageUrl?.uri || Images.noImage.uri;
      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getContentList = () => {
    if (contentType === 'Tender') return filteredTenders;
    if (contentType === 'Vacancy') return filteredVacancies;
    if (contentType === 'Internship') return filteredInternships;
    return [];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {isLoading && <CustomLoader />}

      {/* Picker at Top with Indicator and Down Arrow */}
      <View style={styles.pickerWrapper}>
        <View style={styles.pickerIndicatorContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Icons.Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.unitPickerContainer, { backgroundColor: theme.colors.card }]}>
          <Picker
            selectedValue={contentType}
            onValueChange={(value) => {
              setIsLoading(true)
              setContentType(value);
              setTimeout(() => {
                setIsLoading(false)
              }, 2000)
            }}
            dropdownIconColor={theme.colors.text}
            style={styles.unitPicker}
            mode="dropdown"
          >
            {contentTypes?.map((type, index) => (
              <Picker.Item key={index} label={type.label} value={type.value} style={{ color: theme.colors.text }} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Centered Header with Back Button */}
      <View style={styles.header}>
        {/* indicator */}
        <View
          style={[
            styles.indicatorDot,
            { backgroundColor: contentType === 'Tender' ? '#33B5FF' : contentType === 'Vacancy' ? '#FF5733' : '#33FF57' },
          ]}
        />
        <Text style={[styles.subtitle, { color: theme.colors.sub_text }]}>{contentType === 'Tender' ? 'Business Opportunities' : contentType === 'Vacancy' ? 'Corporate Work' : 'Experience Growth'}</Text>
      </View>

      {/* Industry Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {industries.map((industry) => (
          <TouchableOpacity
            key={industry}
            style={[
              styles.filterChip,
              selectedFilter === industry && styles.filterChipActive,
            ]}
            onPress={() => handleFilterChange(industry)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === industry && styles.filterTextActive,
              ]}
            >
              {industry === 'all' ? 'All Industries' : industry}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content List */}
      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {getContentList().length > 0 ?
          getContentList().map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemSummary, { backgroundColor: theme.colors.card }]}
              activeOpacity={0.9}
              onPress={() => handleViewImage(item)}
            >
              <View style={styles.imageContainer}>
                {item.imageUrl ? (
                  <>
                    <Image
                      source={item.imageUrl}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['rgba(0, 0, 0, 0.4)', 'transparent']}
                      style={styles.imageOverlay}
                    />
                  </>
                ) : (
                  <Image
                    source={Images.noImage}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.industryBadge}>
                  <Text style={styles.industryBadgeText}>{item.industry}</Text>
                </View>
                <View style={styles.media}>
                  <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={() => handleShare(item)}
                    accessibilityLabel={`Share ${item.type}`}
                  >
                    <Icons.Feather name="share-2" size={20} color="#ffffff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mediaBtn}
                    onPress={() => handleSaveImage(item)}
                    accessibilityLabel={`Save ${item.type} image`}
                  >
                    <Icons.AntDesign name="download" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Caption */}
              {item.description && (
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: '400',
                    padding: 12,
                    paddingBottom: 0,
                  }}
                  ellipsizeMode="tail"
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}

              <View style={[styles.itemFooter, { backgroundColor: theme.colors.sub_card }]}>
                <Text style={[styles.postedDate, { color: theme.colors.sub_text }]}>
                  Posted {formatDate(item.postedDate)}
                </Text>
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: theme.colors.indicator }]}
                  onPress={() => handleActionButton(item)}
                  accessibilityLabel={item.type === 'tender' ? 'Submit bid' : 'Apply now'}
                >
                  <Text style={styles.submitButtonText}>
                    {contentType === 'Tender' ? 'Enquire' : 'Apply Now'}
                  </Text>
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
              No {contentType.toLowerCase()} available in this category.
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
  pickerWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  indicatorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  unitPickerContainer: {
    width: 150,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  unitPicker: {
    height: 50,
    paddingHorizontal: 3,
  },
  backButton: {
    position: 'absolute',
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
  itemsList: {
    height: '100%',
    paddingVertical: 10,
  },
  itemSummary: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    minHeight: 'auto',
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 260
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%'
  },
  industryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  industryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  media: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  mediaBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  itemFooter: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postedDate: {
    fontSize: 12,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonText: {
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