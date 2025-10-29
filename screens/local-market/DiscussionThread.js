// screens/DiscussionThreadScreen.js
import React, { useState, useContext } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Avatar, Card, IconButton, ActivityIndicator } from 'react-native-paper';
import { supabase } from '../../service/Supabase-Client';
import { AppContext } from '../../context/appContext';
import { AuthContext } from '../../context/authProvider';
import * as ImagePicker from 'expo-image-picker';

export default function DiscussionThreadScreen({ route, navigation }) {
  const { discussion } = route.params;
  const { theme } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [replies, setReplies] = useState(discussion.replies || []);
  const [replyText, setReplyText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickMedia = async () => {
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
        name: file.uri.split('/').pop()
      }]);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() && attachments.length === 0) return;

    setLoading(true);
    try {
      // Upload attachments
      const uploaded = await Promise.all(
        attachments.map(async (file) => {
          const { data, error } = await supabase.storage
            .from('discussion-media')
            .upload(`replies/${Date.now()}_${file.name}`, {
              uri: file.uri,
              type: file.type,
              name: file.name,
            }, { upsert: false });

          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage
            .from('discussion-media')
            .getPublicUrl(data.path);
          return { url: publicUrl, type: file.type };
        })
      );

      const { data, error } = await supabase
        .from('discussion_replies')
        .insert({
          discussion_id: discussion.id,
          content: replyText,
          author_name: user.name,
          author_email: user.email,
          attachments: uploaded
        })
        .select()
        .single();

      if (error) throw error;

      setReplies(prev => [...prev, data]);
      setReplyText('');
      setAttachments([]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        data={replies}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={{ margin: 8 }}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Avatar.Text size={32} label={item.author_name[0]} />
                <View style={{ marginLeft: 12 }}>
                  <Text variant="titleSmall">{item.author_name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
              <Text style={{ marginBottom: 8 }}>{item.content}</Text>
              {item.attachments?.map((att, i) => (
                <Image key={i} source={{ uri: att.url }} style={{ width: 200, height: 200, borderRadius: 8, marginTop: 4 }} />
              ))}
            </Card.Content>
          </Card>
        )}
        ListHeaderComponent={
          <Card style={{ margin: 16 }}>
            <Card.Content>
              <Text variant="titleLarge">{discussion.title}</Text>
              <Text style={{ marginVertical: 8 }}>{discussion.content}</Text>
            </Card.Content>
          </Card>
        }
      />

      <View style={{ padding: 12, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.outline }}>
        {attachments.map(att => (
          <View key={att.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Image source={{ uri: att.uri }} style={{ width: 40, height: 40, borderRadius: 4 }} />
            <Text style={{ marginLeft: 8, flex: 1 }}>{att.name}</Text>
            <IconButton icon="close" size={20} onPress={() => setAttachments(prev => prev.filter(a => a.id !== att.id))} />
          </View>
        ))}

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            mode="outlined"
            placeholder="Type your reply..."
            value={replyText}
            onChangeText={setReplyText}
            style={{ flex: 1, marginRight: 8 }}
            multiline
          />
          <IconButton icon="image" onPress={pickMedia} />
          <Button mode="contained" onPress={sendReply} loading={loading} disabled={loading}>
            Send
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}