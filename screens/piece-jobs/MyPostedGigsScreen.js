import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from "../../service/Supabase-Client";
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyPostedGigsScreen = ({ navigation }) => {
  const [myGigs, setMyGigs] = useState([]);

  useEffect(() => {
    const fetchMyGigs = async () => {
      const userData = JSON.parse(await AsyncStorage.getItem("userData"));
      // Query gigs where the phone number matches the logged-in user
      const { data, error } = await supabase
        .from('pomy_gigs')
        .select('*')
        .contains('postedby', { phone: userData.phone });

      if (!error) setMyGigs(data);
    };
    fetchMyGigs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Job Posts</Text>
      <FlatList
        data={myGigs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate("JobInbox", { gigId: item.id, gigTitle: item.job_title })}
          >
            <Text style={styles.title}>{item.job_title}</Text>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.application_count || 0} Applicants</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 16, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '600' },
  badge: { backgroundColor: '#10b981', paddingHorizontal: 10, borderRadius: 12, justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 12 }
});

export default MyPostedGigsScreen;