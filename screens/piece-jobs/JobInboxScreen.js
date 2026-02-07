"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  UIManager,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icons } from "../../constants/Icons";
import { CustomToast } from "../../components/customToast";
import {
  getMyAppliedGigs,
  getGigApplicants,
  updateApplicationStatus,
  approveGigApplication,
} from "../../service/Supabase-Fuctions";
import { AuthContext } from "../../context/authProvider";

const JobInboxScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { gigSelection, gigId, gigTitle } = route.params
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = React.useContext(AuthContext);

  const [selectedApp, setSelectedApp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    console.log(`Loading applicants of selection: ${gigSelection}`);
    try {
      setLoading(true);

      const res = gigSelection === 'applied' ? await getMyAppliedGigs(user.email) : await getGigApplicants(gigId);

      if (res.success) {
        setApplicants(res.data);
        console.log("Applicants loaded:", res.data);
      }
      else
        Alert.alert("Error", "Failed to load applicants.");

    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred while loading applicants.");
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async (applicationId, workerName) => {
    Alert.alert("Confirm Hire", `Hiring ${workerName} will close this job and notify other applicants they were not selected.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm & Close Job",
        onPress: async () => {
          setLoading(true);
          const res = await approveGigApplication(applicationId);
          if (res.success) {
            Alert.alert("Job Closed", "Worker hired successfully and other applicants were rejected.");
            setModalVisible(false);
            loadApplicants(); // Refresh the list to show new statuses
          } else {
            Alert.alert("Error", res.error);
          }
          setLoading(false);
        }
      }
    ]);
  };

  const renderApplicant = ({ item }) => {
    const applicantData =
      typeof item.applicant === "string"
        ? JSON.parse(item.applicant)
        : item.applicant;

    // Logic to get first two letters of the email (e.g., "john@mail.com" -> "JO")
    const getEmailIdentifier = (email) => {
      if (!email) return "??";
      return email.substring(0, 2).toUpperCase();
    };

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    return (
      <View style={styles.appCard}>
        <TouchableOpacity
          onPress={() => {
            setSelectedApp({ ...item, applicant: applicantData });
            setModalVisible(true);
          }}
          activeOpacity={0.6}
        >
          <View style={styles.cardInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getEmailIdentifier(applicantData?.email)}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>
                {applicantData?.email || "Unknown Worker"}
              </Text>

              <Text style={styles.contactText}>{applicantData?.email}</Text>
              <Text style={styles.dateText}>
                {` Applied at: ${formatDate(item.created_at)}`}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.iconCallBtn}
              onPress={() => Linking.openURL(`tel:${applicantData?.phone}`)}
            >
              <Icons.Ionicons name="call" size={18} color="#10b981" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.emailBtn}
            onPress={() => Linking.openURL(`mailto:${applicantData?.email}`)}
          >
            <Icons.Ionicons name="mail-outline" size={18} color="#10b981" />
            <Text style={styles.emailBtnText}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.hireBtn,
              item.status === "approved" && styles.hiredBtnDisabled,
            ]}
            onPress={() => {
              item.status === "approved" ?
                CustomToast("Approved!", "This worker has already been hired for this job.")
                :
                handleHire(item.id, applicantData?.displayName)
            }}
          >
            <Text style={styles.hireBtnText}>
              {item.status === "approved" ? "Worker Hired" : "Hire Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  const renderMyApplicationItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Optional: for smoother animation (you can remove if you prefer LayoutAnimation only)
    const [rotateAnim] = useState(new Animated.Value(0));

    const toggleExpand = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setIsExpanded(!isExpanded);
    };

    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    // You can format these dates/numbers as needed
    const appliedDate = new Date(item.appliedDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <View style={styles.listItemcontainer}>
        {/* Main clickable row */}
        <TouchableOpacity
          style={styles.listItemHeaderRow}
          onPress={toggleExpand}
          activeOpacity={0.8}
        >
          <View style={styles.leftContent}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.jobTitle}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.price}>
                {item.price ? `${item.price} ${item.currency || ''}` : '—'}
              </Text>
            </View>

            <View style={styles.statusDateRow}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) }
              ]}>
                <Text style={styles.listItemstatusText}>{item.status}</Text>
              </View>

              <Text style={styles.appliedDate}>Applied {appliedDate}</Text>
            </View>
          </View>

          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons
              name="chevron-down"
              size={24}
              color="#666"
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Expanded content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Employer Info */}
            <View style={styles.listItemsection}>
              <Text style={styles.sectionTitle}>Employer</Text>
              <Text style={styles.employerName}>{item.employer?.name || 'N/A'}</Text>
              {item.employer?.company && (
                <Text style={styles.company}>{item.employer.company}</Text>
              )}
              {item.employer?.location && (
                <Text style={styles.location}>{item.employer.location}</Text>
              )}
            </View>

            {/* Requirements */}
            {item.requirements && item.requirements.length > 0 && (
              <View style={styles.listItemsection}>
                <Text style={styles.listItemsectionTitle}>Requirements</Text>
                {item.requirements.map((req, index) => (
                  <Text key={index} style={styles.requirementItem}>
                    • {req}
                  </Text>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  // handleCancelApplication(item.id)
                  console.log('Cancel application', item.id);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel Application</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.reapplyButton]}
                onPress={() => {
                  // handleReapply(item.id)
                  console.log('Re-apply', item.id);
                }}
              >
                <Text style={styles.reapplyButtonText}>Re-apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  // Helper function for status colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f39c12'; // orange
      case 'accepted':
        return '#27ae60'; // green
      case 'rejected':
        return '#c0392b'; // red
      case 'withdrawn':
        return '#7f8c8d'; // gray
      default:
        return '#3498db'; // blue
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icons.Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{gigSelection === 'applied' ? 'Track Gigs Applied-for' : `Inbox for Gig`}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#10b981"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={applicants}
          renderItem={renderApplicant}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No applications yet.</Text>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { marginTop: insets.top + 40 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Application Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icons.Ionicons name="close-circle" size={32} color="#000" />
              </TouchableOpacity>
            </View>

            {selectedApp && (
              <>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <View style={styles.profileHero}>
                    <View style={styles.largeAvatar}>
                      <Text style={styles.largeAvatarText}>
                        {/* Get initial from the applicant object provided in the application */}
                        {selectedApp.applicant?.name?.[0] || "?"}
                      </Text>
                    </View>
                    <Text style={styles.modalName}>
                      {selectedApp.applicant?.name || "Anonymous Applicant"}
                    </Text>
                    <View style={styles.contactRow}>
                      <Icons.Ionicons
                        name="mail-outline"
                        size={14}
                        color="#666"
                      />
                      <Text style={styles.modalEmail}>
                        {" "}
                        {selectedApp.applicant?.email}
                      </Text>
                    </View>
                    <View style={styles.contactRow}>
                      <Icons.Ionicons
                        name="call-outline"
                        size={14}
                        color="#666"
                      />
                      <Text style={styles.modalEmail}>
                        {" "}
                        {selectedApp.applicant?.phone}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Skills Section - Specific to this application */}
                  <Text style={styles.sectionTitle}>Skills for this Gig</Text>
                  <View style={styles.skillBadgeRow}>
                    {selectedApp.skill_set &&
                      selectedApp.skill_set.length > 0 ? (
                      selectedApp.skill_set.map((skill, idx) => (
                        <View key={idx} style={styles.skillBadge}>
                          <Text style={styles.skillBadgeText}>{skill}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>
                        No specific skills listed.
                      </Text>
                    )}
                  </View>

                  {/* Status Info */}
                  <View style={styles.statusInfoBox}>
                    <Text style={styles.sectionTitle}>Application Status</Text>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            selectedApp.status === "approved"
                              ? "#10b981"
                              : "#f59e0b",
                        },
                      ]}
                    >
                      {selectedApp.status?.toUpperCase() || "PENDING"}
                    </Text>
                  </View>

                  {/* Attachments Section */}
                  {selectedApp.attachments &&
                    selectedApp.attachments.length > 0 && (
                      <>
                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                          Attached Documents
                        </Text>
                        {selectedApp.attachments.map((file, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.attachmentCard}
                            onPress={() => Linking.openURL(file.url)}
                          >
                            <Icons.Ionicons
                              name="document-attach"
                              size={20}
                              color="#10b981"
                            />
                            <Text style={styles.attachmentText}>
                              {file.name || `View Document ${index + 1}`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}
                </ScrollView>

                {/* Modal Action Footer */}
                <View
                  style={[
                    styles.modalFooter,
                    { paddingBottom: insets.bottom + 10 },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.modalCallBtn}
                    onPress={() =>
                      Linking.openURL(`tel:${selectedApp.applicant?.phone}`)
                    }
                  >
                    <Icons.Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.modalBtnText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalHireBtn,
                      selectedApp.status === "approved" && styles.hiredBtnDisabled,
                    ]}
                    onPress={() =>
                      handleHire(selectedApp.id, selectedApp.applicant?.name)
                    }
                    disabled={selectedApp.status === "approved"}
                  >
                    <Text style={styles.modalBtnText}>
                      {selectedApp.status === "approved"
                        ? "Worker Hired"
                        : "Hire Worker"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // list view styles of my applied for gigs
  listItemcontainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  listItemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  leftContent: {
    flex: 1,
    paddingRight: 16,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  category: {
    fontSize: 14,
    color: '#555',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2ecc71',
  },
  statusDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  listItemstatusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  appliedDate: {
    fontSize: 13,
    color: '#777',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  listItemsection: {
    marginBottom: 20,
  },
  listItemsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  employerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  company: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  location: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  requirementItem: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  listItemactionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  cancelButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 15,
  },
  reapplyButton: {
    backgroundColor: '#3498db',
  },
  reapplyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  container: { flex: 1, backgroundColor: "#fcfcfc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  backBtn: { width: 40, height: 40, justifyContent: "center" },

  // List Cards
  appCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
  },
  cardInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  name: { fontSize: 16, fontWeight: "700", color: "#000" },
  skillText: { fontSize: 12, color: "#666", marginTop: 2 },
  contactText: { fontSize: 11, color: "#10b981", marginTop: 2 },
  iconCallBtn: { padding: 10, backgroundColor: "#f0fdf4", borderRadius: 10 },
  actionRow: {
    flexDirection: "row",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f9f9f9",
    gap: 10,
  },
  emailBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#10b981",
    gap: 6,
  },
  emailBtnText: { color: "#10b981", fontWeight: "700", fontSize: 14 },
  hireBtn: {
    flex: 1.5,
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  hiredBtnDisabled: { backgroundColor: "#e0e0e0" },
  hireBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    height: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#999",
    textTransform: "uppercase",
  },
  profileHero: { alignItems: "center", marginVertical: 10 },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  largeAvatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  modalName: { fontSize: 22, fontWeight: "800", color: "#000" },
  modalEmail: { fontSize: 14, color: "#666", marginTop: 4 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 20 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
    marginBottom: 12,
    letterSpacing: 1,
  },
  skillBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillBadge: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skillBadgeText: { fontSize: 13, color: "#444", fontWeight: "600" },
  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  attachmentText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },

  // Modal Footer
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalCallBtn: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 15,
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalHireBtn: {
    flex: 2,
    backgroundColor: "#10b981",
    borderRadius: 15,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },

  emptyText: { textAlign: "center", marginTop: 60, color: "#999" },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  modalText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  }
});

export default JobInboxScreen;
