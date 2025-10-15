import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  FAB,
  IconButton,
  Menu,
  Modal,
  Portal,
  Surface,
  Text,
  TextInput,
} from 'react-native-paper';
import { theme } from '../../constants/vendorTheme';

const { width } = Dimensions.get('window');

export default function GroupManagementScreen() {
  const [activeTab, setActiveTab] = useState('discussions');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [media, setMedia] = useState([]);
  const [votes, setVotes] = useState([]);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showCreateVote, setShowCreateVote] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    category: 'Business',
    isPrivate: false,
    maxMembers: 100
  });

  const [discussionForm, setDiscussionForm] = useState({
    title: '',
    content: '',
    attachments: []
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'Normal',
    attachments: []
  });

  const [voteForm, setVoteForm] = useState({
    question: '',
    options: ['Yes', 'No'],
    duration: 7, // days
    allowMultiple: false
  });

  const currentUser = {
    id: '1',
    name: 'John Doe',
    role: 'admin', // admin, treasurer, member
    avatar: null
  };

  const categories = ['Business', 'Agriculture', 'Food & Beverages', 'Crafts', 'Technology', 'Education', 'Other'];

  useEffect(() => {
    loadGroups();
    if (selectedGroup) {
      loadGroupData();
    }
  }, [selectedGroup]);

  const loadGroups = () => {
    // In real app, load from API
    setGroups([
      {
        id: '1',
        name: 'Mbabane Vendors Collective',
        description: 'A group for vendors in Mbabane area to share resources and bulk purchase',
        category: 'Business',
        memberCount: 15,
        maxMembers: 50,
        isPrivate: false,
        adminId: '1',
        createdAt: '2024-01-01',
        bannerImage: null
      }
    ]);
  };

  const loadGroupData = () => {
    if (!selectedGroup) return;

    // Load discussions, announcements, media, votes, members, join requests
    setDiscussions([
      {
        id: '1',
        title: 'Weekly Bulk Order Meeting',
        content: 'Let\'s discuss our weekly bulk order for vegetables. Who\'s interested in joining?',
        author: { name: 'Thabo Dlamini', avatar: null },
        createdAt: '2024-01-15',
        replies: 5,
        attachments: []
      }
    ]);

    setAnnouncements([
      {
        id: '1',
        title: 'New Supplier Partnership',
        content: 'We have partnered with Swazi Fresh Produce for better prices. Check the details in our media section.',
        priority: 'High',
        author: { name: 'John Doe', avatar: null },
        createdAt: '2024-01-14',
        attachments: []
      }
    ]);

    setMedia([
      {
        id: '1',
        name: 'Supplier Agreement.pdf',
        type: 'document',
        size: '2.4 MB',
        uploadedBy: { name: 'John Doe', avatar: null },
        uploadedAt: '2024-01-14',
        url: null
      },
      {
        id: '2',
        name: 'Product Photos',
        type: 'image',
        size: '1.2 MB',
        uploadedBy: { name: 'Sarah Ndlovu', avatar: null },
        uploadedAt: '2024-01-13',
        url: null
      }
    ]);

    setVotes([
      {
        id: '1',
        question: 'Should we increase membership fees?',
        options: [
          { text: 'Yes', votes: 8 },
          { text: 'No', votes: 12 }
        ],
        totalVotes: 20,
        createdBy: { name: 'John Doe', avatar: null },
        createdAt: '2024-01-10',
        expiresAt: '2024-01-17',
        hasVoted: false
      }
    ]);

    setMembers([
      {
        id: '1',
        name: 'John Doe',
        role: 'admin',
        avatar: null,
        joinedAt: '2024-01-01',
        isActive: true
      },
      {
        id: '2',
        name: 'Thabo Dlamini',
        role: 'treasurer',
        avatar: null,
        joinedAt: '2024-01-02',
        isActive: true
      }
    ]);

    setJoinRequests([
      {
        id: '1',
        name: 'Sipho Mamba',
        businessType: 'Food Vendor',
        location: 'Manzini',
        experience: '2 years',
        reason: 'Looking to join bulk purchasing group',
        submittedAt: '2024-01-15',
        vendorProfile: {
          businessLicense: 'Valid',
          references: '2 provided',
          verificationStatus: 'Pending'
        }
      }
    ]);
  };

  const createGroup = () => {
    if (!groupForm.name.trim()) {
      Alert.alert('Error', 'Group name is required');
      return;
    }

    const newGroup = {
      ...groupForm,
      id: Date.now().toString(),
      memberCount: 1,
      adminId: currentUser.id,
      createdAt: new Date().toISOString()
    };

    setGroups(prev => [...prev, newGroup]);
    setSelectedGroup(newGroup);
    setShowCreateGroup(false);
    setGroupForm({ name: '', description: '', category: 'Business', isPrivate: false, maxMembers: 100 });
    Alert.alert('Success', 'Group created successfully!');
  };

  const createDiscussion = () => {
    if (!discussionForm.title.trim()) {
      Alert.alert('Error', 'Discussion title is required');
      return;
    }

    const newDiscussion = {
      ...discussionForm,
      id: Date.now().toString(),
      author: { name: currentUser.name, avatar: currentUser.avatar },
      createdAt: new Date().toISOString(),
      replies: 0
    };

    setDiscussions(prev => [...prev, newDiscussion]);
    setShowCreateDiscussion(false);
    setDiscussionForm({ title: '', content: '', attachments: [] });
    Alert.alert('Success', 'Discussion created successfully!');
  };

  const createAnnouncement = () => {
    if (!announcementForm.title.trim()) {
      Alert.alert('Error', 'Announcement title is required');
      return;
    }

    const newAnnouncement = {
      ...announcementForm,
      id: Date.now().toString(),
      author: { name: currentUser.name, avatar: currentUser.avatar },
      createdAt: new Date().toISOString()
    };

    setAnnouncements(prev => [...prev, newAnnouncement]);
    setShowCreateAnnouncement(false);
    setAnnouncementForm({ title: '', content: '', priority: 'Normal', attachments: [] });
    Alert.alert('Success', 'Announcement created successfully!');
  };

  const createVote = () => {
    if (!voteForm.question.trim()) {
      Alert.alert('Error', 'Vote question is required');
      return;
    }

    if (voteForm.options.length < 2) {
      Alert.alert('Error', 'At least 2 options are required');
      return;
    }

    const newVote = {
      ...voteForm,
      id: Date.now().toString(),
      options: voteForm.options.map(option => ({ text: option, votes: 0 })),
      totalVotes: 0,
      createdBy: { name: currentUser.name, avatar: currentUser.avatar },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + voteForm.duration * 24 * 60 * 60 * 1000).toISOString(),
      hasVoted: false
    };

    setVotes(prev => [...prev, newVote]);
    setShowCreateVote(false);
    setVoteForm({ question: '', options: ['Yes', 'No'], duration: 7, allowMultiple: false });
    Alert.alert('Success', 'Vote created successfully!');
  };

  const handleVote = (voteId, optionIndex) => {
    setVotes(prev => prev.map(vote => {
      if (vote.id === voteId) {
        const newOptions = [...vote.options];
        newOptions[optionIndex].votes += 1;
        return {
          ...vote,
          options: newOptions,
          totalVotes: vote.totalVotes + 1,
          hasVoted: true
        };
      }
      return vote;
    }));
    Alert.alert('Success', 'Vote submitted successfully!');
  };

  const handleJoinRequest = (requestId, approved) => {
    if (approved) {
      const request = joinRequests.find(r => r.id === requestId);
      if (request) {
        const newMember = {
          id: Date.now().toString(),
          name: request.name,
          role: 'member',
          avatar: null,
          joinedAt: new Date().toISOString(),
          isActive: true
        };
        setMembers(prev => [...prev, newMember]);
        Alert.alert('Success', 'Member approved and added to group!');
      }
    }

    setJoinRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const assignRole = (memberId, newRole) => {
    setMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, role: newRole } : member
    ));
    Alert.alert('Success', 'Role updated successfully!');
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const attachment = {
        id: Date.now().toString(),
        name: `Image_${Date.now()}.jpg`,
        type: 'image',
        uri: result.assets[0].uri,
        size: 'Unknown'
      };

      if (activeTab === 'discussions') {
        setDiscussionForm(prev => ({ ...prev, attachments: [...prev.attachments, attachment] }));
      } else if (activeTab === 'announcements') {
        setAnnouncementForm(prev => ({ ...prev, attachments: [...prev.attachments, attachment] }));
      }
    }
  };

  const pickDocument = async () => {
    try {
      const file = new File.pickFileAsync();
      console.log(file.textSync());

      if (!result.canceled && result.assets[0]) {
        const attachment = {
          id: Date.now().toString(),
          name: file.name,
          type: 'document',
          uri: file.uri,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
        };

        if (activeTab === 'discussions') {
          setDiscussionForm(prev => ({ ...prev, attachments: [...prev.attachments, attachment] }));
        } else if (activeTab === 'announcements') {
          setAnnouncementForm(prev => ({ ...prev, attachments: [...prev.attachments, attachment] }));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'discussions':
        return (
          <FlatList
            data={discussions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.contentCard}>
                <Card.Content>
                  <View style={styles.contentHeader}>
                    <Avatar.Text size={32} label={item.author.name[0]} />
                    <View style={styles.contentMeta}>
                      <Text variant="titleSmall">{item.title}</Text>
                      <Text variant="bodySmall" style={styles.metaText}>
                        by {item.author.name} • {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodyMedium" style={styles.contentText}>
                    {item.content}
                  </Text>
                  {item.attachments.length > 0 && (
                    <View style={styles.attachmentsContainer}>
                      <Text variant="bodySmall" style={styles.attachmentsLabel}>Attachments:</Text>
                      {item.attachments.map((attachment) => (
                        <Chip key={attachment.id} mode="outlined" compact style={styles.attachmentChip}>
                          {attachment.name}
                        </Chip>
                      ))}
                    </View>
                  )}
                </Card.Content>
                <Card.Actions>
                  <Button mode="text" icon="comment">Reply ({item.replies})</Button>
                  <Button mode="text" icon="share">Share</Button>
                </Card.Actions>
              </Card>
            )}
            contentContainerStyle={styles.contentList}
          />
        );

      case 'announcements':
        return (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={[styles.contentCard, { borderLeftColor: item.priority === 'High' ? theme.colors.error : theme.colors.primary, borderLeftWidth: 4 }]}>
                <Card.Content>
                  <View style={styles.contentHeader}>
                    <Avatar.Text size={32} label={item.author.name[0]} />
                    <View style={styles.contentMeta}>
                      <Text variant="titleSmall">{item.title}</Text>
                      <View style={styles.announcementMeta}>
                        <Chip mode="outlined" compact style={styles.priorityChip}>
                          {item.priority}
                        </Chip>
                        <Text variant="bodySmall" style={styles.metaText}>
                          by {item.author.name} • {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text variant="bodyMedium" style={styles.contentText}>
                    {item.content}
                  </Text>
                  {item.attachments.length > 0 && (
                    <View style={styles.attachmentsContainer}>
                      <Text variant="bodySmall" style={styles.attachmentsLabel}>Attachments:</Text>
                      {item.attachments.map((attachment) => (
                        <Chip key={attachment.id} mode="outlined" compact style={styles.attachmentChip}>
                          {attachment.name}
                        </Chip>
                      ))}
                    </View>
                  )}
                </Card.Content>
                <Card.Actions>
                  <Button mode="text" icon="check">Mark as Read</Button>
                  <Button mode="text" icon="share">Share</Button>
                </Card.Actions>
              </Card>
            )}
            contentContainerStyle={styles.contentList}
          />
        );

      case 'media':
        return (
          <FlatList
            data={media}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.contentCard}>
                <Card.Content>
                  <View style={styles.mediaItem}>
                    <IconButton
                      icon={item.type === 'image' ? 'image' : 'file-document'}
                      size={32}
                      iconColor={theme.colors.primary}
                    />
                    <View style={styles.mediaInfo}>
                      <Text variant="titleSmall">{item.name}</Text>
                      <Text variant="bodySmall" style={styles.metaText}>
                        {item.type} • {item.size} • by {item.uploadedBy.name}
                      </Text>
                      <Text variant="bodySmall" style={styles.metaText}>
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button mode="text" icon="download">Download</Button>
                  <Button mode="text" icon="share">Share</Button>
                </Card.Actions>
              </Card>
            )}
            contentContainerStyle={styles.contentList}
          />
        );

      case 'votes':
        return (
          <FlatList
            data={votes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.contentCard}>
                <Card.Content>
                  <View style={styles.contentHeader}>
                    <Avatar.Text size={32} label={item.createdBy.name[0]} />
                    <View style={styles.contentMeta}>
                      <Text variant="titleSmall">{item.question}</Text>
                      <Text variant="bodySmall" style={styles.metaText}>
                        by {item.createdBy.name} • Expires {new Date(item.expiresAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.voteOptions}>
                    {item.options.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.voteOption}
                        onPress={() => !item.hasVoted && handleVote(item.id, index)}
                        disabled={item.hasVoted}
                      >
                        <View style={styles.voteOptionContent}>
                          <Text variant="bodyMedium">{option.text}</Text>
                          <Text variant="bodySmall" style={styles.voteCount}>
                            {option.votes} votes
                          </Text>
                        </View>
                        <View style={[styles.voteProgress, { width: `${(option.votes / Math.max(item.totalVotes, 1)) * 100}%` }]} />
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text variant="bodySmall" style={styles.voteTotal}>
                    Total votes: {item.totalVotes}
                  </Text>
                </Card.Content>
              </Card>
            )}
            contentContainerStyle={styles.contentList}
          />
        );

      case 'members':
        return (
          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.contentCard}>
                <Card.Content>
                  <View style={styles.memberItem}>
                    <Avatar.Text size={40} label={item.name[0]} />
                    <View style={styles.memberInfo}>
                      <Text variant="titleSmall">{item.name}</Text>
                      <Text variant="bodySmall" style={styles.metaText}>
                        {item.role} • Joined {new Date(item.joinedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {currentUser.role === 'admin' && item.id !== currentUser.id && (
                      <Menu
                        visible={false}
                        onDismiss={() => { }}
                        anchor={
                          <IconButton icon="dots-vertical" />
                        }
                      >
                        <Menu.Item onPress={() => assignRole(item.id, 'treasurer')} title="Make Treasurer" />
                        <Menu.Item onPress={() => assignRole(item.id, 'member')} title="Make Member" />
                        <Menu.Item onPress={() => { }} title="Remove from Group" />
                      </Menu>
                    )}
                  </View>
                </Card.Content>
              </Card>
            )}
            contentContainerStyle={styles.contentList}
          />
        );

      case 'requests':
        return (
          <FlatList
            data={joinRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.contentCard}>
                <Card.Content>
                  <Text variant="titleMedium">{item.name}</Text>
                  <Text variant="bodyMedium" style={styles.metaText}>
                    Business: {item.businessType} • Location: {item.location}
                  </Text>
                  <Text variant="bodyMedium" style={styles.metaText}>
                    Experience: {item.experience}
                  </Text>
                  <Text variant="bodyMedium" style={styles.contentText}>
                    {item.reason}
                  </Text>

                  <View style={styles.verificationInfo}>
                    <Text variant="titleSmall" style={styles.verificationTitle}>Verification Status:</Text>
                    <Text variant="bodySmall">Business License: {item.vendorProfile.businessLicense}</Text>
                    <Text variant="bodySmall">References: {item.vendorProfile.references}</Text>
                    <Chip mode="outlined" compact style={styles.statusChip}>
                      {item.vendorProfile.verificationStatus}
                    </Chip>
                  </View>
                </Card.Content>
                <Card.Actions>
                  <Button mode="outlined" onPress={() => handleJoinRequest(item.id, false)}>
                    Reject
                  </Button>
                  <Button mode="contained" onPress={() => handleJoinRequest(item.id, true)}>
                    Approve
                  </Button>
                </Card.Actions>
              </Card>
            )}
            contentContainerStyle={styles.contentList}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={4}>
        <Text style={styles.headerTitle}>Group Management</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Manage your groups and communities
        </Text>
      </Surface>

      {!selectedGroup ? (
        <View style={styles.groupsList}>
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.groupCard} onPress={() => setSelectedGroup(item)}>
                <Card.Content>
                  <View style={styles.groupHeader}>
                    <View style={styles.groupInfo}>
                      <Text variant="titleMedium">{item.name}</Text>
                      <Text variant="bodyMedium" style={styles.groupDescription}>
                        {item.description}
                      </Text>
                      <View style={styles.groupMeta}>
                        <Chip mode="outlined" compact>{item.category}</Chip>
                        <Text variant="bodySmall" style={styles.memberCount}>
                          {item.memberCount}/{item.maxMembers} members
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}
            contentContainerStyle={styles.groupsListContent}
          />

          <FAB
            icon="plus"
            style={styles.createGroupFab}
            onPress={() => setShowCreateGroup(true)}
            label="Create Group"
          />
        </View>
      ) : (
        <View style={styles.groupView}>
          <Surface style={styles.groupHeader} elevation={2}>
            <View style={styles.groupHeaderContent}>
              <IconButton
                icon="arrow-left"
                onPress={() => setSelectedGroup(null)}
                iconColor="white"
              />
              <View style={styles.groupHeaderInfo}>
                <Text style={styles.groupTitle}>{selectedGroup.name}</Text>
                <Text variant="bodyMedium" style={styles.groupSubtitle}>
                  {selectedGroup.memberCount} members • {selectedGroup.category}
                </Text>
              </View>
              <IconButton
                icon="account-group"
                onPress={() => setShowMemberManagement(true)}
                iconColor="white"
              />
            </View>
          </Surface>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
            {[
              { key: 'discussions', label: 'Discussions', icon: 'chat' },
              { key: 'announcements', label: 'Announcements', icon: 'bullhorn' },
              { key: 'media', label: 'Media', icon: 'folder' },
              { key: 'votes', label: 'Votes', icon: 'poll' },
              { key: 'members', label: 'Members', icon: 'account-group' },
              { key: 'requests', label: 'Requests', icon: 'account-plus' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                onPress={() => setActiveTab(tab.key)}
              >
                <IconButton icon={tab.icon} size={20} iconColor={activeTab === tab.key ? theme.colors.primary : theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {renderTabContent()}

          <View style={styles.floatingActions}>
            {activeTab === 'discussions' && (
              <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => setShowCreateDiscussion(true)}
                label="New Discussion"
              />
            )}
            {activeTab === 'announcements' && currentUser.role === 'admin' && (
              <FAB
                icon="bullhorn"
                style={styles.fab}
                onPress={() => setShowCreateAnnouncement(true)}
                label="New Announcement"
              />
            )}
            {activeTab === 'votes' && currentUser.role === 'admin' && (
              <FAB
                icon="poll"
                style={styles.fab}
                onPress={() => setShowCreateVote(true)}
                label="New Vote"
              />
            )}
          </View>
        </View>
      )}

      {/* Create Group Modal */}
      <Portal>
        <Modal
          visible={showCreateGroup}
          onDismiss={() => setShowCreateGroup(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Group</Text>

            <TextInput
              label="Group Name"
              value={groupForm.name}
              onChangeText={(text) => setGroupForm(prev => ({ ...prev, name: text }))}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={groupForm.description}
              onChangeText={(text) => setGroupForm(prev => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <View style={styles.inputRow}>
              <TextInput
                label="Max Members"
                value={groupForm.maxMembers.toString()}
                onChangeText={(text) => setGroupForm(prev => ({ ...prev, maxMembers: parseInt(text) || 100 }))}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.halfInput]}
              />
              <View style={[styles.input, styles.halfInput]}>
                <Menu
                  visible={false}
                  onDismiss={() => { }}
                  anchor={
                    <TouchableOpacity onPress={() => { }} style={styles.categorySelector}>
                      <Text>{groupForm.category}</Text>
                    </TouchableOpacity>
                  }
                >
                  {categories.map((category) => (
                    <Menu.Item
                      key={category}
                      onPress={() => setGroupForm(prev => ({ ...prev, category }))}
                      title={category}
                    />
                  ))}
                </Menu>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setShowCreateGroup(false)} style={styles.actionButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={createGroup} style={styles.actionButton}>
                Create Group
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Create Discussion Modal */}
      <Portal>
        <Modal
          visible={showCreateDiscussion}
          onDismiss={() => setShowCreateDiscussion(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start Discussion</Text>

            <TextInput
              label="Discussion Text"
              value={discussionForm.title}
              onChangeText={(text) => setDiscussionForm(prev => ({ ...prev, title: text }))}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Content"
              value={discussionForm.content}
              onChangeText={(text) => setDiscussionForm(prev => ({ ...prev, content: text }))}
              mode="outlined"
              multiline
              numberOfLines={5}
              style={styles.input}
            />

            <View style={styles.attachmentSection}>
              <Text variant="titleSmall">Attachments</Text>
              <View style={styles.attachmentButtons}>
                <Button mode="outlined" onPress={pickImage} icon="image" style={styles.attachmentButton}>
                  Image
                </Button>
                <Button mode="outlined" onPress={pickDocument} icon="file-document" style={styles.attachmentButton}>
                  Document
                </Button>
              </View>

              {discussionForm.attachments.map((attachment) => (
                <Chip key={attachment.id} mode="outlined" onClose={() => { }} style={styles.attachmentChip}>
                  {attachment.name}
                </Chip>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setShowCreateDiscussion(false)} style={styles.actionButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={createDiscussion} style={styles.actionButton}>
                Post Discussion
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Create Announcement Modal */}
      <Portal>
        <Modal
          visible={showCreateAnnouncement}
          onDismiss={() => setShowCreateAnnouncement(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Announcement</Text>

            <TextInput
              label="Announcement Text"
              value={announcementForm.title}
              onChangeText={(text) => setAnnouncementForm(prev => ({ ...prev, title: text }))}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Content"
              value={announcementForm.content}
              onChangeText={(text) => setAnnouncementForm(prev => ({ ...prev, content: text }))}
              mode="outlined"
              multiline
              numberOfLines={5}
              style={styles.input}
            />

            <View style={styles.inputRow}>
              <View style={[styles.input, styles.halfInput]}>
                <Menu
                  visible={false}
                  onDismiss={() => { }}
                  anchor={
                    <TouchableOpacity onPress={() => { }} style={styles.prioritySelector}>
                      <Text>{announcementForm.priority}</Text>
                    </TouchableOpacity>
                  }
                >
                  {['Low', 'Normal', 'High', 'Urgent'].map((priority) => (
                    <Menu.Item
                      key={priority}
                      onPress={() => setAnnouncementForm(prev => ({ ...prev, priority }))}
                      title={priority}
                    />
                  ))}
                </Menu>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setShowCreateAnnouncement(false)} style={styles.actionButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={createAnnouncement} style={styles.actionButton}>
                Post Announcement
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Create Vote Modal */}
      <Portal>
        <Modal
          visible={showCreateVote}
          onDismiss={() => setShowCreateVote(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Vote</Text>

            <TextInput
              label="Question"
              value={voteForm.question}
              onChangeText={(text) => setVoteForm(prev => ({ ...prev, question: text }))}
              mode="outlined"
              style={styles.input}
            />

            <View style={styles.voteOptionsSection}>
              <Text variant="titleSmall">Vote Options</Text>
              {voteForm.options.map((option, index) => (
                <View key={index} style={styles.voteOptionInput}>
                  <TextInput
                    label={`Option ${index + 1}`}
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...voteForm.options];
                      newOptions[index] = text;
                      setVoteForm(prev => ({ ...prev, options: newOptions }));
                    }}
                    mode="outlined"
                    style={styles.voteOptionField}
                  />
                  {voteForm.options.length > 2 && (
                    <IconButton
                      icon="delete"
                      onPress={() => {
                        const newOptions = voteForm.options.filter((_, i) => i !== index);
                        setVoteForm(prev => ({ ...prev, options: newOptions }));
                      }}
                    />
                  )}
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => setVoteForm(prev => ({ ...prev, options: [...prev.options, ''] }))}
                icon="plus"
              >
                Add Option
              </Button>
            </View>

            <TextInput
              label="Duration (days)"
              value={voteForm.duration.toString()}
              onChangeText={(text) => setVoteForm(prev => ({ ...prev, duration: parseInt(text) || 7 }))}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setShowCreateVote(false)} style={styles.actionButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={createVote} style={styles.actionButton}>
                Create Vote
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  groupsList: {
    flex: 1,
  },
  groupsListContent: {
    padding: 16,
  },
  groupCard: {
    marginBottom: 12,
    elevation: 2,
  },
  groupHeader: {
    flexDirection: 'row',
  },
  groupInfo: {
    flex: 1,
  },
  groupDescription: {
    color: theme.colors.onSurfaceVariant,
    marginVertical: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberCount: {
    color: theme.colors.onSurfaceVariant,
  },
  createGroupFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  groupView: {
    flex: 1,
  },
  groupHeader: {
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
    paddingBottom: 16,
  },
  groupHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  groupHeaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  groupTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupSubtitle: {
    color: 'white',
    opacity: 0.9,
  },
  tabContainer: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 20,
  },
  tabLabel: {
    marginTop: 4,
  },
  activeTabLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  contentList: {
    padding: 16,
    paddingBottom: 100,
  },
  contentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contentMeta: {
    flex: 1,
    marginLeft: 12,
  },
  metaText: {
    color: theme.colors.onSurfaceVariant,
  },
  contentText: {
    marginBottom: 12,
  },
  attachmentsContainer: {
    marginTop: 12,
  },
  attachmentsLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  attachmentChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  priorityChip: {
    backgroundColor: theme.colors.errorContainer,
  },
  mediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaInfo: {
    flex: 1,
    marginLeft: 12,
  },
  voteOptions: {
    marginTop: 12,
  },
  voteOption: {
    marginBottom: 8,
    position: 'relative',
  },
  voteOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  voteCount: {
    color: theme.colors.onSurfaceVariant,
  },
  voteProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
    borderRadius: 8,
  },
  voteTotal: {
    textAlign: 'center',
    marginTop: 12,
    fontWeight: 'bold',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  verificationInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
  },
  verificationTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  statusChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  floatingActions: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  fab: {
    backgroundColor: theme.colors.primary,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  categorySelector: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 4,
    padding: 16,
    justifyContent: 'center',
    height: 56,
  },
  prioritySelector: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: 4,
    padding: 16,
    justifyContent: 'center',
    height: 56,
  },
  attachmentSection: {
    marginBottom: 16,
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  attachmentButton: {
    flex: 1,
  },
  voteOptionsSection: {
    marginBottom: 16,
  },
  voteOptionInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  voteOptionField: {
    flex: 1,
    marginRight: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
  },
});
