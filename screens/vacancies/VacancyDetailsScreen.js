"use client"

import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, Dimensions } from "react-native"
import { ChevronLeft, DollarSign, Clock, Briefcase } from "react-native-feather"
import SecondaryNav from "../../components/SecondaryNav"

const { width } = Dimensions.get("window")

export default function VacancyDetailsScreen({ navigation, route }) {
    const [expanded, setExpanded] = useState(false)

    // Sample job data - replace with route params
    const job = route?.params?.job || {
        id: 1,
        title: "UX Designer",
        company: "Google",
        location: "New York",
        logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%7BB6595618-BF5F-4360-8661-6A2EE4683A8E%7D-ByE8mlBQGhT03inrWxR1LXj2rbeuuJ.png",
        salary: "$18 - $34k",
        salaryFreq: "/month",
        experience: "8-10+ years",
        jobType: "Full Time",
        description:
            "Google User Experience (UX) is made up of multi-disciplinary teams of Designers, Researchers, Writers, Content Strategists, Program Managers, and Engineers. We work across all of Google to envision new ways for people who use our products. The UX team plays an integral part in shaping Google's vision for the future of the user experience across all of Google's products.",
        qualifications: [
            "Bachelor's degree in Design, Human Computer Interaction, a related field, or equivalent practical experience.",
            "8 years of experience in UX designing.",
            "Experience leading at least one end-to-end design initiative dealing with ambiguity, and driving projects forward.",
        ],
        fullDescription:
            "Google User Experience (UX) is made up of multi-disciplinary teams of Designers, Researchers, Writers, Content Strategists, Program Managers, and Engineers who work across all of Google to envision new ways for people who use our products. The UX team plays an integral part in shaping Google's vision for the future of the user experience across all of Google's products.",
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {/* Header with Back Button */}
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                    }}
                >
                    <SecondaryNav title={`${job.title} Vacancy`} rightIcon="notifications-outline" onRightPress={() => alert("Notifications!")} />

                </View>

                {/* Pink Header Section */}
                <View
                    style={{
                        backgroundColor: "#000",
                        paddingVertical: 24,
                        paddingHorizontal: 16,
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 12,
                            backgroundColor: "#FFFFFF",
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 16,
                            overflow: "hidden",
                        }}
                    >
                        <Image source={{ uri: job.logo }} style={{ width: 80, height: 80 }} resizeMode="cover" />
                    </View>
                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: "700",
                            color: "#FFFFFF",
                            marginBottom: 4,
                        }}
                    >
                        {job.title}
                    </Text>
                    <Text
                        style={{
                            fontSize: 16,
                            color: "rgba(255, 255, 255, 0.9)",
                        }}
                    >
                        {job.company}, {job.location}
                    </Text>
                </View>

                {/* Stats Section */}
                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 20,
                        backgroundColor: "#FAFAFA",
                        borderBottomWidth: 1,
                        borderBottomColor: "#F0F0F0",
                    }}
                >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                        {/* Salary Stat */}
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#FFFFFF",
                                borderRadius: 8,
                                padding: 12,
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor: "#E8E8E8",
                            }}
                        >
                            <DollarSign width={20} height={20} />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#000",
                                    marginTop: 8,
                                }}
                            >
                                {job.salary}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: "#888",
                                    marginTop: 4,
                                }}
                            >
                                {job.salaryFreq}
                            </Text>
                        </View>

                        {/* Experience Stat */}
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#FFFFFF",
                                borderRadius: 8,
                                padding: 12,
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor: "#E8E8E8",
                            }}
                        >
                            <Briefcase width={20} height={20} />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#000",
                                    marginTop: 8,
                                }}
                            >
                                {job.experience}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: "#888",
                                    marginTop: 4,
                                }}
                            >
                                Experience
                            </Text>
                        </View>

                        {/* Job Type Stat */}
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "#FFFFFF",
                                borderRadius: 8,
                                padding: 12,
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor: "#E8E8E8",
                            }}
                        >
                            <Clock width={20} height={20} />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: "#000",
                                    marginTop: 8,
                                }}
                            >
                                {job.jobType}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: "#888",
                                    marginTop: 4,
                                }}
                            >
                                Type
                            </Text>
                        </View>
                    </View>
                </View>

                {/* About the Job Section */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: "#000",
                            marginBottom: 12,
                        }}
                    >
                        About the job
                    </Text>
                    <Text
                        style={{
                            fontSize: 15,
                            lineHeight: 24,
                            color: "#444",
                            marginBottom: 12,
                        }}
                    >
                        {expanded ? job.fullDescription : job.description}
                    </Text>
                    <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "#000",
                            }}
                        >
                            {expanded ? "See Less" : "See More"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Minimum Qualifications Section */}
                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 20,
                        backgroundColor: "#FAFAFA",
                        borderTopWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: "#F0F0F0",
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: "#000",
                            marginBottom: 16,
                        }}
                    >
                        Minimum qualifications:
                    </Text>
                    {job.qualifications.map((qual, index) => (
                        <View key={index} style={{ flexDirection: "row", marginBottom: 12 }}>
                            <Text
                                style={{
                                    fontSize: 16,
                                    color: "#000",
                                    fontWeight: "600",
                                    marginRight: 10,
                                }}
                            >
                                •
                            </Text>
                            <Text
                                style={{
                                    flex: 1,
                                    fontSize: 15,
                                    lineHeight: 22,
                                    color: "#444",
                                }}
                            >
                                {qual}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Spacing before button */}
                <View style={{ height: 20 }} />
            </ScrollView>

            {/* Floating Apply Button */}
            <View
                style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 1,
                    borderTopColor: "#F0F0F0",
                }}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: "#000",
                        paddingVertical: 16,
                        borderRadius: 8,
                        alignItems: "center",
                    }}
                    onPress={() => {
                        // Handle apply action
                        console.log("Apply for position:", job.title)
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: "#FFFFFF",
                        }}
                    >
                        Apply Now
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
