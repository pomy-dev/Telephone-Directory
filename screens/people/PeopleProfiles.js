import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  TextInput
} from 'react-native';
import { Modal } from 'react-native';
import { Icons } from "../../constants/Icons";
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import LoginScreen from '../../components/loginModal';
import { mockProfiles, allIndustries } from '../../utils/mockData';

export default function PeopleScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext);
  const { user } = React.useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [filteredProfiles, setFilteredProfiles] = useState(mockProfiles);
  const [showContactSheet, setShowContactSheet] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [selectedSkillTabs, setSelectedSkillTabs] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const searchInputRef = useRef(null);

  const industries = ['all', ...allIndustries];

  const handleIndustryFilter = (industry) => {
    setSelectedIndustry(industry);
    applyFilters(industry, selectedAvailability);
  };

  const handleAvailabilityFilter = (availability) => {
    setSelectedAvailability(availability);
    applyFilters(selectedIndustry, availability);
  };

  const applyFilters = (industry, availability) => {
    let filtered = mockProfiles;

    if (industry !== 'all') {
      filtered = filtered.filter(profile => profile.industry === industry);
    }

    if (availability === 'available') {
      filtered = filtered.filter(profile => profile.isAvailableForWork);
    } else if (availability === 'unavailable') {
      filtered = filtered.filter(profile => !profile.isAvailableForWork);
    }

    setFilteredProfiles(filtered);
  };

  const handleContactPress = (profile) => {
    setSelectedContact(profile);
    setShowContactSheet(true);
  };

  const handleAddProfile = () => {
    if (!user) {
      setIsLoginVisible(true);
      return;
    }
    navigation.navigate('AddProfile', { register: true });
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'linkedin': return <Icons.Ionicons name='logo-linkedin' size={14} color="#0077b5" />;
      case 'twitter': return <Icons.Ionicons name='logo-twitter' size={14} color="#1da1f2" />;
      case 'github': return <Icons.Ionicons name='logo-github' size={14} color="#333" />;
      case 'website': return <Icons.Ionicons name='globe-outline' size={14} color="#10b981" />;
      case 'instagram': return <Icons.Ionicons name='logo-instagram' size={14} color="#e4405f" />;
      case 'facebook': return <Icons.Ionicons name='logo-facebook' size={14} color="#1877f2" />;
      default: return <Icons.EvilIcons name='external-link' size={14} color="#6b7280" />;
    }
  };

  const handleSkillTabChange = (profileId, tab) => {
    setSelectedSkillTabs(prev => ({
      ...prev,
      [profileId]: tab
    }));
  };

  const getSkillsForTab = (profile, tab) => {
    switch (tab) {
      case 'acquired': return profile.acquiredSkills;
      case 'innate': return profile.innateSkills;
      case 'domestic': return profile.domesticSkills;
      default: return profile.acquiredSkills;
    }
  };

  // const handleSearch = (query) => {
  //   setIsSearching(true);
  //   if (searchQuery.length > 0) {
  //     const filtered = mockProfiles.filter(profile =>
  //       profile.name.toLowerCase().includes(query.toLowerCase()) || profile.title.toLowerCase().includes(query.toLowerCase())
  //     );
  //     setFilteredProfiles(filtered);
  //     setSearchQuery(query);
  //   }
  // }
  // open search input and focus it
  const startSearch = () => {
    setIsSearching(true);
    // small delay to ensure input mounted
    setTimeout(() => searchInputRef.current && searchInputRef.current.focus(), 50);
  };
  // close search and reset results
  const stopSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    setFilteredProfiles(mockProfiles);
    // blur input if available
    searchInputRef.current && searchInputRef.current.blur && searchInputRef.current.blur();
  };
  // live filter as user types
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();
    if (q.length === 0) {
      setFilteredProfiles(mockProfiles);
      return;
    }
    const filtered = mockProfiles.filter(profile =>
      (profile.name || '').toLowerCase().includes(q) ||
      (profile.title || '').toLowerCase().includes(q)
    );
    setFilteredProfiles(filtered);
  };

  const handleFilter = () => {
    setIsFiltering(!isFiltering);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />


      <LoginScreen
        isLoginVisible={isLoginVisible}
        onClose={() => setIsLoginVisible(false)}
      />


      {!isSearching ?
        <View style={styles.header}>
          <TouchableOpacity onPress={startSearch}>
            <View style={[styles.searchPlacholder, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border }]}>
              {/* <View style={[styles.searchWrapper, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border, paddingVertical: 10 }]}> */}
              <Icons.Ionicons
                name="search-outline"
                size={20}
                color={theme.colors.text}
                style={styles.searchIcon}
              />
              {/* </View> */}
            </View>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', borderColor: theme.colors.highlight, padding: 5 }}>
            <TouchableOpacity
              onPress={handleFilter}
              style={[styles.filterProfile, { backgroundColor: isFiltering ? theme.colors.highlight : 'transparent' }]}>
              <Icons.Ionicons name="options-outline" size={24} color={theme.colors.indicator} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAddProfile()}
              style={[styles.addProfile, { backgroundColor: theme.colors.indicator, borderColor: theme.colors.indicator }]}>
              <Icons.Ionicons name="person-add" size={18} color='#ffff' />
            </TouchableOpacity>
          </View>

        </View>
        :
        <View style={styles.searchContainer}>
          <View style={[styles.searchWrapper, { backgroundColor: theme.colors.sub_card, borderColor: theme.colors.border }]}>
            <Icons.Ionicons
              name="search-outline"
              size={20}
              color={theme.colors.text}
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              placeholder="Search name or title..."
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholderTextColor={theme.colors.sub_text}
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus={true}
              returnKeyType="search"
              keyboardType="default"
              clearButtonMode="while-editing"
            />
            <TouchableOpacity onPress={stopSearch} style={{ marginLeft: 8 }}>
              <Icons.Ionicons name="close" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      }

      {isFiltering &&
        <View style={[styles.filtersSection, { backgroundColor: theme.colors.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {industries.map((industry) => (
              <TouchableOpacity
                key={industry}
                style={[
                  styles.filterChip,
                  selectedIndustry === industry && styles.filterChipActive
                ]}
                onPress={() => handleIndustryFilter(industry)}
              >
                <Text style={[
                  styles.filterText,
                  selectedIndustry === industry && styles.filterTextActive
                ]}>
                  {industry === 'all' ? 'All' : industry}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Availability</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {['all', 'available', 'unavailable'].map((availability) => (
              <TouchableOpacity
                key={availability}
                style={[
                  styles.filterChip,
                  selectedAvailability === availability && styles.filterChipActive
                ]}
                onPress={() => handleAvailabilityFilter(availability)}
              >
                <Text style={[
                  styles.filterText,
                  selectedAvailability === availability && styles.filterTextActive
                ]}>
                  {availability === 'all' ? 'Miscellaneous' :
                    availability === 'available' ? 'Open to Work' : 'Not Available'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      }

      <ScrollView style={styles.profilesList} showsVerticalScrollIndicator={false}>
        {filteredProfiles.map((profile) => (
          <TouchableOpacity key={profile.id} style={[styles.profileCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.profileHeader}>
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />

              <View style={styles.profileInfo}>
                <Text ellipsizeMode='tail' numberOfLines={1} style={[styles.name, { color: theme.colors.text }]}>{profile.name}</Text>
                <Text style={[styles.experience, { color: theme.colors.sub_text }]}>
                  Maritary Status: Mrs
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.availabilityBadge,
                  { backgroundColor: profile.isAvailableForWork ? '#dcfce7' : '#fef3c7' }
                ]}>
                  <Text style={[
                    styles.availabilityText,
                    { color: profile.isAvailableForWork ? '#16a34a' : '#d97706' }
                  ]}>
                    {profile.isAvailableForWork ? 'Open to Work' : 'Employed'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'column', alignItems: 'start', marginBottom: 12 }}>
              <Text style={[styles.title, { color: theme.colors.text }]}>{profile.title}</Text>
              <View style={styles.companyRow}>
                <Icons.Feather name='briefcase' size={14} color={theme.colors.text} />
                <Text style={[styles.company, { color: theme.colors.text }]}>{profile.company}</Text>
              </View>
              <View style={styles.locationRow}>
                <Icons.Feather name='map-pin' size={14} color={theme.colors.text} />
                <Text style={[styles.location, { color: theme.colors.text }]}>{profile.location}</Text>
              </View>
            </View>

            <View style={styles.profileDetails}>
              <Text style={[styles.experience, { color: theme.colors.text }]}>
                {profile.experience} of experience in {profile.industry}
              </Text>
              <Text style={[styles.education, { color: theme.colors.text }]}>{profile.education}</Text>
            </View>

            <View style={styles.skillsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Skills</Text>
              <View style={styles.skillTabsContainer}>
                {['acquired', 'innate', 'domestic'].map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[
                      styles.skillTab,
                      (selectedSkillTabs[profile.id] || 'acquired') === tab && styles.skillTabActive
                    ]}
                    onPress={() => handleSkillTabChange(profile.id, tab)}
                  >
                    <Text style={[
                      styles.skillTabText,
                      (selectedSkillTabs[profile.id] || 'acquired') === tab && styles.skillTabTextActive
                    ]}>
                      {tab === 'acquired' ? 'Acquired' : tab === 'innate' ? 'Innate' : 'Domestic'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.skillsContainer}>
                {getSkillsForTab(profile, selectedSkillTabs[profile.id] || 'acquired').slice(0, 4).map((skill, index) => (
                  <View key={index} style={styles.skillChip}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.achievementsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Key Achievements</Text>
              {profile.achievements.slice(0, 2).map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <Icons.FontAwesome6 name='award' size={14} color="#f97316" />
                  <Text style={[styles.achievementText, { color: theme.colors.sub_text }]}>{achievement}</Text>
                </View>
              ))}
            </View>

            <View style={styles.socialSection}>
              <Text style={styles.sectionTitle}>Social Links</Text>
              <View style={styles.socialLinksContainer}>
                {Object.entries(profile.socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  return (
                    <TouchableOpacity
                      key={platform}
                      style={styles.socialLink}
                      onPress={() => Linking.openURL(url)}
                    >
                      {getSocialIcon(platform)}
                      <Text style={styles.socialLinkText}>
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.profileFooter}>
              <TouchableOpacity onPress={() => handleContactPress(profile)}
                style={[styles.connectButton, { backgroundColor: theme.colors.indicator }]}>
                <Text style={styles.connectButtonText}>Contact</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={showContactSheet}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactSheet(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetContainer, { backgroundColor: theme.colors.sub_card }]}>
            <TouchableOpacity
              style={styles.sheetCloseBtn}
              onPress={() => setShowContactSheet(false)}
            >
              <Icons.FontAwesome name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>Contact Details</Text>
            {selectedContact && (
              <>
                {(selectedContact.phone || selectedContact.email) ? (
                  <>
                    {selectedContact.phone && (
                      <TouchableOpacity onPress={() => { Linking.openURL(`tel:${selectedContact.phone}`) }} style={styles.sheetRow}>
                        <Icons.FontAwesome name="phone" size={20} color={theme.colors.indicator} style={{ marginRight: 10 }} />
                        <Text style={[styles.sheetText, { color: theme.colors.sub_text }]}>{selectedContact.phone}</Text>
                      </TouchableOpacity>
                    )}
                    {selectedContact.email && (
                      <TouchableOpacity onPress={() => { Linking.openURL(`mailto:${selectedContact.email}`) }} style={styles.sheetRow}>
                        <Icons.Ionicons name="mail-outline" size={20} color={theme.colors.indicator} style={{ marginRight: 10 }} />
                        <Text style={[styles.sheetText, { color: theme.colors.sub_text }]}>{selectedContact.email}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={[styles.sheetNoData, { backgroundColor: theme.colors.sub_card }]}>
                    <Icons.FontAwesome name="exclamation-circle" size={40} color="#ccc" />
                    <Text style={styles.sheetNoDataText}>No contact details available</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  searchPlacholder: {
    flex: 1, width: 200,
    marginRight: 40,
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 50, flexDirection: 'row', alignItems: 'center'
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    fontSize: 16,
    fontWeight: "400",
    flex: 1,
  },
  filterProfile: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  addProfile: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  filtersSection: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  filterContainer: {
    paddingLeft: 20,
  },
  filterChip: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#003366',
    borderColor: '#003366',
  },
  filterText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  profilesList: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 16
  },
  profileCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  company: {
    fontSize: 13,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  profileDetails: {
    marginBottom: 16,
  },
  experience: {
    fontSize: 14,
    marginBottom: 4,
  },
  education: {
    fontSize: 13,
  }, skillsSection: {
    marginBottom: 16,
  },
  skillTabsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  skillTab: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  skillTabActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  skillTabText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  skillTabTextActive: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  achievementsSection: {
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  achievementText: {
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  socialSection: {
    marginBottom: 16,
  },
  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  socialLinkText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 4,
  },
  profileFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButton: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    fontWeight: '600',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 120,
    elevation: 10,
  },
  sheetCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: '#003366',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginLeft: 10,
  },
  sheetText: {
    fontSize: 16,
  },
  sheetNoData: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  sheetNoDataText: {
    fontSize: 16,
    color: '#888',
    marginTop: 12,
    textAlign: 'center',
  },
});