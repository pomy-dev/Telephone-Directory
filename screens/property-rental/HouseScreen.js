"use client"

import React, { useState, useMemo, useRef } from "react"
import {
    Platform,
    StyleSheet,
    Text,
    View,
    StatusBar,
    ScrollView,
    FlatList,
    Dimensions,
    TouchableOpacity,
} from "react-native"
import { useNavigation } from "@react-navigation/native"

// Components
import SecondaryNav from "../../components/SecondaryNav"
import MiniPropertyCard from "../../components/houses/MiniPropertyCard"
import FeaturedPropertyCard from "../../components/houses/FeaturedPropertyCard"
import SearchBar from "../../components/houses/SearchBar"
import CategoryScroll from "../../components/houses/CategoryScroll"
import NativeAd from "../../components/NativeAd"
import PropertyDrawer from "../../components/houses/PropertyDrawer"
import FilterDrawer from "../../components/FilterDrawer"

const { width } = Dimensions.get("window")

export default function HouseScreen() {
    const [selectedCategory, setSelectedCategory] = useState(1)
    const [selectedProperty, setSelectedProperty] = useState(null)
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false)
    const drawerRef = useRef(null)
    const [filters, setFilters] = useState({
        priceMin: null,
        priceMax: null,
        sqmMin: null,
        sqmMax: null,
        hectaresMin: null,
        hectaresMax: null,
        propertyType: null,
        location: null,
        hasFindersFee: null,
        requiresDeposit: null,
    })
    const navigation = useNavigation()

    const sampleAds = [
        {
            id: 1,
            title: "Premium Real Estate Services",
            description: "Get the best deals on properties",
            imageUrl: "https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?w=400&h=300&fit=crop",
            brandName: "RealEstate Pro",
            cta: "Learn More",
            category: "real-estate",
        },
        {
            id: 2,
            title: "Jumbo Khumalo",
            description: "E250 general early-bird",
            imageUrl: "https://kulture.co.sz/wp-content/uploads/2024/11/464006962_1107220101407512_3480094717842543124_n-894x1024.jpg",
            brandName: "Jumbo Khumalo",
            cta: "Buy Now",
            category: "Event",
        },
    ]


    const allProperties = [
        {
            id: 1,
            title: "Spacious Bedsitter near Mhlaleni",
            location: "Manzini, Mhlaleni",
            price: "1080",
            rentalPeriod: "Monthly",
            findersFee: 450,
            depositRequired: true,
            depositPercentage: 100,
            description: "Large one-bedroom room near Siphumelele primary school",
            images: null,
            type: "Bedsitter",
            amenities: ["Water & Electricity Included", "Kids Allowed", "Fenced Property", "Own Gate Keys"],
            lat: -26.5225,
            lng: 31.4659,
            agent: {
                id: 1,
                name: "Abel Buthelezi",
                title: "Property Agent",
                avatar: "https://via.placeholder.com/50",
                phone: "76604450",
                email: "abel@realestate.sz",
                whatsapp: "76604450",
                license: "RES-2024-001",
                bio: "Experienced property agent with over 5 years in real estate.",
                experience: 5,
                specializations: ["Residential", "Bedsitters", "Quick Sales"],
                rating: 4.8,
                reviews: 24,
                propertiesCount: 12,
                soldCount: 8,
            },
        },
        {
            id: 2,
            title: "Zone 6 Mahwalala",
            location: "Zone 6 Mahwalala",
            price: "2500",
            rentalPeriod: "Monthly",
            findersFee: null,
            depositRequired: true,
            depositPercentage: 50,
            description: "2 - Bedroom house available fully fitted house with bathtub",
            images: [
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/584342060_1723625144889686_6611397138437500745_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=109&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=Iq_gE_tGlKQQ7kNvwH7a6x1&_nc_oc=Adm6PQ4YTHIFsCQWC6nURwE8HuxOolAGq4WoYuvCXU-nDx0cYeDBxZnzjOPSdIWQyWI&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=RwlbSDqaZSBcoN9J-3LJtw&oh=00_AfhA9JEZcR-8FWxbKQKPkq5wsDFqOq6gcSLoTnqlXWOCGw&oe=691E0D27",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/584327976_1723625254889675_1567504740600252455_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=101&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=ORfu7YMlFqsQ7kNvwG4FnYe&_nc_oc=AdkCM7Mof1zS_DFOPIGS1tVw3oFNDbhmIBKmVmB6Ua-Ve6uqVa4sAIzallID_5-x5Ds&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=RwlbSDqaZSBcoN9J-3LJtw&oh=00_AfjTdTgfsdPlqnZOglvI4WjYp_3ZbnR6PHuzmoBxZCwbnA&oe=691E08CE",
            ],
            type: "House",
            amenities: ["Bathtub", "Fully fitted"],
            lat: -26.52,
            lng: 31.465,
            agent: {
                id: 2,
                name: "Nomcebo Dlamini",
                title: "Senior Real Estate Agent",
                avatar: "https://via.placeholder.com/50",
                phone: "76123456",
                email: "nomcebo@realestate.sz",
                whatsapp: "76123456",
                license: "RES-2023-045",
                bio: "Professional real estate agent with 8 years of experience.",
                experience: 8,
                specializations: ["Residential", "Commercial", "Property Management"],
                rating: 4.9,
                reviews: 42,
                propertiesCount: 28,
                soldCount: 15,
            },
        },
        {
            id: 3,
            title: "Manzini Madonsa 3bedroom House",
            location: "Manzini, Madonsa",
            price: "430k",
            rentalPeriod: "For Sale",
            findersFee: 0,
            depositRequired: false,
            depositPercentage: 0,
            description: "Modern luxury apartment with premium finishes",
            images: [
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/580891275_1286725736828685_7343458423475828161_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=6mIKQtJ5ZzwQ7kNvwFRQY2h&_nc_oc=Adk98HaXlFYk5q-PDmRRJbWj0qmrPk7WC0gL6imHC8ipTmGGUnTO6fKyPXo1niH3kL0&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=9T5J94Np28qMK05MLKsJqA&oh=00_Afj-ksE8Kj0C8N-Yd8lQ-9QDKn8hWiw8yicjWyPlvvr2AA&oe=691E14DD",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/581425901_1286725803495345_3186688365814478935_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=b12HAFluveAQ7kNvwEwZjxz&_nc_oc=AdlcPYGydbF40pwBhf2DYq-6LAAgX01DEwCDoBL0HzpJcSYOMnpAJoNitabz0e-xql4&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=9T5J94Np28qMK05MLKsJqA&oh=00_AfhBiKajGJ0m4K2w_LNIWs-kQeDfXwr-Fc546QfrggMdJw&oe=691E1597"
            ],
            type: "House",
            sqm: 120,
            beds: 2,
            baths: 2,
            amenities: ["Spacious", "Fitted", "Gate"],
            lat: -26.515,
            lng: 31.47,
            agent: {
                id: 3,
                name: "Thabo Nkosi",
                title: "Luxury Properties Specialist",
                avatar: "https://via.placeholder.com/50",
                phone: "74555555",
                email: "thabo@luxuryrealestate.sz",
                whatsapp: "74555555",
                license: "RES-2022-089",
                bio: "Expert in luxury real estate and high-end properties.",
                experience: 12,
                specializations: ["Luxury", "Commercial", "Investment"],
                rating: 4.7,
                reviews: 38,
                propertiesCount: 45,
                soldCount: 22,
            },
        },
        {
            id: 4,
            title: "5000 sqm SNL Plot for Sale",
            location: "Nhlambeni",
            price: "200k",
            rentalPeriod: "For Sale",
            findersFee: 1400,
            depositRequired: false,
            description: "Take advantage of this spacious 5000 sqm flat SNL plot, perfectly positioned in the serene Nhlambeni area. The property is fully fenced and located about 500 metres from the tarred road, offering both accessibility and peace. Surrounded by high-end residences, this plot provides an excellent opportunity for a private homestead",
            images: [
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/580026588_1552169169250790_164924316104495724_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=b6NzpcnsqXYQ7kNvwE5d0x2&_nc_oc=AdndnhLgTSc2RmofHxpoJERu6ShuWPWzCCm7lmN09gdt0OIMsY1cDkz4Gg5fYIYEpV4&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=9bTd9Ezn02rlpWZqfy8UgQ&oh=00_AfhUh6i3hULxDQjGGqimQOlPlHjRwlPau4rEdlkcIx5Tvg&oe=691E04AB",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/580614723_1552169425917431_6390893106948460471_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_ohc=G6oCHuS-PlkQ7kNvwFzrjGV&_nc_oc=Admbndxs4bTBqPWq-uFzvhtsXoJXKTilRWsLGhf3N9W9D4kpnleXbhY9zX_y8bQ3dyA&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=9bTd9Ezn02rlpWZqfy8UgQ&oh=00_AfhuDKjUQzrg2URyLJRLjkehRGcqoFucD1w7T50Hhbtcpg&oe=691E18FD",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/581945538_1552169409250766_3244153630001338539_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Fc6LwDpBynkQ7kNvwEd-Ig2&_nc_oc=Adm4Gp4GNjIO4Jolcz45dxjvHv3ScmSIGkvmweVUxhOl1k-SG5CmcK7wXBPGifmqv7Q&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=9bTd9Ezn02rlpWZqfy8UgQ&oh=00_AfizJzuu8RsOflgavvwYHGpSP1tBZMhPHfKVehZIkTsJmA&oe=691E23DF"
            ],
            type: "Plot",
            sqm: 5000,
            amenities: ["5000 sqm", "Flat", "Fenced"],
            lat: -26.3054,
            lng: 31.1367,
            agent: {
                id: 4,
                name: "Lindiwe Ngubane",
                title: "International Properties Agent",
                avatar: "https://via.placeholder.com/50",
                phone: "74888888",
                email: "lindiwe@intlrealestate.sz",
                whatsapp: "74888888",
                license: "RES-2021-056",
                bio: "International property specialist with overseas experience.",
                experience: 10,
                specializations: ["International", "Villas", "Resort Properties"],
                rating: 4.6,
                reviews: 31,
                propertiesCount: 33,
                soldCount: 19,
            },
        },
        {
            id: 5,
            title: "1  bedroom Ezulwini",
            location: "Ezulwini, Mlindazwe",
            price: "3500",
            rentalPeriod: "Monthly",
            findersFee: 0,
            depositRequired: true,

            description: "Contemporary living with premium finishes",
            images: [
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/583041937_24905462622468823_1709896907267034402_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=111&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=fRO6xmiu0OoQ7kNvwEHOUCT&_nc_oc=AdnmYuO_11HPpsPX25NsNP3Ad-vHddVg-jSqWSa5DMXWXSO0AKRAAKWHCqti4CRna6Y&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=5OqoT6uFCRnsgYH6H8xvWg&oh=00_Afg9quHbIjjBI2MkCM_cD-e18PPq8KNs1ODMhxaJ_XlDxA&oe=691E29A2",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/583080577_24905462539135498_7778843455975686798_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=109&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=ZPFOqojcCwQQ7kNvwF4nKyc&_nc_oc=Adn5egQeE02hQMW1PlKf3xH5BseMWyoYGJ3B_43t8C3hmaUOuFgAi8iIsTizyPf595g&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=5OqoT6uFCRnsgYH6H8xvWg&oh=00_AfjUvV9phC246bCPw4X8GwwpTT5wOQF-BKiieSr5Qgv0Ug&oe=691E2E16",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/584131693_24905462602468825_2066414094943375810_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=102&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=HJqG1VbLymkQ7kNvwGj1nRU&_nc_oc=Adlp3TzheV-npYZgjVca5buEekOIuk6SbFfL04BfFeb-T69vud5XBwCqq5nmxXR2uXU&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=5OqoT6uFCRnsgYH6H8xvWg&oh=00_AfjBez5gt02skMNkXRz-hLEPLREe5eFEEwrZ0_ZQwgXX4A&oe=691E34DE"
            ],
            type: "Flat",
            beds: 1,
            baths: 1,
            amenities: ["Gate", "Well Fenced", "Security"],
            lat: -26.521,
            lng: 31.468,
            agent: {
                id: 5,
                name: "Sipho Ndaba",
                title: "Urban Properties Agent",
                avatar: "https://via.placeholder.com/50",
                phone: "74222222",
                email: "sipho@realestate.sz",
                whatsapp: "74222222",
                license: "RES-2023-078",
                bio: "Focused on modern urban properties with contemporary design.",
                experience: 6,
                specializations: ["Urban", "Apartments", "Young Professionals"],
                rating: 4.5,
                reviews: 18,
                propertiesCount: 16,
                soldCount: 9,
            },
        },
        {
            id: 6,
            title: "Complex",
            location: "Elangeni Via Highway",
            price: "29000",
            rentalPeriod: "Sale",
            findersFee: 1900,
            depositRequired: true,
            depositPercentage: 100,
            description: "Langeni, a big complex at business center area is for sale via Mbabane Manzini highway and it's have road tarred frontage",
            images: [
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/527178316_1191714632996463_6908719694164168098_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=KFkFJZ2vJhEQ7kNvwFNMDEs&_nc_oc=AdkEDSTzqtw0wVlChz6iAJzIiIHsWVONzihjWzETf-OTLXT4hvucDIMhNgrkEmMsG58&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=k6px0QzVNcW8gSt-m0bERA&oh=00_AfidYHD_UsOZvyifODtzjtjsp7iFehpsvywXMAgjEB8AIw&oe=691E1732",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t39.30808-6/526783479_1191714696329790_4347480787975071119_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=eijLuPqNLh8Q7kNvwEyd43g&_nc_oc=Adnx9Ys2aACUvN0DAevfNS0QXkka54Hr9MKQmJIyLiebUD2BZllsWtvVPcL_yMSApHM&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=k6px0QzVNcW8gSt-m0bERA&oh=00_AfgQTcUAFwl5kyBEsaiGfSir-MKnyPac_slQSh038bCypQ&oe=691E3646",
            ],
            type: "Plot",
            sqm: 250,
            amenities: ["rent income E29000", "Shops and supermarkets", "Security"],
            lat: -26.519,
            lng: 31.467,
            agent: {
                id: 6,
                name: "Naledi Khumalo",
                title: "Premium Properties Director",
                avatar: "https://via.placeholder.com/50",
                phone: "74999999",
                email: "naledi@premiumrealestate.sz",
                whatsapp: "74999999",
                license: "RES-2020-012",
                bio: "Director of premium property sales with track record.",
                experience: 15,
                specializations: ["Premium", "Penthouses", "Executive"],
                rating: 4.9,
                reviews: 52,
                propertiesCount: 67,
                soldCount: 38,
            },
        },
        {
            id: 7,
            title: "1 Bedroom house",
            location: "Mbikwakhe",
            price: "2500",
            rentalPeriod: "Monthly",
            depositRequired: false,
            description: "1bedroom house currently available. Spacious sitting room.",
            images: [
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t45.5328-4/577121703_704525558869195_8687630388944015175_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=105&ccb=1-7&_nc_sid=247b10&_nc_ohc=poJwKA1y7JQQ7kNvwF53DNg&_nc_oc=Adm93b1JL0_RrY-A_4CNDkw7u23-dligBm1Wj2vcWpMXXccGJQvlu24TXmb95C_A83E&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=FSvaYjalrpPKAQbHCkVP4Q&oh=00_AfhHD7FGwk5WP_HIHYmIj8WIDdcN4tTaDO2FpGCgNjmQ6g&oe=691E2373",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t45.5328-4/576669215_815949431142875_1104864995977360149_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=109&ccb=1-7&_nc_sid=247b10&_nc_ohc=dlyCyJmERNsQ7kNvwGsSHh_&_nc_oc=AdlakHP300Zvozxq67u5WEb_PgZUS0S2Lsp8ZfCITHLyodRLPqyLoAAzaPXVgkQdKy0&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=FSvaYjalrpPKAQbHCkVP4Q&oh=00_AfhDBgM2LwSZuMQhbE0MZK-fKjt7H9fTHnv2o0hNXqY6Ag&oe=691E0869",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t45.5328-4/577903478_1386548893155110_7673740308387143152_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=110&ccb=1-7&_nc_sid=247b10&_nc_ohc=VxU7kp9ahnQQ7kNvwHqH2U8&_nc_oc=AdkRWWHgNPqJkSho1Te0k6jKaOY8oy5jX80UwJXgrWeDByP4EcARkLrPWiUKvYDzToA&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=FSvaYjalrpPKAQbHCkVP4Q&oh=00_Afjq-8YxISwXtrCT9x1HpEui82WBKp0-8RC0DyqHvKBLEg&oe=691E21BA",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t45.5328-4/577189046_1489318405517195_3978196696429413648_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=110&ccb=1-7&_nc_sid=247b10&_nc_ohc=S-gTbRBDvocQ7kNvwHaXmiO&_nc_oc=AdklUYV6wrgP5bfh0ro9S7XHC6HZyyIgRBl6zUbDIwEIvQwkpwJQt-1nMCo3rKWyOos&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=FSvaYjalrpPKAQbHCkVP4Q&oh=00_AfhYKkz9YE9iyjTMy9QjUVB2bC35fyrfg00RqxmMnbc6lw&oe=691E3746",
                "https://scontent.fmts1-1.fna.fbcdn.net/v/t45.5328-4/576885104_2427957857622835_548288701535981847_n.jpg?stp=dst-jpg_p720x720_tt6&_nc_cat=107&ccb=1-7&_nc_sid=247b10&_nc_ohc=iB4rQ0zK2dgQ7kNvwFR-yBR&_nc_oc=Adnm5NirpdfvEizxFZHsT4rWRcLT05l9zgMEygN4Ky3DTP1_gJa8X37na8gbBR53Ers&_nc_zt=23&_nc_ht=scontent.fmts1-1.fna&_nc_gid=FSvaYjalrpPKAQbHCkVP4Q&oh=00_AfgrpwOr-y1nrhGGO2vbwe7E4hlo3sNz11G_Y_mgPuB93A&oe=691E1167"
            ],
            type: "House",
            sqm: 400,
            beds: 1,
            baths: 1,
            amenities: ["Fully fitted kitchen", "wash basin",],
            lat: -26.51,
            lng: 31.475,
            agent: {
                id: 7,
                name: "Mpho Sifiso",
                title: "Coastal Properties Specialist",
                avatar: "https://via.placeholder.com/50",
                phone: "76777777",
                email: "mpho@coastalrealestate.sz",
                whatsapp: "76777777",
                license: "RES-2022-034",
                bio: "Expert in beachfront and coastal properties.",
                experience: 9,
                specializations: ["Coastal", "Beachfront", "Vacation Rentals"],
                rating: 4.8,
                reviews: 35,
                propertiesCount: 21,
                soldCount: 12,
            },
        },
        {
            id: 8,
            title: "Agricultural Farm",
            location: "Rural Area, Hhohho",
            price: "25000",
            rentalPeriod: "Monthly",
            findersFee: null,
            depositRequired: false,
            description: "Productive farmland with irrigation system",
            images: [],
            type: "Farm",
            hectares: 15,
            amenities: ["Irrigation", "Well Water", "Fenced"],
            lat: -26.45,
            lng: 31.4,
            agent: {
                id: 8,
                name: "Tsogo Shabalala",
                title: "Agricultural Properties Expert",
                avatar: "https://via.placeholder.com/50",
                phone: "76333333",
                email: "tsogo@farmrealestate.sz",
                whatsapp: "76333333",
                license: "RES-2021-067",
                bio: "Specialized in agricultural and rural properties.",
                experience: 11,
                specializations: ["Agriculture", "Rural", "Farm Management"],
                rating: 4.7,
                reviews: 22,
                propertiesCount: 14,
                soldCount: 7,
            },
        },
    ]


    const openDrawer = (property) => {
        setSelectedProperty(property)
        drawerRef.current?.expand?.()
    }

    const featuredProperties = useMemo(
        () =>
            allProperties.slice(0, 4).map((p) => ({
                ...p,
                images:
                    !p.images || p.images.length === 0
                        ? ["https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?w=500&h=400&fit=crop"]
                        : p.images,
            })),
        [allProperties]
    )

    return (
        <View
            style={[
                styles.container,
                { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50 },
            ]}
        >
            <SecondaryNav title="Estate" rightIcon="options-outline" onRightPress={() => setFilterDrawerVisible(true)} onBackPress={() => { }} />

            <ScrollView showsVerticalScrollIndicator={false}>
                <SearchBar placeholder="Search properties..." />
                <CategoryScroll
                    categories={[
                        { id: 1, name: "All" },
                        { id: 2, name: "Houses" },
                        { id: 3, name: "Apartment" },
                        { id: 4, name: "Flats" },
                        { id: 5, name: "Plot" },
                        { id: 6, name: "Farm" },
                        { id: 7, name: "Office Space" },
                    ]}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    activeColor="#000"
                    activeTextColor="#FFF"
                />

                {/* Featured Properties */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Featured Properties</Text>
                    </View>
                    <FlatList
                        data={featuredProperties}
                        renderItem={({ item }) => <FeaturedPropertyCard property={item} />}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredScroll}
                    />
                </View>

                {/* All Properties with Ads */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitleAll}>All Properties</Text>
                    {allProperties.map((property, index) => {
                        const showAd = (index + 1) % 3 === 0
                        const adIndex = Math.floor((index + 1) / 3) % sampleAds.length

                        return (
                            <React.Fragment key={property.id}>
                                <MiniPropertyCard
                                    property={{
                                        ...property,
                                        images:
                                            !property.images || property.images.length === 0
                                                ? ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLDpcPFt0jl-ONT0pV-5nx2nQvsm7KO34MXw&s"]
                                                : property.images,
                                    }}
                                    onPress={() => openDrawer(property)}
                                />
                                {showAd && (
                                    <NativeAd
                                        key={`ad-${index}`}
                                        ads={[sampleAds[adIndex]]}
                                        maxAdsToShow={1}
                                    />
                                )}
                            </React.Fragment>
                        )
                    })}
                </View>
            </ScrollView>

            <PropertyDrawer property={selectedProperty} />
            <FilterDrawer
                visible={filterDrawerVisible}
                onClose={() => setFilterDrawerVisible(false)}
                onApplyFilters={(newFilters) => {
                    setFilters(newFilters)
                    setFilterDrawerVisible(false)
                }}
                currentFilters={filters}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    section: {
        marginVertical: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginHorizontal: 16,
        marginBottom: 12
    },
    sectionTitle: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
    sectionTitleAll: {
        fontSize: 20, fontWeight: "700", color: "#1a1a1a",
        marginHorizontal: 16,
        marginBottom: 12
    },
    featuredScroll: { paddingHorizontal: 12 },
})
