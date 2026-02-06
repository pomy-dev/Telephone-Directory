"use client";

import React, { useEffect, useState, useContext } from 'react'; 
import { AuthContext } from '../../context/authProvider';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Linking, 
  ActivityIndicator, 
  TextInput, 
  Modal, 
  Keyboard 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons } from "../../constants/Icons";
import { supabase } from "../../service/Supabase-Client";

const WorkerDirectoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const numColumns = 1;

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
  setLoading(true);
  const { data, error } = await supabase
    .from('pomy_workers')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error) {
    // Filter out the current user's own profile
    const otherWorkers = user?.uid 
      ? data.filter(worker => worker.user_id !== user.uid) 
      : data;

    setWorkers(otherWorkers);
    setFilteredWorkers(otherWorkers);
  }
  setLoading(false);
};

  const handleSearch = (text) => {
    setSearch(text);
    const query = text.toLowerCase();
    
    const filtered = workers.filter(w => {
      const nameMatch = w.name.toLowerCase().includes(query);
      
      // Smart Skill Search: Check if any skill in the array matches the query
      const skillsMatch = Array.isArray(w.skills) && w.skills.some(skill => 
        skill.toLowerCase().includes(query)
      );
      
      const locationMatch = w.location?.address?.toLowerCase().includes(query);
      
      return nameMatch || skillsMatch || locationMatch;
    });
    
    setFilteredWorkers(filtered);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  const renderFullInfoWorker = ({ item }) => (
    <View style={styles.workerBox}>
      {/* Availability Header */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: item.is_available ? '#E8F5E9' : '#F5F5F5' }]}>
          <View style={[styles.statusDot, { backgroundColor: item.is_available ? '#10b981' : '#999' }]} />
          <Text style={[styles.statusText, { color: item.is_available ? '#10b981' : '#666' }]}>
            {item.is_available ? 'Ready for Hire' : 'Currently Busy'}
          </Text>
        </View>
        <Text style={styles.memberSince}>Since {formatDate(item.created_at)}</Text>
      </View>

      <View style={styles.boxHeader}>
        <View style={styles.avatarSquare}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.workerName} numberOfLines={1}>{item.name}</Text>
          
          {/* SMART SKILLS DISPLAY */}
          <View style={styles.skillCloud}>
            {Array.isArray(item.skills) && item.skills.length > 0 ? (
              item.skills.map((skill, index) => (
                <View key={index} style={styles.skillTagMini}>
                  <Text style={styles.skillTagTextMini}>{skill}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.skillTagMini, { backgroundColor: '#F3F4F6' }]}>
                <Text style={[styles.skillTagTextMini, { color: '#999' }]}>General Labor</Text>
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.callIconButton} 
          onPress={() => Linking.openURL(`tel:${item.phone}`)}
        >
          <Icons.Ionicons name="call" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.boxBody}>
        <Text style={styles.sectionLabel}>Professional Profile</Text>
        <Text style={styles.workerBio} numberOfLines={3}>
          {item.bio || "Experience provider specializing in the skills listed above. Contact for quotes and availability."}
        </Text>
      </View>

      <View style={styles.boxFooter}>
        <View style={styles.locationContainer}>
          <Icons.Ionicons name="location-sharp" size={16} color="#666" />
          <View style={styles.locationTextGroup}>
            <Text style={styles.locationLabel}>Service Area</Text>
            <Text style={styles.locationText}>{item.location?.address || "Eswatini"}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewProfileBtn}
          onPress={() => Linking.openURL(`tel:${item.phone}`)}
        >
           <Text style={styles.viewProfileText}>Hire Now</Text>
           <Icons.Ionicons name="chevron-forward" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.navBtn}>
          <Icons.Ionicons name="menu-outline" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Marketplace</Text>
        <TouchableOpacity onPress={fetchWorkers} style={styles.navBtn}>
          <Icons.Ionicons name="refresh" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
          <TouchableOpacity 
            style={styles.searchBoxTrigger} 
            activeOpacity={0.8} 
            onPress={() => setIsSearchVisible(true)}
          >
            <Icons.Ionicons name="search-outline" size={20} color="#666" />
            <Text style={styles.searchPlaceholder}>Search skills (e.g. Plumbing, IT...)</Text>
          </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#000" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredWorkers}
          keyExtractor={(item) => item.id}
          renderItem={renderFullInfoWorker}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Icons.Ionicons name="people-outline" size={50} color="#DDD" />
              <Text style={{ color: '#999', marginTop: 10 }}>No workers found</Text>
            </View>
          }
        />
      )}

      {/* SEARCH MODAL */}
      <Modal visible={isSearchVisible} animationType="fade" transparent={false}>
        <View style={[styles.modalContent, { paddingTop: insets.top + 10 }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalInputWrapper}>
              <Icons.Ionicons name="search" size={20} color="#000" />
              <TextInput
                autoFocus
                placeholder="Find a specialist..."
                style={styles.modalInput}
                value={search}
                onChangeText={handleSearch}
                returnKeyType="done" 
                onSubmitEditing={() => setIsSearchVisible(false)}
              />
            </View>
            <TouchableOpacity onPress={() => setIsSearchVisible(false)}>
              <Text style={styles.cancelText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.suggestionBox}>
            <Text style={styles.suggestTitle}>Common Searches</Text>
            <View style={styles.tagCloud}>
              {['Plumbing', 'Electrical', 'Cleaning', 'Repairs', 'Transport'].map(tag => (
                <TouchableOpacity 
                  key={tag} 
                  style={styles.tag} 
                  onPress={() => { handleSearch(tag); setIsSearchVisible(false); }}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' }, 
  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: '#fff' },
  navTitle: { fontSize: 18, fontWeight: '900' },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  searchWrapper: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  searchBoxTrigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12 },
  searchPlaceholder: { marginLeft: 10, color: '#666', fontSize: 14 },

  listContent: { padding: 12 },
  
  workerBox: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F1F1'
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  memberSince: { fontSize: 10, color: '#999', fontWeight: '600' },

  boxHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarSquare: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerInfo: { flex: 1, marginLeft: 14 },
  workerName: { fontSize: 17, fontWeight: '800', color: '#000' },
  
  skillCloud: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 6 },
  skillTagMini: { backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  skillTagTextMini: { fontSize: 10, color: '#10b981', fontWeight: '800', textTransform: 'uppercase' },

  callIconButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  
  boxBody: { marginVertical: 15, paddingVertical: 15, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F9F9F9' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#999', textTransform: 'uppercase', marginBottom: 6 },
  workerBio: { fontSize: 14, color: '#444', lineHeight: 20 },
  
  boxFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationContainer: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  locationTextGroup: { marginLeft: 8 },
  locationLabel: { fontSize: 9, fontWeight: '800', color: '#BBB', textTransform: 'uppercase' },
  locationText: { fontSize: 13, color: '#1A1A1A', fontWeight: '700' },
  
  viewProfileBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#000' },
  viewProfileText: { color: '#fff', fontSize: 13, fontWeight: '700', marginRight: 5 },

  // MODAL
  modalContent: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  modalInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 12, height: 48 },
  modalInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#000' },
  cancelText: { color: '#007AFF', fontSize: 16, fontWeight: '700' },
  suggestionBox: { padding: 20 },
  suggestTitle: { fontSize: 12, fontWeight: '800', color: '#999', textTransform: 'uppercase', marginBottom: 15 },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  tagText: { fontSize: 14, fontWeight: '600' }
});

export default WorkerDirectoryScreen;