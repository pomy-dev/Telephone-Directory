import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CategoryScroll({
    categories,
    selectedCategory,
    onSelectCategory,
    activeColor,
    activeTextColor
}) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {categories.map((category) => {
                const isActive = category.id === selectedCategory;
                return (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.category,
                            isActive && { backgroundColor: activeColor }
                        ]}
                        onPress={() => onSelectCategory(category.id)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                isActive && { color: activeTextColor, fontWeight: '700' }
                            ]}
                        >
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        gap: 8,
    },
    category: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
});
