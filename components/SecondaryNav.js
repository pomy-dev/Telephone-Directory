"use client"

import React from "react"
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AppContext } from "../context/appContext"
import { useNavigation } from "@react-navigation/native"
import { useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function SecondaryNav({
    title,
    rightIcon,
    onRightPress,
    showLocation = false,
}) {
    const { theme } = React.useContext(AppContext)
    const navigation = useNavigation()
    const [location, setLocation] = useState("")

    useEffect(() => {
        if (showLocation) loadLocation()
    }, [showLocation])

    const loadLocation = async () => {
        try {
            const savedLocation = await AsyncStorage.getItem("userLocation")
            if (savedLocation) setLocation(savedLocation)
        } catch (error) {
            console.log("Error loading location:", error)
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Left Back Button */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={26} color="#1A1A1A" />
            </TouchableOpacity>

            {/* Title or Location */}
            <View style={styles.centerContent}>
                {showLocation ? (
                    <View style={{ alignItems: "center" }}>
                        <Text style={styles.smallLabel}>Deliver to</Text>
                        <Text style={styles.locationText} numberOfLines={1}>
                            {location || "Fetching..."}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.titleText} numberOfLines={1}>
                        {title}
                    </Text>
                )}
            </View>

            {/* Right Icon (Optional) */}
            {rightIcon ? (
                <TouchableOpacity onPress={onRightPress} style={styles.iconButton} activeOpacity={0.7}>
                    <Ionicons name={rightIcon} size={24} color="#1A1A1A" />
                </TouchableOpacity>
            ) : (
                <View style={styles.iconPlaceholder} />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 6,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    iconButton: {
        padding: 8,
    },
    iconPlaceholder: {
        width: 40, // keeps layout consistent if no right icon
    },
    centerContent: {
        flex: 1,
        alignItems: "center",
    },
    titleText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    smallLabel: {
        fontSize: 12,
        color: "#8E8E93",
    },
    locationText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1A1A1A",
        maxWidth: 180,
    },
})
