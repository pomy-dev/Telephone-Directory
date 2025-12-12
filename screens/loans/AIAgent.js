import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Platform,
  Dimensions, Animated, ActivityIndicator, Keyboard, SafeAreaView,
} from "react-native";
import { API_BASE_URL } from "../../config/env";
import { AppContext } from "../../context/appContext";
import { Icons } from "../../constants/Icons";
import SecondaryNav from "../../components/SecondaryNav";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// Fallback: If you don't have the image yet, use this base64 pattern (WhatsApp-like)
const WhatsAppPatternFallback = () => (
  <View style={StyleSheet.absoluteFillObject}>
    <View style={styles.patternContainer}>
      {[...Array(50)].map((_, i) => (
        <View key={i} style={styles.patternRow}>
          {[...Array(20)].map((_, j) => (
            <View
              key={`${i}-${j}`}
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

// Message Bubble with Timestamp & Avatar
const MessageBubble = ({ message, isUser, timestamp }) => {
  return (
    <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      {!isUser && <Icons.MaterialCommunityIcons name="face-agent" size={28} color="#111827" style={styles.avatar} />}
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {message}
        </Text>
        <Text style={styles.timestamp}>{new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
      </View>
      {isUser && <Icons.Ionicons name="person-circle" size={28} color="#111827" style={styles.avatar} />}
    </View>
  );
};

export default function AIAgentChat({ route }) {
  const { theme } = React.useContext(AppContext);
  const { context } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [inputHeight, setInputHeight] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(60);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height + 52);
    });
    const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(60);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    if (context) {
      const intro = {
        id: "1",
        text: `Hello! I'm your AI Financial Agent. How can I help with your ${context.type || "financial needs"} today?`,
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages([intro]);
    }
  }, [context]);

  useEffect(() => {
    if (context) {
      setMessages([{
        id: "context",
        text: `Starting conversation about: ${context.type} from ${context.bank || context.company || "Provider"}`,
        isUser: false,
        timestamp: Date.now(),
      }]);
    }

    const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => flatListRef.current?.scrollToEnd({ animated: true }));
    return () => keyboardDidShow.remove();
  }, [context]);

  useEffect(() => {
    if (messages.length > 0) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  // Will have to use Redis Database
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    try {
      const userMsg = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMsg]);
      setInputText("");
      setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/ask-grok`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages.map(msg => ({ role: msg.isUser ? 'user' : 'model', text: msg.text })),
          context: context || null
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      const aiReply = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        isUser: false,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiReply]);
    } catch (error) {
      setIsLoading(false);
      console.error("Error sending message to AI agent:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <MessageBubble message={item.text} isUser={item.isUser} timestamp={item.timestamp} />
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* WhatsApp-style Background */}
      <WhatsAppPatternFallback />
      <View style={{ height: 25 }} />
      <SecondaryNav title="AI Financial Agent" />

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        style={{ maxWidth: isTablet ? "80%" : "100%", alignSelf: "center" }} // Responsive width for tablets
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#111827" />
          <Text style={styles.loadingText}>AI is responding...</Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.inputBar,
          {
            bottom: keyboardHeight, // This is the magic line
            paddingBottom: Platform.OS === "ios" ? 10 : 0,
          },
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.input, { height: Math.max(50, Math.min(inputHeight, 120)) }]}
            placeholder="Message AI Agent..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height + 20)}
          />
        </View>
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Icons.Ionicons name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// Enhanced Styles for Responsiveness
const styles = StyleSheet.create({
  container: { flex: 1 },
  bgOverlay: { ...StyleSheet.absoluteFillObject },
  patternContainer: { flex: 1 },
  patternRow: { flexDirection: "row" },
  patternDot: { width: 30, height: 30, backgroundColor: "#075E54" },

  chatList: { paddingHorizontal: 0, paddingVertical: 8, paddingBottom: 220 },
  messageWrapper: { flexDirection: "row", alignItems: "flex-end", marginVertical: 8 },
  userWrapper: { justifyContent: "flex-end" },
  aiWrapper: { justifyContent: "flex-start" },
  avatar: { marginHorizontal: 8 },
  messageContainer: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessage: { backgroundColor: "#111827", alignSelf: "flex-end" },
  aiMessage: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E7EB", alignSelf: "flex-start" },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: "#FFFFFF" },
  aiText: { color: "#111827" },
  timestamp: { fontSize: 12, color: "#9CA3AF", marginTop: 4, alignSelf: "flex-end" },
  inputBar: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingTop: 4,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    marginRight: 8,
    paddingHorizontal: 16,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    color: "#000",
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendBtn: {
    backgroundColor: "#00A884",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    alignSelf: "flex-start",
    marginLeft: 16,
    marginVertical: 8,
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  loadingText: { marginLeft: 8, color: "#6B7280", fontSize: 14 },
});