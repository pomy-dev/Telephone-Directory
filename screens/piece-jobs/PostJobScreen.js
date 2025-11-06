"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import SecondaryNav from "../../components/SecondaryNav"
import { StatusBar } from "react-native"

const CATEGORIES = ["Moving", "Cleaning", "Handyman", "Delivery", "Gardening", "Pet Care", "Tech"]

const PostJobScreen = ({ navigation }) => {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState("")
    const [price, setPrice] = useState("")

    const handlePostJob = () => {
        if (!title || !description || !category || !price) {
            Alert.alert("Error", "Please fill in all fields")
            return
        }

        Alert.alert("Success", "Your gig has been posted successfully!", [
            {
                text: "OK",
                onPress: () => navigation.goBack(),
            },
        ])
    }

    return (
        <View style={styles.container}>
            <SecondaryNav title="Post a Gig" onBackPress={() => navigation.goBack()} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Job Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Help Moving Furniture"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe what you need help with..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Budget (R) *</Text>
                        <View style={styles.priceInputContainer}>
                            <Text style={styles.currencySymbol}>R</Text>
                            <TextInput
                                style={styles.priceInput}
                                placeholder="0"
                                value={price}
                                onChangeText={setPrice}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color="#3b82f6" />
                        <Text style={styles.infoText}>Your location will be automatically added from your saved address</Text>
                    </View>

                    <TouchableOpacity style={styles.imageButton}>
                        <Ionicons name="image-outline" size={24} color="#666" />
                        <Text style={styles.imageButtonText}>Add Photos (Optional)</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.postButton} onPress={handlePostJob}>
                    <Text style={styles.postButtonText}>Post Gig</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 30,
    },
    content: {
        flex: 1,
    },
    form: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: "#000",
        backgroundColor: "#fafafa",
    },
    textArea: {
        height: 120,
        paddingTop: 12,
    },
    categoriesScroll: {
        marginTop: 8,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    categoryChipActive: {
        backgroundColor: "#000",
        borderColor: "#000",
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#666",
    },
    categoryChipTextActive: {
        color: "#fff",
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: "#fafafa",
    },
    currencySymbol: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginRight: 8,
    },
    priceInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: "#000",
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#eff6ff",
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginBottom: 16,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#3b82f6",
        lineHeight: 18,
    },
    imageButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderStyle: "dashed",
        borderRadius: 12,
        paddingVertical: 20,
        gap: 8,
    },
    imageButtonText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#666",
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        backgroundColor: "#fff",
    },
    postButton: {
        backgroundColor: "#000",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    postButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
})

export default PostJobScreen
