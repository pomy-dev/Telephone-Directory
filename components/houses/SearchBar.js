import { View, TextInput, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function SearchBar({ onSearch, placeholder = "Search properties..." }) {
    return (
        <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder={placeholder}
                placeholderTextColor="#bbb"
                onChangeText={onSearch}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 16,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#1a1a1a",
    },
})
