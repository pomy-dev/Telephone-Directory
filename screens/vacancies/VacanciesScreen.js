"use client"

import { useMemo, useState } from "react"
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Platform,
    Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import SecondaryNav from "../../components/SecondaryNav"
import NativeAd from "../../components/NativeAd"

const WINDOW_HEIGHT = Dimensions.get("window").height
const ACCENT = "#000"
const SURFACE = "#FFFFFF"
const BACKGROUND = "#FFF"
const MUTED = "#9CA3AF"
const TEXT_PRIMARY = "#0F172A"

const JOBS = [
    {
        id: "1",
        title: "UX Designer",
        company: "TechHub Eswatini",
        location: "Mbabane, Eswatini",
        logo: null,
        initials: "T",
        color: "#f62222",
        salary: "E8,000 - E15,000",
        salaryFreq: "/month",
        experience: "3-5 years",
        jobType: "Full Time",
        description: "Join our UX team at TechHub Eswatini to craft amazing digital experiences for local businesses.",
        fullDescription: "TechHub Eswatini's UX team works across multiple projects to deliver user-centered design solutions, from research to prototypes, focusing on intuitive and accessible design.",
        qualifications: [
            "Bachelor's degree in Design, HCI, or a related field.",
            "3-5 years of UX design experience.",
            "Ability to lead end-to-end design projects."
        ],
    },
    {
        id: "2",
        title: "Copywriter",
        company: "MediaWorks Swaziland",
        location: "Manzini, Eswatini",
        logo: null,
        initials: "M",
        color: "#1E90FF",
        salary: "E6,000 - E12,000",
        salaryFreq: "/month",
        experience: "2-4 years",
        jobType: "Full Time",
        description: "Create compelling copy for digital and print campaigns for various brands in Swaziland.",
        fullDescription: "MediaWorks Swaziland requires a creative copywriter to craft impactful messaging across social media, web, and print, ensuring brand consistency and engagement.",
        qualifications: [
            "Bachelor's degree in Marketing, Communications, or related field.",
            "2-4 years of professional writing experience.",
            "Excellent grammar and storytelling skills."
        ],
    },
    {
        id: "3",
        title: "Chef",
        company: "Royal Swazi Hotel",
        location: "Mbabane, Eswatini",
        logo: null,
        initials: "R",
        color: "#FF8C00",
        salary: "E4,000 - E8,000",
        salaryFreq: "/month",
        experience: "3-5 years",
        jobType: "Full Time",
        description: "Prepare high-quality dishes in a luxury hotel setting.",
        fullDescription: "Royal Swazi Hotel is seeking a talented chef to create memorable culinary experiences, manage kitchen operations, and maintain the highest standards of hygiene and quality.",
        qualifications: [
            "Culinary degree or equivalent experience.",
            "3-5 years working in professional kitchens.",
            "Ability to manage a small team of kitchen staff."
        ],
    },
    {
        id: "4",
        title: "Product Manager",
        company: "SwaziTech Solutions",
        location: "Manzini, Eswatini",
        logo: null,
        initials: "S",
        color: "#32CD32",
        salary: "E10,000 - E20,000",
        salaryFreq: "/month",
        experience: "5-7 years",
        jobType: "Full Time",
        description: "Lead product strategy and development for software solutions in Swaziland.",
        fullDescription: "SwaziTech Solutions requires an experienced Product Manager to drive product vision, coordinate development, and ensure successful delivery of software projects that meet client needs.",
        qualifications: [
            "Bachelor's degree in Business, IT, or related field.",
            "5-7 years product management experience.",
            "Strong leadership and communication skills."
        ],
    },
    {
        id: "5",
        title: "Retail Store Manager",
        company: "Shoprite Swaziland",
        location: "Mbabane, Eswatini",
        logo: "https://www.shoprite.co.za/favicon.ico",
        initials: "S",
        color: "#FFD700",
        salary: "E5,000 - E10,000",
        salaryFreq: "/month",
        experience: "3-6 years",
        jobType: "Full Time",
        description: "Manage daily operations of a retail store and lead a team of staff.",
        fullDescription: "Shoprite Swaziland is looking for an organized and motivated Store Manager to oversee store operations, ensure excellent customer service, and drive sales performance.",
        qualifications: [
            "Proven retail management experience.",
            "Strong leadership skills.",
            "Good organizational and communication skills."
        ],
    },
    {
        id: "6",
        title: "Logistics Specialist",
        company: "Swazi Logistics",
        location: "Manzini, Eswatini",
        logo: null,
        initials: "S",
        color: "#8A2BE2",
        salary: "E6,000 - E12,000",
        salaryFreq: "/month",
        experience: "2-5 years",
        jobType: "Full Time",
        description: "Coordinate and optimize supply chain and transport operations.",
        fullDescription: "Swazi Logistics is seeking a Logistics Specialist to plan, coordinate, and improve logistics processes, ensuring timely and cost-effective delivery of goods.",
        qualifications: [
            "Degree in Logistics, Supply Chain, or related field.",
            "2-5 years of logistics experience.",
            "Excellent problem-solving skills."
        ],
    },
    {
        id: "7",
        title: "Nurse",
        company: "Mbabane Hospital",
        location: "Mbabane, Eswatini",
        logo: null,
        initials: "M",
        color: "#FF1493",
        salary: "E7,000 - E14,000",
        salaryFreq: "/month",
        experience: "2-6 years",
        jobType: "Full Time",
        description: "Provide patient care and assist in medical procedures at the hospital.",
        fullDescription: "Mbabane Hospital is looking for a compassionate and skilled nurse to deliver high-quality care, manage patient needs, and support doctors in clinical settings.",
        qualifications: [
            "Registered Nurse qualification.",
            "2-6 years of hospital experience.",
            "Strong communication and interpersonal skills."
        ],
    },
    {
        id: "8",
        title: "Electrician",
        company: "Eswatini Electrical Services",
        location: "Manzini, Eswatini",
        logo: null,
        initials: "E",
        color: "#00CED1",
        salary: "E5,000 - E9,000",
        salaryFreq: "/month",
        experience: "2-4 years",
        jobType: "Full Time",
        description: "Install, maintain, and repair electrical systems in residential and commercial spaces.",
        fullDescription: "Eswatini Electrical Services seeks an experienced Electrician to ensure safe installation and maintenance of electrical systems while following industry standards and regulations.",
        qualifications: [
            "Certified Electrician.",
            "2-4 years practical experience.",
            "Knowledge of safety codes and standards."
        ],
    },
    {
        id: "9",
        title: "Teacher",
        company: "St. Michael's High School",
        location: "Mbabane, Eswatini",
        logo: null,
        initials: "S",
        color: "#FFA500",
        salary: "E4,500 - E8,000",
        salaryFreq: "/month",
        experience: "3-5 years",
        jobType: "Full Time",
        description: "Teach students and prepare lesson plans in your subject area.",
        fullDescription: "St. Michael's High School requires qualified teachers to educate students, develop curriculum plans, and promote a positive learning environment.",
        qualifications: [
            "Teaching qualification.",
            "3-5 years classroom experience.",
            "Strong communication and organizational skills."
        ],
    },
    {
        id: "10",
        title: "Barista",
        company: "Coffee Spot Mbabane",
        location: "Mbabane, Eswatini",
        logo: null,
        initials: "C",
        color: "#FF4500",
        salary: "E3,000 - E5,500",
        salaryFreq: "/month",
        experience: "1-2 years",
        jobType: "Part Time",
        description: "Prepare and serve coffee and beverages while providing excellent customer service.",
        fullDescription: "Coffee Spot Mbabane is seeking a friendly Barista to craft coffee drinks, maintain equipment, and create a welcoming environment for customers.",
        qualifications: [
            "Experience as a barista or in customer service.",
            "Ability to work flexible hours.",
            "Good communication and interpersonal skills."
        ],
    },
]

const ADS = [
    {
        id: "ad1",
        brandName: "Swazi Telecom",
        title: "Get 50% off on installation!",
        description: "Limited offer for new subscribers.",
        cta: "Subscribe Now",
        catergory: "telecommunication",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYMDAWLG_u75RgvwzaQbIKDP-BZJ26iMY-gg&s"
    },
    {
        id: "ad2",
        brandName: "Hungry Lion",
        title: "Big Boss Cheese Meal - Only E50",
        description: "Get a Big Boss Cheese Meal For Only E50.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDmje78j3KWDjwzNhJliz-bH5khVfJli1EMw&s",
        category: "food",
        cta: "View Now"
    },
    {
        id: "ad3",
        brandName: "Lifestyle Awards",
        title: "Jumbo Khumalo",
        description: "Saturday 29 November 2025 Mavuso Sports center",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-paOdJnqRTA4f8lnz6qWDvtRFnL4dhf1a4w&s",
        category: "Event",
        cta: "Buy Now"
    },
]

const LogoComponent = ({ logoUrl, initials }) => {
    const [logoError, setLogoError] = useState(false)

    if (logoError || !logoUrl) {
        return (
            <View style={[styles.logo, styles.logoFallback]}>
                <Text style={styles.logoText}>{initials}</Text>
            </View>
        )
    }

    return <Image source={{ uri: logoUrl }} style={styles.logo} onError={() => setLogoError(true)} />
}

const JobCard = ({ item, bookmarked, onBookmark }) => {
    return (
        <View style={styles.jobItem}>
            <LogoComponent logoUrl={item.logo} initials={item.initials} />
            <View style={styles.jobContent}>
                <Text numberOfLines={1} style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.company}>{item.company}</Text>
                <Text style={styles.jobLocation}>{item.location}</Text>
                <Text style={styles.salary}>{item.salary}</Text>
            </View>
            <TouchableOpacity onPress={() => onBookmark(item.id)}>
                <Ionicons name={bookmarked[item.id] ? "bookmark" : "bookmark-outline"} size={20} color={bookmarked[item.id] ? ACCENT : MUTED} />
            </TouchableOpacity>
        </View>
    )
}

export default function VacanciesScreen({navigation}) {
    const [query, setQuery] = useState("")
    const [bookmarked, setBookmarked] = useState({})

    const handleBookmark = (id) => {
        setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const filtered = useMemo(() => {
        if (!query) return JOBS
        const q = query.toLowerCase()
        return JOBS.filter(
            (job) =>
                job.title.toLowerCase().includes(q) ||
                job.company.toLowerCase().includes(q) ||
                job.location.toLowerCase().includes(q),
        )
    }, [query])

    const dataWithAds = useMemo(() => {
        const result = []
        filtered.forEach((job, index) => {
            result.push({ type: "job", data: job })
            if ((index + 1) % 3 === 0 && ADS.length > 0) {
                const ad = ADS[index % ADS.length]
                result.push({ type: "ad", data: ad })
            }
        })
        return result
    }, [filtered])

    const renderItem = ({ item }) => {
        if (item.type === "job") return <TouchableOpacity onPress={()=>{navigation.navigate("VacancyDetailsScreen", {job: item.data})}}><JobCard item={item.data} bookmarked={bookmarked} onBookmark={handleBookmark} /></TouchableOpacity>
        if (item.type === "ad") return <NativeAd ads={[item.data]} />
        return null
    }

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <SecondaryNav title="Job Openings" rightIcon="notifications-outline" onRightPress={() => alert("Notifications!")} />
                <View>
                    <Text style={styles.title}>Apply Now</Text>
                    <Text style={styles.subtitle}>{filtered.length} vacancies available</Text>
                </View>
            </View>

            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={16} color={MUTED} />
                    <TextInput
                        placeholder="Search jobs, locations..."
                        placeholderTextColor={MUTED}
                        value={query}
                        onChangeText={setQuery}
                        style={styles.searchInput}
                        returnKeyType="search"
                    />
                </View>
            </View>

            <FlatList
                data={dataWithAds}
                keyExtractor={(item, index) => item.type + "_" + item.data.id + "_" + index}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: BACKGROUND, paddingTop: Platform.OS === "android" ? 24 : 48,
        paddingHorizontal: 16
    },
    header: {
        marginBottom: 20
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: TEXT_PRIMARY,
        marginBottom: 4
    },
    subtitle: {
        color: MUTED,
        fontSize: 14
    },
    searchRow: {
        marginBottom: 16
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: SURFACE,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E7EB"
    },
    searchInput: {
        marginLeft: 8,
        flex: 1,
        fontSize: 16,
        color: TEXT_PRIMARY
    },
    listContent: {
        paddingBottom: 40
    },
    jobItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: SURFACE,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 12,

        borderWidth: 1,

        borderColor: "#F0F0F0"
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12
    },
    logoFallback: {
        backgroundColor: ACCENT,
        justifyContent: "center",
        alignItems: "center"
    },
    logoText: {
        color: SURFACE,
        fontWeight: "700",
        fontSize: 18
    },
    jobContent: {
        flex: 1,
        marginRight: 12
    },
    jobTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: TEXT_PRIMARY,
        marginBottom: 2
    },
    company: {
        fontSize: 12,
        fontWeight: "500",
        color: MUTED,
        marginBottom: 2
    },
    jobLocation: {
        fontSize: 12,
        color: MUTED,
        marginBottom: 2
    },
    salary: {
        fontSize: 12,
        fontWeight: "600",
        color: ACCENT
    },
})
