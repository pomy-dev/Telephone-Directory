import React, { useState, useContext, useEffect } from 'react';
import {
  SafeAreaView, View, StatusBar,
  TextInput, KeyboardAvoidingView, Platform,
  Image, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Modal
} from 'react-native';
import { Button, Avatar, Card, IconButton, ActivityIndicator, Menu, Text, Surface } from 'react-native-paper';
import { uploadAttachments } from '../../service/uploadFiles';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import { File } from 'expo-file-system';
import { Icons } from '../../constants/Icons';
import * as ImagePicker from 'expo-image-picker';
import CustomLoader from '../../components/customLoader';
import { replyDiscussion, getDiscussionReplies } from '../../service/Supabase-Fuctions';
import { CustomToast } from '../../components/customToast';

export default function DiscussionThreadScreen({ navigation, route }) {
  const { discussion } = route.params;
  const { theme, isDarkMode } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [isPickImage, setIsPickImage] = useState(false);
  const [isTakePhoto, setIsTakePhoto] = useState(false);
  const [moreVisible, setMoreVisible] = React.useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const openMoreMenu = () => setMoreVisible(true);
  const closeMoreMenu = () => setMoreVisible(false);

  useEffect(() => {
    if (!discussion?.id) return;
    loadReplies()
  }, [discussion?.id]);// Re-run when discussionId changes

  const loadReplies = async () => {
    try {
      setIsLoading(true)
      const replies = await getDiscussionReplies(discussion.id)
      replies.length > 0 ? setReplies(replies) : setReplies([])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const pickMedia = async () => {
    try {
      setIsPickImage(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        setAttachments(prev => [...prev, {
          id: Date.now().toString(),
          uri: file.uri,
          type: file.type,
          name: file.fileName
        }]);
      }
    } catch (err) {
      console.error(err)
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

      setAttachments(prev => [...prev, attachment]);

    } catch (error) {
      console.error('Error picking or reading file:', error);
    } finally {
      setIsTakePhoto(false)
    }
  };

  const pickFile = async () => {
    Alert.alert('Pick Attachment', 'Want to attach image or file?',
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Image",
          onPress: () => pickMedia(),
          style: "default"
        },
        {
          text: "File",
          onPress: () => pickDocument(),
          style: "default"
        },
      ],
      {
        cancelable: true
      }
    )
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;

    setIsLoading(true);
    try {
      // Upload attachments
      const uploadedAttachments = await uploadAttachments(attachments);

      const memberReply = {
        discussionId: discussion.id,
        content: replyText,
        author: user.name,
        userEmail: user.email,
        attachments: uploadedAttachments.map(a => a.url),
      }

      const newReplyId = await replyDiscussion(memberReply);

      newReplyId && CustomToast('Sent', 'Reply went successfully')

    } catch (err) {
      CustomToast('Error', err.message)
    } finally {
      setReplyText('');
      setAttachments([]);
      setIsLoading(false);
    }
  };

  const getFileIcon = (file) => {
    const uri = file.uri || file.url || '';
    const name = file.name || uri;

    const ext = name.split('.').pop().toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'aac', 'ogg', 'flac'].includes(ext)) return 'music';
    if (['pdf'].includes(ext)) return 'file-pdf-box';
    if (['doc', 'docx'].includes(ext)) return 'file-word-box';
    if (['xls', 'xlsx'].includes(ext)) return 'file-excel-box';
    if (['ppt', 'pptx'].includes(ext)) return 'file-powerpoint-box';
    if (['zip', 'rar', '7z'].includes(ext)) return 'folder-zip';
    if (['txt', 'csv', 'json', 'xml'].includes(ext)) return 'file-document';
    return 'file';
  };

  const getIcon = (uri) => {
    const ext = uri.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return (
      <Icons.EvilIcons name='image' size={50} color={theme.colors.indicator} />
    );
    if (['pdf'].includes(ext)) return (
      <Icons.MaterialCommunityIcons name='file-pdf-box' size={50} color={theme.colors.indicator} />
    );
    if (['doc', 'docx'].includes(ext)) return (
      <Icons.MaterialCommunityIcons name='file-word-box' size={50} color={theme.colors.indicator} />
    );
    if (['xls', 'xlsx'].includes(ext)) return (
      <Icons.MaterialCommunityIcons name='file-excel-box' size={50} color={theme.colors.indicator} />
    );
    if (['mp4', 'mov', 'avi'].includes(ext)) return (
      <Icons.Entypo name='video' size={50} color={theme.colors.indicator} />
    );
    return (
      <Icons.FontAwesome name='file-text' size={50} color={theme.colors.indicator} />
    );
  };

  // Open attachment depending on type
  const handleOpenAttachment = async (uri) => {
    const ext = uri.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      setSelectedAttachment(uri);
      setPreviewVisible(true);
    } else {
      // For docs, PDFs, videos → open with system viewer or Office
      try {
        await WebBrowser.openBrowserAsync(uri);
      } catch (err) {
        console.error('Failed to open file', err);
      }
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />

        {isPickImage || isTakePhoto || isLoading && <CustomLoader />}

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
              <Menu.Item onPress={() => { }} title="Item 1" titleStyle={{ color: theme.colors.text }} />
              <Menu.Item onPress={() => { }} title="Item 2" titleStyle={{ color: theme.colors.text }} />
              <Menu.Item onPress={() => { }} title="Item 3" titleStyle={{ color: theme.colors.text }} />
            </Menu>
          </View>
        </View>

        <Surface style={[styles.groupHeader, { backgroundColor: theme.colors.primary, }]} elevation={2}>
          <Card style={{ margin: 5, backgroundColor: theme.colors.card }}>
            <Card.Content>
              <Text variant="titleLarge">{discussion.title}</Text>
              <Text style={{ marginVertical: 8 }}>{discussion.content}</Text>
              <View style={styles.userPost}>
                <Icons.AntDesign name='user' size={20} color={theme.colors.text} />
                <Text variant="bodySmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
                  Posted by {discussion?.author_name} • {new Date(discussion?.created_at).toLocaleDateString()}
                </Text>
              </View>
            </Card.Content>
          </Card>
        </Surface>

        <View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
            {replies?.map((reply, index) => {
              return (
                <Card style={{ margin: 8 }} key={index}>
                  <Card.Content>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Avatar.Text size={32} label={reply?.author_name[0]} />
                      <View style={{ marginLeft: 12 }}>
                        <Text variant="titleSmall">{reply?.author_name}</Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {new Date(reply?.created_at).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <Text>{reply?.content}</Text>

                    {/* Attachments */}
                    {reply?.attachments?.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                        {reply.attachments.map((att, i) => (
                          <TouchableOpacity
                            key={i}
                            onPress={() => handleOpenAttachment(att)}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 8,
                              backgroundColor: theme.colors.surfaceVariant,
                              justifyContent: 'center',
                              alignItems: 'center',
                              position: 'relative',
                            }}
                          >
                            {getIcon(att)}
                            <IconButton
                              icon="eye"
                              size={18}
                              style={{
                                position: 'absolute',
                                bottom: -8,
                                right: -8,
                                backgroundColor: theme.colors.primaryContainer,
                              }}
                              iconColor={'#d10f86ff'}
                              onPress={() => handleOpenAttachment(att)}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.replySection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.attachmentsContainer}>
            {attachments?.map((att) => {
              const icon = getFileIcon(att);
              const isImage = icon === 'image' || icon === 'video';
              return (
                <View key={att.id} style={[styles.attachmentItem, {
                  backgroundColor: theme.colors.surfaceVariant
                }]}>
                  {isImage ? (
                    <Image
                      source={{ uri: att.uri }}
                      style={styles.attachmentThumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.iconWrapper, { backgroundColor: theme.colors.surface }]}>
                      <IconButton icon={icon} size={32} />
                    </View>
                  )}

                  <View style={styles.fileInfo}>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={[styles.fileName, { color: theme.colors.onSurface }]}>
                      {att.name}
                    </Text>
                    {att.size && (
                      <Text style={[styles.fileSize, { color: theme.colors.onSurfaceVariant }]}>
                        {att.size}
                      </Text>
                    )}
                  </View>

                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() =>
                      setAttachments(prev => prev.filter(a => a.id !== att.id))
                    }
                  />
                </View>
              );
            })}
          </View>

          <View style={[styles.composerContainer, {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant
          }]}>
            {/* Attach and Media Icons */}
            <IconButton
              icon="paperclip"
              size={22}
              onPress={pickFile}
              style={styles.iconButton}
            />

            {/* Text Input */}
            <TextInput
              placeholder="Type a message"
              value={replyText}
              onChangeText={setReplyText}
              multiline
              style={styles.input}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
            />

            {/* Send Button */}
            <IconButton
              icon={isLoading ? 'progress-clock' : 'send'}
              size={22}
              mode="contained"
              onPress={sendReply}
              disabled={isLoading || (!replyText.trim() && attachments.length === 0)}
              style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
              iconColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* Modal for Image Preview */}
        <Modal visible={previewVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={{ uri: selectedAttachment }}
              style={{ width: '90%', height: '80%', resizeMode: 'contain' }}
            />
            <IconButton
              icon="close"
              size={30}
              iconColor="white"
              onPress={() => setPreviewVisible(false)}
              style={{ position: 'absolute', top: 40, right: 20 }}
            />
          </View>
        </Modal>

      </SafeAreaView>
    </KeyboardAvoidingView>
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
  userPost: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '10',
    justifyContent: 'flex-end', gap: 10
  },
  replySection: {
    padding: 12, borderTopWidth: 1
  },
  attachmentsContainer: {
    marginTop: 8,
    paddingVertical: 4,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  attachmentThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 2,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  iconButton: {
    margin: 0,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    marginHorizontal: 3,
  },
  sendButton: {
    borderRadius: 25,
    marginBottom: 4,
  },
})