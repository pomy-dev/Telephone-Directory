import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  View, Image
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
} from 'react-native-paper';
import DiscussionThreadScreen from './DiscussionThread';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import CustomLoader from '../../components/customLoader';
import { CustomToast } from '../../components/customToast';
import { Icons } from '../../constants/Icons';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import { uploadAttachments } from '../../service/uploadFiles';
import { fetchUserGroups, insertDiscussion, fetchDiscussion } from '../../service/Supabase-Fuctions'

const { width } = Dimensions.get('window');

export default function GroupManagementScreen({ navigation }) {
  const { theme, isDarkMode } = React.useContext(AppContext)
  const { user } = React.useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discussions');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [media, setMedia] = useState([]);
  const [votes, setVotes] = useState([]);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false);
  const [showCreateVote, setShowCreateVote] = useState(false);
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [isPickImage, setIsPickImage] = useState(false);
  const [isTakePhoto, setIsTakePhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [discussionForm, setDiscussionForm] = useState({
    group_id: null,
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
  const [announcementReads, setAnnouncementReads] = useState(new Set());

  const [voteForm, setVoteForm] = useState({
    question: '',
    options: ['Yes', 'No'],
    duration: 7, // days
    allowMultiple: false
  });
  const [moreVisible, setMoreVisible] = React.useState(false);
  const openMoreMenu = () => setMoreVisible(true);
  const closeMoreMenu = () => setMoreVisible(false);

  const currentUser = {
    id: '1',
    name: 'John Doe',
    role: 'admin', // admin, treasurer, member
    avatar: null
  };

  useEffect(() => {
    if (selectedGroup && user?.email) {
      loadAnnouncementReads();
    }
  }, [selectedGroup, user]);

  useEffect(() => {
    loadGroups();
    if (selectedGroup) {
      loadGroupData();
    }
  }, [selectedGroup, user]);

  useEffect(() => {
    const channel = supabase
      .channel(`discussions_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_discussions',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDiscussions(prev => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [groupId]);

  const loadAnnouncementReads = async () => {
    const { data } = await supabase
      .from('announcement_reads')
      .select('announcement_id')
      .eq('user_email', user.email);
    setAnnouncementReads(new Set(data?.map(d => d.announcement_id) || []));
  };

  const loadGroups = async () => {
    try {
      setIsLoading(true)
      const groups = await fetchUserGroups(user.email);
      // console.log('My Groups:', groups.length);
      setGroups(groups);
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  };

  const loadGroupData = async () => {
    if (!selectedGroup) return;

    const discussions = await fetchDiscussion(selectedGroup.id)
    setDiscussions(discussions || []);
    // setDiscussions([
    //   {
    //     id: '1',
    //     title: 'Weekly Bulk Order Meeting',
    //     content: 'Let\'s discuss our weekly bulk order for vegetables. Who\'s interested in joining?',
    //     author: { name: 'Thabo Dlamini', avatar: null },
    //     createdAt: '2024-01-15',
    //     replies: 5,
    //     attachments: []
    //   }
    // ]);

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

  const createDiscussion = async () => {
    try {
      setIsSubmitting(true)
      if (!discussionForm.title.trim()) {
        Alert.alert('Error', 'Discussion title is required');
        return;
      }

      const uploadedAttachments = await uploadAttachments(discussionForm.attachments);

      const newDiscussion = {
        ...discussionForm,
        groupId: selectedGroup.id,
        attachments: uploadedAttachments.map(a => a.url),
        authorEmail: user.email
      };

      uploadedAttachments.map(a => console.log(a.url))

      const response = await insertDiscussion(newDiscussion);

      // setDiscussions(prev => [...prev, newDiscussion]);

      if (response.status === 200) CustomToast('Success', 'Discussion Started successful');

    } catch (err) {
      console.error('Create discussion error:', err);
      Alert.alert('Error', err.message || 'Failed to create discussion');
    } finally {
      setIsSubmitting(false)
      setShowCreateDiscussion(false);
      setDiscussionForm({ title: '', content: '', attachments: [] });
    }
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
    try {
      setIsPickImage(true)

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const attachment = {
          id: Date.now().toString(),
          name: result.assets[0]?.fileName,
          type: result.assets[0].mimeType,
          uri: result.assets[0].uri,
          size: result.assets[0].fileSize
        };

        if (activeTab === 'discussions') {
          setDiscussionForm(prev => ({ ...prev, attachments: [...prev.attachments, attachment] }));
        } else if (activeTab === 'announcements') {
          setAnnouncementForm(prev => ({ ...prev, attachments: [...prev.attachments, attachment] }));
        }
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsPickImage(false)
    }
  };

  const pickDocument = async () => {
    try {
      setIsTakePhoto(true)
      // Step 1: Open document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = new File(result.assets[0]);
      if (!file) return;

      // Step 2: Get file info using FileSystem
      // console.log(file.name);

      // Step 3: Build your attachment object
      const attachment = {
        id: Date.now(),
        name: file.name,
        type: 'document',
        uri: file.uri,
        size: file.size
          ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
          : 'Unknown size',
      };

      // Step 4: Add attachment based on active tab
      if (activeTab === 'discussions') {
        setDiscussionForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, attachment],
        }));
      } else if (activeTab === 'announcements') {
        setAnnouncementForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, attachment],
        }));
      }
    } catch (error) {
      console.error('Error picking or reading file:', error);
    } finally {
      setIsTakePhoto(false)
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
              <TouchableOpacity onPress={() => { }}>
                <Card style={[styles.contentCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => navigation.navigate('DiscussionThread', { discussion: item })}
                >
                  <Card.Content>
                    <View style={styles.contentHeader}>
                      <Avatar.Text size={32} label={item.author.name[0]} />
                      <View style={styles.contentMeta}>
                        <Text variant="titleSmall">{item.title}</Text>
                        <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
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
              </TouchableOpacity>
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
                        <Chip mode="outlined" compact style={[styles.priorityChip, { backgroundColor: theme.colors.errorContainer, }]}>
                          {item.priority}
                        </Chip>
                        <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
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
                  <Button mode="text" icon={announcementReads.has(item.id) ? "check" : "eye"}
                    onPress={async () => {
                      await supabase.rpc('mark_announcement_read', {
                        p_announcement_id: item.id,
                        p_user_email: user.email
                      });
                      setAnnouncementReads(prev => new Set(prev).add(item.id));
                    }}
                  >
                    {announcementReads.has(item.id) ? "Read" : "Mark as Read"}
                  </Button>
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
                      <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                        {item.type} • {item.size} • by {item.uploadedBy.name}
                      </Text>
                      <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
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
                      <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
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
                        <View style={[styles.voteOptionContent, { backgroundColor: theme.colors.surfaceVariant }]}>
                          <Text variant="bodyMedium">{option.text}</Text>
                          <Text variant="bodySmall" style={[styles.voteCount, { color: theme.colors.onSurfaceVariant }]}>
                            {option.votes} votes
                          </Text>
                        </View>
                        <View style={[styles.voteProgress, { width: `${(option.votes / Math.max(item.totalVotes, 1)) * 100}%`, backgroundColor: theme.colors.primary, }]} />
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
                      <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
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
                  <Text variant="bodyMedium" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                    Business: {item.businessType} • Location: {item.location}
                  </Text>
                  <Text variant="bodyMedium" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                    Experience: {item.experience}
                  </Text>
                  <Text variant="bodyMedium" style={styles.contentText}>
                    {item.reason}
                  </Text>

                  <View style={[styles.verificationInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
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

  const handleRemoveAttachment = (id) => {
    setDiscussionForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((item) => item.id !== id),
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      {isLoading && <CustomLoader />}

      <View style={[styles.header, { borderColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.Ionicons name='arrow-back' size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerUtils}>
          {(user && user.picture)
            ? (
              <Avatar.Image
                size={30}
                source={{ uri: user.picture }}
              />
            ) : (
              <Icons.Ionicons name="person-circle-outline" size={30} color={theme.colors.indicator} />
            )}

          <TouchableOpacity style={{}} onPress={() => { }}>
            <Icons.MaterialCommunityIcons name='magnify' size={30} color={theme.colors.text} />
          </TouchableOpacity>

          <Menu
            visible={moreVisible}
            onDismiss={closeMoreMenu}
            contentStyle={{ backgroundColor: theme.colors.card }}
            anchor={
              <TouchableOpacity style={{}} onPress={openMoreMenu}>
                <Icons.Entypo name='dots-three-vertical' size={24} color={theme.colors.text} />
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { /* Handle action 1 */ }} title="Item 1" titleStyle={{ color: theme.colors.text }} />
            <Menu.Item onPress={() => { /* Handle action 2 */ }} title="Item 2" titleStyle={{ color: theme.colors.text }} />
            <Menu.Item onPress={() => { /* Handle action 3 */ }} title="Item 3" titleStyle={{ color: theme.colors.text }} />
          </Menu>
        </View>
      </View>

      {!selectedGroup ? (
        <View style={styles.groupsList}>
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.groupItem, { borderColor: theme.colors.border, backgroundColor: theme.colors.card }]}
                onPress={() => setSelectedGroup(item)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                  {(item.profile_image_url !== null && item.profile_image_url !== '')
                    ? (
                      <Avatar.Image
                        source={{ uri: item.profile_image_url }}
                        style={[styles.groupImg, { backgroundColor: theme.colors.primary }]}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={[styles.groupImg, { backgroundColor: theme.colors.primary }]}>
                        <Icons.FontAwesome6 name="people-group" size={60} color={theme.colors.indicator} />
                      </View>
                    )}
                  <View style={{ flexDirection: 'column', justifyContent: 'flex-start', gap: 10, padding: 10 }}>
                    <Text variant="titleMedium">{item.group_name}</Text>
                    {item.is_private && <Icons.MaterialCommunityIcons name='book-lock-outline' size={15} color={theme.colors.error} />}
                  </View>
                </View>

                <>
                  <Text variant="bodyMedium" style={[styles.groupDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {item.description}
                  </Text>
                  <View style={styles.groupMeta}>
                    <Chip mode="outlined" compact>{item.category}</Chip>
                    <Text variant="bodySmall" style={[styles.memberCount, { color: theme.colors.onSurfaceVariant, }]}>
                      {item.members.length}/{item.max_members} members
                    </Text>
                  </View>
                </>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.groupsListContent}
          />
        </View>
      ) : (
        <View style={styles.groupView}>
          <Surface style={[styles.groupHeader, { backgroundColor: theme.colors.primary, }]} elevation={2}>
            <View style={styles.groupHeaderContent}>
              <View>
                <Text style={styles.groupTitle}>{selectedGroup.group_name}</Text>
                <Text variant="bodyMedium" style={styles.groupSubtitle}>
                  {selectedGroup.members?.length} members • {selectedGroup.category}
                </Text>
              </View>
              {/* <TouchableOpacity onPress={() => navigation.goBack()}> */}
              <Icons.FontAwesome6
                name="people-group"
                size={20}
                onPress={() => setShowMemberManagement(true)}
                color="#FFFFFF"
              />
              {/* </TouchableOpacity> */}

            </View>
            <Avatar.Image source={{ uri: selectedGroup.profile_image_url }} style={{ marginRight: 16 }} />
          </Surface>

          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ backgroundColor: theme.colors.surface }]}>
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
                  style={[styles.tab, activeTab === tab.key && styles.activeTab, {
                    backgroundColor: theme.colors.primaryContainer
                  }]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <IconButton icon={tab.icon} size={20} iconColor={activeTab === tab.key ? theme.colors.primary : theme.colors.sub_text} />
                  <Text variant="bodySmall" style={[activeTab === tab.key ? styles.activeTabLabel : styles.tabLabel]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {renderTabContent()}

          <View style={styles.floatingActions}>
            {activeTab === 'discussions' && (
              <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: theme.colors.sub_card }]}
                onPress={() => setShowCreateDiscussion(true)}
                label="New Discussion"
              />
            )}
            {activeTab === 'announcements' && currentUser.role === 'admin' && (
              <FAB
                icon="bullhorn"
                style={[styles.fab, { backgroundColor: theme.colors.sub_card }]}
                onPress={() => setShowCreateAnnouncement(true)}
                label="New Announcement"
              />
            )}
            {activeTab === 'media' && currentUser.role === 'admin' && (
              <FAB
                icon="upload"
                style={styles.fab}
                onPress={async () => {
                  const file = await DocumentPicker.getDocumentAsync({ type: '*/*' });
                  if (file.type === 'success') {
                    const { data } = await supabase.storage
                      .from('group-media')
                      .upload(`group_${selectedGroup.id}/${Date.now()}_${file.name}`, {
                        uri: file.uri,
                        type: file.mimeType,
                        name: file.name,
                      });
                    // Refresh media
                    loadGroupData();
                  }
                }}
                label="Upload Media"
              />
            )}
            {activeTab === 'votes' && currentUser.role === 'admin' && (
              <FAB
                icon="poll"
                style={[styles.fab, { backgroundColor: theme.colors.sub_card }]}
                onPress={() => setShowCreateVote(true)}
                label="New Vote"
              />
            )}
          </View>
        </View>
      )}

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
              placeholder="Discussion Text"
              value={discussionForm.title}
              onChangeText={(text) => setDiscussionForm(prev => ({ ...prev, title: text }))}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              placeholder="Content"
              value={discussionForm.content}
              onChangeText={(text) => setDiscussionForm(prev => ({ ...prev, content: text }))}
              mode="outlined"
              multiline
              style={[styles.input, { textAlignVertical: 'top', minHeight: 60, maxHeight: 80 }]}
            />

            <View style={styles.attachmentSection}>
              <Text variant="titleSmall">Attachments</Text>
              <View style={styles.attachmentButtons}>
                <TouchableOpacity style={styles.imageOption} onPress={pickImage}>
                  {isPickImage
                    ? <ActivityIndicator animating={true} color='#4F46E5' />
                    : <Icons.Ionicons name='images-outline' size={24} color="#4F46E5" />
                  }
                  <Text style={styles.imageOptionText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.imageOption} onPress={pickDocument}>
                  {isTakePhoto
                    ? <ActivityIndicator animating={true} color='#4F46E5' />
                    : <Icons.Ionicons name='document-attach-outline' size={24} color="#4F46E5" />
                  }
                  <Text style={styles.imageOptionText}>Files</Text>
                </TouchableOpacity>
              </View>

              {discussionForm.attachments.map((attachment) => (
                <Chip key={attachment.id} mode="outlined" onClose={() => handleRemoveAttachment(attachment.id)} style={styles.attachmentChip}>
                  {attachment.name}
                </Chip>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button mode="outlined" onPress={() => setShowCreateDiscussion(false)}
                style={[styles.actionButton, styles.cancelButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.sub_card }]}
                theme={{ colors: { primary: theme.colors.indicator } }}
              >
                Cancel
              </Button>

              <Button mode="contained" onPress={createDiscussion}
                style={[styles.actionButton, styles.submitButton]}
                theme={{ colors: { primary: theme.colors.indicator } }}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
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
                    <TouchableOpacity onPress={() => { }} style={[styles.prioritySelector, { borderColor: theme.colors.outline }]}>
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
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1
  },
  headerUtils: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    gap: 30
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  groupsList: {
    flex: 1,
    marginBottom: 40
  },
  groupImg: {
    borderRadius: 10
  },
  groupsListContent: {
    paddingVertical: 16,
    marginBottom: 20
  },
  groupItem: {
    marginBottom: 5,
    elevation: 1,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 16,
  },
  groupDescription: {
    marginVertical: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  createGroupFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  groupView: {
    flex: 1,
  },
  groupHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12
  },
  groupTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupSubtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 16
  },
  activeTab: {
    borderRadius: 20,
  },
  tabLabel: {
    color: '#747373dd',
    marginTop: 1,
  },
  activeTabLabel: {
    color: '#003366',
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
    margin: 4,
  },
  announcementMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
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
    borderRadius: 8,
  },
  voteProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
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
    bottom: 60,
    right: 16,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    color: '#6b7280',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
    borderRadius: 4,
    padding: 16,
    justifyContent: 'center',
    height: 56,
  },
  prioritySelector: {
    borderWidth: 1,
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
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 8,
    flex: 0.48,
  },
  imageOptionText: {
    marginLeft: 8,
    color: '#4F46E5',
    fontWeight: '500',
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
    borderRadius: 8,
    paddingVertical: 4,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
});
