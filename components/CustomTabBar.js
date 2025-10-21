"use client"

import { useRef, useEffect } from "react"
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated, Platform, StatusBar } from "react-native"
import { Icons } from "../constants/Icons";
import { AppContext } from '../context/appContext';
import { SafeAreaView } from 'react-native-safe-area-context'

const { width } = Dimensions.get("window")

export default function CustomTabBar({ state, descriptors, navigation, theme, isDarkMode }) {
    const tabWidth = width / state.routes.length

    // Animated value for the indicator position
    const indicatorPosition = useRef(new Animated.Value(0)).current

    // Update indicator position when active tab changes
    useEffect(() => {
        Animated.spring(indicatorPosition, {
            toValue: state.index * tabWidth,
            tension: 70,
            friction: 10,
            useNativeDriver: true,
        }).start()
    }, [state.index, tabWidth, indicatorPosition])

    return (
        <SafeAreaView edges={['bottom']}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} translucent={false} />
            <View
                style={[
                    styles.tabBar,
                    {
                        backgroundColor: theme.colors.card,
                        borderTopColor: theme.colors.border,
                        paddingBottom: Platform.OS === "ios" ? 20 : 0,
                        height: 48 + (Platform.OS === "ios" ? 20 : 0),
                    },
                ]}
            >
                {/* Animated indicator */}
                <Animated.View
                    style={[
                        styles.indicator,
                        {
                            width: tabWidth,
                            backgroundColor: theme.colors.indicator,
                            transform: [{ translateX: indicatorPosition }],
                        },
                    ]}
                />
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key]
                    const label = options.tabBarLabel || options.title || route.name
                    const isFocused = state.index === index

                    // Determine icon based on route name and focus state
                    let iconName
                    if (route.name === "Home") {
                        iconName = isFocused ? "home" : "home-outline"
                    } else if (route.name === "Countries") {
                        iconName = isFocused ? "business" : "business-outline"
                    } else if (route.name === "4IS") {
                        iconName = isFocused ? "heart" : "heart-outline"
                    } else if (route.name === "Profiles") {
                        iconName = isFocused ? "people-sharp" : "people-outline"
                    }

                    // Animation values for each tab
                    const scaleAnim = useRef(new Animated.Value(1)).current
                    const opacityAnim = useRef(new Animated.Value(0.7)).current

                    useEffect(() => {
                        Animated.parallel([
                            Animated.timing(scaleAnim, {
                                toValue: isFocused ? 1.2 : 1,
                                duration: 200,
                                useNativeDriver: true,
                            }),
                            Animated.timing(opacityAnim, {
                                toValue: isFocused ? 1 : 0.7,
                                duration: 200,
                                useNativeDriver: true,
                            }),
                        ]).start()
                    }, [isFocused, scaleAnim, opacityAnim])

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        })

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name)
                        }
                    }

                    const onLongPress = () => {
                        navigation.emit({
                            type: "tabLongPress",
                            target: route.key,
                        })
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                        >
                            <Animated.View
                                style={{
                                    transform: [{ scale: scaleAnim }],
                                    opacity: opacityAnim,
                                }}
                            >
                                <Icons.Ionicons name={iconName} size={24} color={isFocused ? theme.colors.indicator : theme.colors.text} />
                            </Animated.View>
                            <Text
                                style={[
                                    styles.tabLabel,
                                    {
                                        color: isFocused ? theme.colors.indicator : theme.colors.text,
                                        opacity: isFocused ? 1 : 0.7,
                                    },
                                ]}
                            >
                                {label}
                            </Text>

                        </TouchableOpacity>
                    )
                })}
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        borderTopWidth: 1,
        elevation: 8,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        position: "relative",
    },
    indicator: {
        height: 3,
        position: "absolute",
        top: 0,
        left: 0,
        borderRadius: 3,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 8,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: "500",
        marginTop: 4,
    },
    badge: {
        position: "absolute",
        top: 6,
        right: "25%",
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "bold",
    },
})

