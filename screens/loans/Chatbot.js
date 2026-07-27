import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, ActivityIndicator, Dimensions, StatusBar
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../config/env";
import { AppContext } from "../../context/appContext";
import { Icons } from "../../constants/Icons";
import { AuthContext } from "../../context/authProvider";
import { Avatar } from 'react-native-paper';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// 1. WhatsAppPatternFallback responding to theme
const WhatsAppPatternFallback = () => {
  const { isDarkMode } = useContext(AppContext);

  // Dotted pattern color based on theme
  const dotColor = isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"; // Faint dots

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: isDarkMode ? "#111" : "#f0f0f0" }]}>
      <View style={styles.patternContainer}>
        {[...Array(50)].map((_, i) => (
          <View key={i} style={styles.patternRow}>
            {[...Array(20)].map((_, j) => (
              <View
                key={`${i}-${j}`}
                style={[
                  styles.patternDot,
                  {
                    backgroundColor: dotColor,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

// 2 & 3. Message Bubble Component with curved tails
const MessageBubble = ({ message, isUser, timestamp }) => {
  const { theme } = useContext(AppContext);

  return (
    <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
      <View
        style={[
          styles.bubble,
          isUser ? [styles.userBubble, { backgroundColor: theme.colors.primary || "#111827" }] : [styles.aiBubble, { backgroundColor: theme.colors.card || "#FFFFFF", borderColor: theme.colors.border }],
          isUser ? styles.userBubbleTail : styles.aiBubbleTail
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : [styles.aiText, { color: theme.colors.text }]]}>
          {message}
        </Text>
        <Text style={[styles.timestamp, { color: isUser ? "rgba(255,255,255,0.7)" : theme.colors.sub_text }]}>
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>

        {/* Tail implementation */}
        <View style={[
          styles.tailContainer,
          isUser ? styles.userTailPos : styles.aiTailPos
        ]}>
          <View style={[
            styles.tail,
            isUser ?
              { borderLeftColor: theme.colors.primary || "#111827" } :
              { borderRightColor: theme.colors.card || "#FFFFFF" },
            isUser ? styles.userTailShape : styles.aiTailShape
          ]} />
        </View>
      </View>
    </View>
  );
};

// Loading Bubble
const LoadingBubble = () => {
  const { theme } = useContext(AppContext);
  return (
    <View style={[styles.messageWrapper, styles.aiWrapper]}>
      <View style={[styles.bubble, styles.aiBubble, styles.aiBubbleTail, { backgroundColor: theme.colors.card || "#FFFFFF", borderColor: theme.colors.border }]}>
        <View style={styles.loadingDots}>
          <ActivityIndicator size="small" color={theme.colors.text} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Thinking...</Text>
        </View>
        <View style={[styles.tailContainer, styles.aiTailPos]}>
          <View style={[styles.tail, { borderRightColor: theme.colors.card || "#FFFFFF" }, styles.aiTailShape]} />
        </View>
      </View>
    </View>
  );
};

export default function Chatbot({ navigation, route }) {
  const { theme, isDarkMode } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const { context } = route.params;
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [inputHeight, setInputHeight] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef(null);

  useEffect(() => {
    greetClient();
  }, [context]);

  // Greet client and Start message
  const greetClient = () => {
    if (context !== '') {
      setIsLoading(true);
      try {
        const now = new Date();
        const hour = now.getHours();
        let greeting = "";

        if (hour >= 5 && hour < 12) greeting = "Good Morning";
        else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
        else if (hour >= 17 && hour < 21) greeting = " Good Evening";
        else greeting = "Hello";

        const message = `${greeting} ${user.displayName.toString()}, I'm your AI assistant to help you with advise and answers pertaining ${context?.category} of the ${context?.name} financial product kind.\n\nMy advise will be within the scope of data that I have from my listings.\n\nWhat would you want to know or ask about the ${context?.name}?`

        const aiReply = {
          id: (Date.now() + 1).toString(),
          text: message,
          isUser: false,
          timestamp: Date.now(),
        };

        // set timeout
        setTimeout(() => setMessages([aiReply]), 5000);
      } catch (e) {
        throw new Error(e)
      } finally {
        setIsLoading(false);
      }
    }
  }

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const introText = context !== '' ?
    `Hello again, I am your AI agent guider for assisting you with the opted ${context.name} of the ${context?.category} type.
     You can chat with me in writing about the opted financial product you may want advise on, and I will respond within my scope of data 
     that has been provided to me. Know that I may ask you questions as well to give you tailored advise for your specific needs I do not
     keep records of our convesations, or share them else where. Enjoy.
    `:
    `Hello again, I am your AI agent guider for assisting you with guidance on loans, investments as well as insurance policies.
      You can chat with me in writing about the opted financial product you may want advise on, and I will respond within my scope of data 
      that has been provided to me. Know that I may ask you questions as well to give you tailored advise for your specific needs I do not
      keep records of our convesations, or share them else where. Enjoy.
    `;

  const speak = async () => {
    try {
      if (isSpeaking && !isPaused) {
        Speech.stop();
        setIsPaused(true);
        return;
      }

      if (isPaused) {
        const remainingText = introText.substring(currentIndex);
        Speech.speak(remainingText, {
          language: "en-US",
          pitch: 1.0,
          rate: 0.95,
          volume: 1.0,
          onStart: () => {
            setIsSpeaking(true);
            setIsPaused(false);
          },
          onBoundary: (event) => {
            setCurrentIndex(currentIndex + event.charIndex);
          },
          onDone: () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setCurrentIndex(0);
          },
          onError: (err) => {
            console.log("Speech error:", err);
            setIsSpeaking(false);
            setIsPaused(false);
          },
        });
        return;
      }

      Speech.speak(introText, {
        language: "en-US",
        voice: "id-id-x-dfz#female_3-local",
        pitch: 1.0,
        rate: 0.95,
        volume: 1.0,
        onStart: () => {
          setIsSpeaking(true);
          setCurrentIndex(0);
        },
        onPause: () => {
          setIsPaused(true);
        },
        onResume: () => {
          setIsPaused(false);
        },
        onBoundary: (event) => {
          setCurrentIndex(event.charIndex);
        },
        onDone: () => {
          setIsSpeaking(false);
          setIsPaused(false);
          setCurrentIndex(0);
        },
        onError: (err) => {
          console.log("Speech error:", err);
          setIsSpeaking(false);
          setIsPaused(false);
        },
      });
    } catch (err) {
      console.log("speak: exception", err);
      setIsSpeaking(false);
      setIsPaused(false);
    }
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

    try {
      // const res = await fetch(`${API_BASE_URL}/api/ask-grok`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     message: userMessage.text,
      //     history: messages.map((msg) => ({
      //       role: msg.isUser ? "user" : "assistant",
      //       content: msg.text,
      //     })),
      //     context: context?.name || null,
      //     dealType: context?.category || null
      //   }),
      // });

      const res = await fetch(`${API_BASE_URL}/api/chat-deepseek`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          query: userMessage.text,
          chatHistory: messages.map((msg) => ({
            role: msg.isUser ? "user" : "assistant",
            content: msg.text,
          })),
        }),
      });

      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      const aiReply = {
        id: (Date.now() + 1).toString(),
        // text: data.reply || "Sorry, I couldn't process that.",
        text: data.answer || "Sorry, I couldn't process that.",
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
    if (item.isUser === undefined) return null;
    return <MessageBubble message={item.text} isUser={item.isUser} timestamp={item.timestamp} />;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <WhatsAppPatternFallback />

      {/* 4. KeyboardAware Input - behavior padding for iOS, height for Android */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
          <View style={{ justifyContent: 'space-around', gap: 10, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icons.Ionicons name="arrow-back" color={theme.colors.text} size={24} />
            </TouchableOpacity>
            {user.photoURL ? <Avatar.Image source={{ uri: user.photoURL }} size={30} /> : <Avatar.Icon size={30} icon="account" color={'#fff'} />}
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '200' }}>{user.displayName}</Text>
          </View>
          <TouchableOpacity onPress={speak} style={{ paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', borderRadius: 50, backgroundColor: theme.colors.card }}>
            {isSpeaking ?
              isPaused ? (
                <Icons.Ionicons name="play-circle-outline" size={24} color={theme.colors.text} />
              ) : (
                <Icons.Ionicons name="pause-circle-outline" size={24} color={theme.colors.text} />
              ) : (
                <Icons.FontAwesome name="microphone" size={24} color={theme.colors.text} />
              )}
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          style={styles.chatList}
          contentContainerStyle={[styles.chatContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        />

        {isLoading && <LoadingBubble />}

        {/* Input Bar - stays visible on top of keyboard */}
        <View style={[styles.inputContainer, { backgroundColor: 'transparent', paddingBottom: 0 }]}>
          <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <TextInput
              style={[
                styles.textInput,
                {
                  height: Math.max(40, Math.min(inputHeight, 120)),
                  color: theme.colors.text
                },
              ]}
              placeholder="Type here..."
              placeholderTextColor={theme.colors.text}
              value={inputText}
              onChangeText={setInputText}
              multiline
              onContentSizeChange={(e) =>
                setInputHeight(e.nativeEvent.contentSize.height)
              }
            />
          </View>

          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary || "#00A884" },
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
          >
            <Icons.Ionicons name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  chatList: { flex: 1 },
  patternContainer: { flex: 1, overflow: 'hidden' }, // Clip dots outside container
  patternRow: { flexDirection: "row" },
  patternDot: {
    width: 20, // Adjust size of squares
    height: 20,
    margin: 2, // Spacing between dots
    borderRadius: 2, // Slightly rounded corners for dots
  },

  chatList: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },

  messageWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 4,
    maxWidth: "100%",
  },
  aiWrapper: { alignSelf: "flex-start", paddingLeft: 10 },
  userWrapper: { alignSelf: "flex-end", paddingRight: 10 },

  bubble: {
    maxWidth: isTablet ? "75%" : "85%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  aiBubble: {
    borderWidth: 1,
  },
  userBubble: {},

  // Tail styles
  aiBubbleTail: { borderBottomLeftRadius: 2 },
  userBubbleTail: { borderBottomRightRadius: 2 },

  tailContainer: {
    position: 'absolute',
    bottom: 0,
    width: 10,
    height: 10,
  },
  aiTailPos: { left: -8 },
  userTailPos: { right: -8 },

  tail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderBottomWidth: 10,
  },
  aiTailShape: {
    borderLeftWidth: 0,
    borderRightWidth: 10,
    borderBottomColor: 'transparent',
  },
  userTailShape: {
    borderRightWidth: 0,
    borderLeftWidth: 10,
    borderBottomColor: 'transparent',
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: { color: "#FFFFFF" },

  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  loadingDots: { flexDirection: "row", alignItems: "center" },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    fontStyle: "italic",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 8,
    // marginBottom: Platform.OS === "ios" ? 0 : height * 0.06,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 8,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 16,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});
