"use client";

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Safe Context
import { Icons } from "../../constants/Icons";
import { getGigApplicants, updateApplicationStatus } from '../../service/Supabase-Fuctions';

const JobInboxScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets(); // Get safe area values
  const { gigId, gigTitle } = route.params || { gigId: null, gigTitle: "Applicants" };
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gigId) loadApplicants();
  }, [gigId]);

  const loadApplicants = async () => {
    setLoading(true);
    const res = await getGigApplicants(gigId);
    if (res.success) setApplicants(res.data);
    setLoading(false);
  };

  const makeCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert("Error", "No phone number available for this worker.");
      return;
    }
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert("Error", "Phone calls are not supported on this device");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const handleHire = async (id) => {
    const res = await updateApplicationStatus(id, 'accepted');
    if (res.success) loadApplicants();
  };

  const renderApplicant = ({ item }) => {
    const isAccepted = item.application_status === 'accepted';

    return (
      <View style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.applicant_name?.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{item.applicant_name}</Text>
            <TouchableOpacity 
                onPress={() => makeCall(item.applicant_phone)}
                style={styles.phoneRow}
            >
              <Icons.Ionicons name="call" size={14} color="#10b981" />
              <Text style={styles.phone}>{item.applicant_phone}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Quick Action Call Button */}
          <TouchableOpacity 
            style={styles.iconCallBtn} 
            onPress={() => makeCall(item.applicant_phone)}
          >
            <Icons.Ionicons name="call-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          activeOpacity={0.7}
          style={[styles.hireBtn, isAccepted && styles.hiredBtn]} 
          onPress={() => !isAccepted && handleHire(item.id)}
        >
          <Text style={[styles.hireBtnText, isAccepted && styles.hiredBtnText]}>
            {isAccepted ? 'Confirmed Worker' : 'Hire Worker'}
          </Text>
          {isAccepted && <Icons.Ionicons name="checkmark-circle" size={16} color="#10b981" style={{marginLeft: 5}} />}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Icons.Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{gigTitle}</Text>
          <Text style={styles.headerSubtitle}>Applications Inbox</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={loadApplicants}>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Icons.Ionicons name="refresh-outline" size={22} color="#000" />
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={applicants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderApplicant}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading && (
          <View style={styles.emptyState}>
            <Icons.Ionicons name="mail-open-outline" size={60} color="#eee" />
            <Text style={styles.emptyText}>No applicants yet.</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfcfc' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerTitleContainer: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#000" },
  headerSubtitle: { fontSize: 11, color: '#999', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  headerBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: "#f5f5f5", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  
  listContent: { padding: 20 },
  card: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 24, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2
  },
  cardInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 16, 
    backgroundColor: '#000', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '700', color: '#000' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  phone: { fontSize: 14, color: '#10b981', marginLeft: 5, fontWeight: '500' },
  
  iconCallBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center'
  },

  hireBtn: { 
    backgroundColor: '#000', 
    paddingVertical: 14, 
    borderRadius: 14, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  hiredBtn: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#10b981' },
  hireBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  hiredBtnText: { color: '#10b981' },

  emptyState: { alignItems: "center", marginTop: 100 },
  emptyText: { color: "#ccc", marginTop: 10, fontSize: 15, fontWeight: '600' }
});

export default JobInboxScreen;