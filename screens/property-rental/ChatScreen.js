"use client"

import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native"
import { useState } from "react"

const ChatScreen = ({ route, navigation }) => {
    const { agent } = route.params
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "agent",
            text: "Hi! I'm Gerd Muller. How can I help you with this property?",
            time: "12:20",
        },
        {
            id: 2,
            sender: "user",
            text: "I like the property, but the price is a bit above my budget. Would you consider a discount?",
            time: "12:30",
        },
        {
            id: 3,
            sender: "agent",
            text: "That works for me! Can we discuss any potential repairs or updates needed?",
            time: "12:35",
            highlight: true,
        },
    ])
    const [newMessage, setNewMessage] = useState("")

    const handleSend = () => {
        if (newMessage.trim()) {
            setMessages([
                ...messages,
                {
                    id: messages.length + 1,
                    sender: "user",
                    text: newMessage,
                    time: new Date().toLocaleTimeString().slice(0, 5),
                },
            ])
            setNewMessage("")
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.agentName}>{agent}</Text>
                    <Text style={styles.agentStatus}>Active 1 hour ago</Text>
                </View>
                <TouchableOpacity>
                    <Text style={styles.callButton}>📞</Text>
                </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <View style={[styles.messageRow, item.sender === "user" ? styles.userMessageRow : styles.agentMessageRow]}>
                        {item.sender === "agent" && (
                            <View style={styles.agentAvatar}>
                                <Text>👨</Text>
                            </View>
                        )}
                        <View
                            style={[
                                styles.messageBubble,
                                item.sender === "user" ? styles.userBubble : styles.agentBubble,
                                item.highlight && styles.highlightBubble,
                            ]}
                        >
                            <Text style={[styles.messageText, item.sender === "user" ? styles.userText : styles.agentText]}>
                                {item.text}
                            </Text>
                            <Text style={styles.timestamp}>{item.time}</Text>
                        </View>
                        {item.sender === "user" && (
                            <View style={styles.userAvatar}>
                                <Text>👤</Text>
                            </View>
                        )}
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.messagesList}
                showsVerticalScrollIndicator={false}
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#CCC"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <Text style={styles.sendIcon}>➤</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        fontSize: 24,
        color: "#1A1A1A",
        fontWeight: "600",
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    agentName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    agentStatus: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    callButton: {
        fontSize: 20,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    messageRow: {
        flexDirection: "row",
        marginBottom: 12,
        alignItems: "flex-end",
    },
    userMessageRow: {
        justifyContent: "flex-end",
    },
    agentMessageRow: {
        justifyContent: "flex-start",
    },
    agentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    userAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    messageBubble: {
        maxWidth: "75%",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    agentBubble: {
        backgroundColor: "#F0F0F0",
    },
    userBubble: {
        backgroundColor: "#1A1A1A",
    },
    highlightBubble: {
        backgroundColor: "#FF6B35",
    },
    messageText: {
        fontSize: 13,
        lineHeight: 18,
    },
    agentText: {
        color: "#1A1A1A",
    },
    userText: {
        color: "#FFFFFF",
    },
    timestamp: {
        fontSize: 11,
        color: "#999",
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        backgroundColor: "#FFFFFF",
        alignItems: "flex-end",
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 13,
        color: "#1A1A1A",
        maxHeight: 100,
    },
    sendButton: {
        width: 36,
        height: 36,
        backgroundColor: "#1A1A1A",
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    sendIcon: {
        fontSize: 18,
        color: "#FFFFFF",
    },
})

export default ChatScreen
