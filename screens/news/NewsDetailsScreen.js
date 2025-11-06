import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export default function NewsDetailScreen({ route, navigation }) {
    const { article } = route.params

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>News</Text>
                <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
                    <Ionicons name="share-outline" size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Featured Image */}
                <Image source={{ uri: article.imageUrl }} style={styles.heroImage} />

                {/* Article Content */}
                <View style={styles.content}>
                    {/* Source Info */}
                    <View style={styles.sourceRow}>
                        <Image source={{ uri: article.sourceLogo }} style={styles.sourceLogo} />
                        <View style={styles.sourceInfo}>
                            <Text style={styles.sourceName}>{article.source}</Text>
                            <View style={styles.metaRow}>
                                <Text style={styles.timeText}>{article.time}</Text>
                                <Text style={styles.dot}>•</Text>
                                <Text style={styles.readsText}>{article.reads}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Headline */}
                    <Text style={styles.headline}>{article.headline}</Text>

                    {/* Article Body */}
                    <Text style={styles.bodyText}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                        dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                        ea commodo consequat.
                    </Text>

                    <Text style={styles.bodyText}>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                        laborum.
                    </Text>

                    <Text style={styles.bodyText}>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem
                        aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </Text>

                    <Text style={styles.bodyText}>
                        Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
                        dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
                        sit amet.
                    </Text>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollView: {
        flex: 1,
    },
    heroImage: {
        width: "100%",
        height: 300,
        backgroundColor: "#f1f5f9",
    },
    content: {
        padding: 24,
    },
    sourceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 12,
    },
    sourceLogo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#f1f5f9",
    },
    sourceInfo: {
        flex: 1,
    },
    sourceName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    timeText: {
        fontSize: 14,
        color: "#94a3b8",
    },
    dot: {
        fontSize: 14,
        color: "#94a3b8",
    },
    readsText: {
        fontSize: 14,
        color: "#94a3b8",
    },
    headline: {
        fontSize: 28,
        fontWeight: "700",
        color: "#0f172a",
        lineHeight: 36,
        marginBottom: 24,
    },
    bodyText: {
        fontSize: 16,
        lineHeight: 26,
        color: "#475569",
        marginBottom: 20,
    },
})
