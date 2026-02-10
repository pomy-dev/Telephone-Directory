import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator, SafeAreaView, Dimensions, Keyboard, StatusBar
} from "react-native";
import { API_BASE_URL } from "../../config/env";
import { AppContext } from "../../context/appContext";
import { Icons } from "../../constants/Icons";
import { AuthContext } from "../../context/authProvider";
import SecondaryNav from "../../components/SecondaryNav";
import { Avatar } from 'react-native-paper';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const WhatsAppPatternFallback = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <View style={styles.patternContainer}>
      {[...Array(50)].map((_, i) => (
        <View key={i} style={styles.patternRow}>
          {[...Array(20)].map((_, j) => (
            <View
              key={`${i}- ${j}`}
              style={[
                styles.patternDot,
                { opacity: (i + j) % 3 === 0 ? 0.08 : 0.04 },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
    <View style={styles.bgOverlay} />
  </View>
);

// Message Bubble Component
const MessageBubble = ({ message, isUser, timestamp }) => {
  return (
    <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      {!isUser && (
        <Icons.MaterialCommunityIcons
          name="face-agent"
          size={32}
          color="#111827"
          style={styles.avatar}
        />
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {message}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      {isUser && (
        <Icons.Ionicons
          name="person-circle"
          size={32}
          color="#111827"
          style={styles.avatar}
        />
      )}
    </View>
  );
};

// Loading Bubble (shown when AI is thinking)
const LoadingBubble = () => (
  <View style={[styles.messageWrapper, styles.aiWrapper]}>
    <Icons.MaterialCommunityIcons
      name="face-agent"
      size={32}
      color="#111827"
      style={styles.avatar}
    />
    <View style={[styles.bubble, styles.aiBubble]}>
      <View style={styles.loadingDots}>
        <ActivityIndicator size="small" color="#6B7280" />
        <Text style={styles.loadingText}>Thinking...</Text>
      </View>
    </View>
  </View>
);

export default function AIAgent({ navigation, route }) {
  const { theme, isDarkMode } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const { context, dealType } = route.params;
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputHeight, setInputHeight] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const flatListRef = useRef(null);

  // Initialize with welcome message
  useEffect(() => {
    if (context) {
      const intro = {
        id: "intro",
        text: `Hello ${user.displayName}, I'm your AI Financial Agent. How can I help with your ${context.type || "financial needs"} today?`,
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages([intro]);
    }
  }, [context]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setIsKeyboardOpen(true);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardOpen(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const introText = `Hello today, I am your AI agent guider for assisting you with the opted ${dealType} of the ${context?.productType}.
    You can chat with me in writing about the opted financial product you may want advise on, and I will respond within my scope of data 
    that has been provided to me. Know that I may ask you questions as well to give you tailored advise for your specific needs, but I do not
    keep records of our convesations, or share them else where. Enjoy.
  `;

  const listAllVoiceOptions = async () => {
    await Speech.getAvailableVoicesAsync()
      .then(voices => {
        console.log("Available voices:", voices);
        return voices;
      });
  }

  const speak = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    listAllVoiceOptions();

    setIsSpeaking(true);
    Speech.speak(introText, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.95,
      volume: 5.0,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onError: (err) => {
        console.log("Speech error:", err);
        setIsSpeaking(false)
      },
      onStopped: () => setIsSpeaking(false),
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`${API_BASE_URL}/api/ask-grok`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          history: messages.map((msg) => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text,
          })),
          context: context || null,
          dealType: dealType || null
        }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();

      const aiReply = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "Sorry, I couldn't process that.",
        isUser: false,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg = {
        id: new Date().toISOString(),
        text: error.message,
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.isUser === undefined) return null; // safety
    return <MessageBubble message={item.text} isUser={item.isUser} timestamp={item.timestamp} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <WhatsAppPatternFallback />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : isKeyboardOpen ? -50 : -80}
      >
        <View style={{ height: 25 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
          <View style={{ justifyContent: 'space-around', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icons.Ionicons name="arrow-back" color={theme.colors.text} size={24} />
            </TouchableOpacity>

            <Avatar.Icon size={30} icon="account" color={'#fff'} />
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: 200 }}>{user.displayName}</Text>
          </View>
          <TouchableOpacity onPress={speak} style={{ paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', borderRadius: 10, backgroundColor: theme.colors.card }}>
            {isSpeaking ?
              <Icons.Ionicons name="stop-circle-outline" color={theme.colors.text} size={26} />
              :
              <Icons.FontAwesome name="microphone" color={theme.colors.text} size={30} />}
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 100,
          }}
        />

        {/* Loading Indicator as a message bubble */}
        {isLoading && <LoadingBubble />}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.textInput,
                { height: Math.max(50, Math.min(inputHeight, 120)) },
              ]}
              placeholder="Type message / query..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              onContentSizeChange={(e) =>
                setInputHeight(e.nativeEvent.contentSize.height + 20)
              }
            />
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
          >
            <Icons.Ionicons name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  bgOverlay: { ...StyleSheet.absoluteFillObject },
  patternContainer: { flex: 1 },
  patternRow: { flexDirection: "row" },
  patternDot: { width: 30, height: 30, backgroundColor: "#075E54" },

  chatContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20, // Ensures last message is visible above input
  },

  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 6,
    maxWidth: "100%",
  },
  aiWrapper: { alignSelf: "flex-start" },
  userWrapper: { alignSelf: "flex-end" },

  avatar: { marginHorizontal: 8 },

  bubble: {
    maxWidth: isTablet ? "80%" : "90%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  userBubble: {
    backgroundColor: "#111827",
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: { color: "#111827" },
  userText: { color: "#FFFFFF" },

  timestamp: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
    alignSelf: "flex-end",
  },

  loadingDots: { flexDirection: "row", alignItems: "center" },
  loadingText: {
    marginLeft: 10,
    color: "#6B7280",
    fontSize: 15,
    fontStyle: "italic",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 50,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    maxHeight: 120,
    marginRight: 10,
  },
  textInput: {
    fontSize: 16,
    color: "#000",
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "center",
  },
  sendButton: {
    backgroundColor: "#00A884",
    width: 60,
    height: 60,
    padding: 0,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#94A3B8",
  },
});