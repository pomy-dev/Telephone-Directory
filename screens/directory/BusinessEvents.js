import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, Users, X, User, Mail, Phone, Building } from 'lucide-react-native';
import { mockEvents, allIndustries } from '@/data/mockData';
import { Event } from '@/types';

export default function EventsScreen() {
  const [selectedFilter, setSelectedFilter] = useState < string > ('all');
  const [filteredEvents, setFilteredEvents] = useState < Event > (mockEvents);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState < Event | null > (null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    industry: '',
    dietaryRestrictions: '',
    specialRequests: ''
  });

  const industries = ['all', ...allIndustries.slice(0, 8)];

  const handleFilterChange = (industry) => {
    setSelectedFilter(industry);
    if (industry === 'all') {
      setFilteredEvents(mockEvents);
    } else {
      setFilteredEvents(mockEvents.filter(event => event.industry === industry));
    }
  };

  const handleJoinEvent = (event) => {
    setSelectedEvent(event);
    setShowJoinModal(true);
  };

  const handleSubmitJoin = () => {
    if (!formData.fullName || !formData.email || !formData.company) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    Alert.alert('Success', `You have successfully registered for ${selectedEvent?.title}!`);
    setShowJoinModal(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      industry: '',
      dietaryRestrictions: '',
      specialRequests: ''
    });
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Industry Events</Text>
        <Text style={styles.subtitle}>Discover opportunities to learn and network</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
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
        {filteredEvents.map((event) => (
          <TouchableOpacity key={event.id} style={styles.eventCard}>
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

            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDescription}>{event.description}</Text>

            <View style={styles.eventDetails}>
              <View style={styles.eventDetailRow}>
                <Calendar size={16} color="#6b7280" />
                <Text style={styles.eventDetailText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <MapPin size={16} color="#6b7280" />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
              <View style={styles.eventDetailRow}>
                <Users size={16} color="#6b7280" />
                <Text style={styles.eventDetailText}>
                  {event.attendees}/{event.maxAttendees} attendees
                </Text>
              </View>
            </View>

            <View style={styles.eventFooter}>
              <Text style={styles.companyName}>Hosted by {event.company}</Text>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinEvent(event)}
              >
                <Text style={styles.joinButtonText}>Join Event</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={showJoinModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Join Event</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowJoinModal(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.eventSummary}>
              <Text style={styles.eventSummaryTitle}>{selectedEvent?.title}</Text>
              <Text style={styles.eventSummaryDetails}>
                {selectedEvent && formatDate(selectedEvent.date)} • {selectedEvent?.location}
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#6b7280" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.fullName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                    placeholder="Enter your full name"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#6b7280" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    placeholder="your.email@company.com"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Phone size={20} color="#6b7280" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                    placeholder="+1 (555) 123-4567"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Professional Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company *</Text>
                <View style={styles.inputContainer}>
                  <Building size={20} color="#6b7280" />
                  <TextInput
                    style={styles.textInput}
                    value={formData.company}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, company: text }))}
                    placeholder="Your company name"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Title</Text>
                <TextInput
                  style={styles.textInputFull}
                  value={formData.jobTitle}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, jobTitle: text }))}
                  placeholder="Your current position"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Industry</Text>
                <TextInput
                  style={styles.textInputFull}
                  value={formData.industry}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, industry: text }))}
                  placeholder="Your industry"
                />
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Additional Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dietary Restrictions</Text>
                <TextInput
                  style={styles.textInputFull}
                  value={formData.dietaryRestrictions}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, dietaryRestrictions: text }))}
                  placeholder="Any dietary restrictions or allergies"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Special Requests</Text>
                <TextInput
                  style={[styles.textInputFull, styles.textArea]}
                  value={formData.specialRequests}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, specialRequests: text }))}
                  placeholder="Any special accommodations or requests"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowJoinModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitJoin}
            >
              <Text style={styles.submitButtonText}>Register for Event</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  filterContainer: {
    paddingVertical: 16,
    paddingLeft: 20,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
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
    flex: 1,
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
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
    color: '#6b7280',
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventSummary: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  eventSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventSummaryDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  textInputFull: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});