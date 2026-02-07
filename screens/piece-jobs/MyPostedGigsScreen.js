"use client";

import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, StatusBar, Alert, Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from "../../service/Supabase-Client";
import { AuthContext } from "../../context/authProvider";
import { Icons } from "../../constants/Icons";
import SecondaryNav from "../../components/SecondaryNav";

const { width } = Dimensions.get('window');

const MyPostedGigsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext);
  const [myGigs, setMyGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) fetchMyGigs();
  }, [user]);

  const fetchMyGigs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('pomy_gigs')
      .select('*')
      .contains('postedby', { email: user.email })
      .order('created_at', { ascending: false });

    if (!error) setMyGigs(data || []);
    setLoading(false);
  };

  const showOptionsMenu = (gig) => {
    Alert.alert(
      "Manage Job",
      `Options for "${gig.job_title}"`,
      [
        { text: "Edit Post", onPress: () => console.log("Navigate to edit screen with gig data") },
        {
          text: "Delete Post",
          style: "destructive",
          onPress: () => confirmDelete(gig.id)
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const confirmDelete = (gigId) => {
    Alert.alert("Confirm Delete", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from('pomy_gigs').delete().eq('id', gigId);
          if (!error) {
            setMyGigs(prev => prev.filter(g => g.id !== gigId));
          }
        }
      }
    ]);
  };

  const renderGigItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gigCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("JobInbox", { gigSelection: 'candidates', gigId: item.id, gigTitle: item.job_title })}
      onLongPress={() => showOptionsMenu(item)} // Long press to delete/edit
    >
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.categoryText}>{item.job_category?.toUpperCase()}</Text>
          <Text style={styles.jobTitle}>{item.job_title}</Text>

          {/* Descriptive snippet */}
          <Text style={styles.descriptionSnippet} numberOfLines={2}>
            {item.job_description ? `Need someone to ${item.job_description}` : "No description provided."}
          </Text>

          <View style={styles.priceRow}>
            <Icons.Ionicons name="cash-outline" size={14} color="#10b981" />
            <Text style={styles.priceText}>E{item.job_price}</Text>
          </View>
        </View>

        <View style={styles.rightColumn}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => showOptionsMenu(item)}
          >
            <Icons.Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.applicantBadge}>
            <Text style={styles.countText}>{item.application_count || 0}</Text>
            <Text style={styles.applicantLabel}>{`(inbox)`}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <SecondaryNav title={'My Job Posts'} onRightPress={fetchMyGigs} rightIcon={'refresh-outline'} />

      {loading ? (
        <ActivityIndicator size="large" color="#10b981" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={myGigs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGigItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icons.Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No jobs posted yet.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "900", letterSpacing: 0.5 },

  listContainer: { paddingVertical: 10 },

  gigCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8, // Very close to the edges
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4, // Sharper edges
    padding: 16,
    // Flat look with subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  cardInfo: { flex: 1, paddingRight: 10 },

  categoryText: { fontSize: 9, fontWeight: '800', color: '#10b981', marginBottom: 2, letterSpacing: 1 },
  jobTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 4 },
  descriptionSnippet: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },

  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceText: { fontSize: 15, fontWeight: '700', color: '#000', marginLeft: 4 },

  rightColumn: { alignItems: 'flex-end', justifyContent: 'space-between' },
  menuBtn: { padding: 4, marginRight: -8, marginTop: -8 },

  applicantBadge: {
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4, // Match sharp card style
    borderWidth: 1,
    borderColor: '#eee'
  },
  countText: { fontSize: 18, fontWeight: '900', color: '#000' },
  applicantLabel: { fontSize: 8, fontWeight: '800', color: '#999' },

  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#999', fontWeight: '600' }
});

export default MyPostedGigsScreen;