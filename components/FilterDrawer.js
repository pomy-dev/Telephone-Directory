"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const FilterDrawer = ({ visible, onClose, onApplyFilters, initialFilters, categories }) => {
    const [filters, setFilters] = useState(
        initialFilters || {
            priceMin: "",
            priceMax: "",
            bedrooms: "",
            bathrooms: "",
            sqftMin: "",
            sqftMax: "",
            propertyType: "all",
        },
    )

    const propertyTypes = categories
        ? categories.map((cat) => ({
            id: cat.id,
            label: cat.name,
        }))
        : [
            { id: "all", label: "All" },
            { id: "houses", label: "Houses" },
            { id: "business", label: "Business Area" },
            { id: "hotel", label: "Hotels" },
            { id: "farm", label: "Farms" },
            { id: "plot", label: "Plots" },
            { id: "office", label: "Offices" },
        ]

    const handleApply = () => {
        onApplyFilters(filters)
        onClose()
    }

    const handleReset = () => {
        const resetFilters = {
            priceMin: "",
            priceMax: "",
            bedrooms: "",
            bathrooms: "",
            sqftMin: "",
            sqftMax: "",
            propertyType: "all",
        }
        setFilters(resetFilters)
        onApplyFilters(resetFilters)
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.drawer}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <Text style={styles.title}>Filters</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#0f172a" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Property Type</Text>
                            <View style={styles.typeGrid}>
                                {propertyTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[styles.typeButton, filters.propertyType === type.id && styles.typeButtonActive]}
                                        onPress={() => setFilters({ ...filters, propertyType: type.id })}
                                    >
                                        <Text
                                            style={[styles.typeButtonText, filters.propertyType === type.id && styles.typeButtonTextActive]}
                                        >
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Price Range</Text>
                            <View style={styles.row}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Min</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="$0"
                                        keyboardType="numeric"
                                        value={filters.priceMin}
                                        onChangeText={(text) => setFilters({ ...filters, priceMin: text })}
                                    />
                                </View>
                                <Text style={styles.separator}>-</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Max</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Any"
                                        keyboardType="numeric"
                                        value={filters.priceMax}
                                        onChangeText={(text) => setFilters({ ...filters, priceMax: text })}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Bedrooms</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Any"
                                keyboardType="numeric"
                                value={filters.bedrooms}
                                onChangeText={(text) => setFilters({ ...filters, bedrooms: text })}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Bathrooms</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Any"
                                keyboardType="numeric"
                                value={filters.bathrooms}
                                onChangeText={(text) => setFilters({ ...filters, bathrooms: text })}
                            />
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Square Feet</Text>
                            <View style={styles.row}>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Min</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        keyboardType="numeric"
                                        value={filters.sqftMin}
                                        onChangeText={(text) => setFilters({ ...filters, sqftMin: text })}
                                    />
                                </View>
                                <Text style={styles.separator}>-</Text>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Max</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Any"
                                        keyboardType="numeric"
                                        value={filters.sqftMax}
                                        onChangeText={(text) => setFilters({ ...filters, sqftMax: text })}
                                    />
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyButtonText}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    drawer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "85%",
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: "#e2e8f0",
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 12,
    },
    typeGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#fff",
    },
    typeButtonActive: {
        backgroundColor: "#0f172a",
        borderColor: "#0f172a",
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#64748b",
    },
    typeButtonTextActive: {
        color: "#fff",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    inputContainer: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: "#0f172a",
    },
    separator: {
        fontSize: 16,
        color: "#64748b",
        marginTop: 20,
    },
    footer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
        gap: 12,
    },
    resetButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        alignItems: "center",
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#64748b",
    },
    applyButton: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: "#0f172a",
        alignItems: "center",
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
})

export default FilterDrawer
