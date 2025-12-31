import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useState, useRef } from "react"; // Added useRef
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Animated, // Added Animated
  Easing,   // Added Easing
} from "react-native";
import BannerCarousel from "../Components/Banner";
import SuggestedBooksCart from "../Components/SuggestedBooksCart";
import { router } from "expo-router";

const NEAR_BOOKS = [
  {
    id: "1",
    title: "NCERT Mathematics Textbook for Class X",
    image: "https://ncert.nic.in/textbook/pdf/jemh1cc.jpg",
    distance: "2.5 km",
    mrp: 2000,
    price: 1509,
  },
  {
    id: "2",
    title: "NCERT Chemistry Class XII",
    image: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg",
    distance: "2 km",
    mrp: 2500,
    price: 1900,
  },
  {
    id: "3",
    title: "NCERT Science Textbook for Class X",
    image: "https://ncert.nic.in/textbook/pdf/jesc1cc.jpg",
    distance: "1.5 km",
    mrp: 1500,
    price: 1000,
  },
  {
    id: "4",
    title: "General English Textbook for All Exams",
    image: "https://ncert.nic.in/textbook/pdf/jehe1cc.jpg",
    distance: "3 km",
    mrp: 2500,
    price: 1899,
  },
  {
    id: "5",
    title: "Flamingo English Textbook for Class XII",
    image: "https://ncert.nic.in/textbook/pdf/lefl1cc.jpg",
    distance: "500 m",
    mrp: 1200,
    price: 899,
  },
  {
    id: "6",
    title: "Vistas English Textbook for Class XII",
    image: "https://ncert.nic.in/textbook/pdf/levt1cc.jpg",
    distance: "600 m",
    mrp: 1200,
    price: 899,
  },
];

const TRENDING_BOOKS = [
  {
    id: "1",
    title: "NCERT Physics Class XII Part 1",
    image: "https://ncert.nic.in/textbook/pdf/leph1cc.jpg",
    distance: "1.8 km",
    mrp: 1800,
    price: 1350,
  },
  {
    id: "2",
    title: "NCERT Biology Class XI",
    image: "https://ncert.nic.in/textbook/pdf/lebo1cc.jpg",
    distance: "2.3 km",
    mrp: 1600,
    price: 1200,
  },
  {
    id: "3",
    title: "NCERT History Class X",
    image: "https://ncert.nic.in/textbook/pdf/jehs1cc.jpg",
    distance: "1.2 km",
    mrp: 1400,
    price: 1050,
  },
  {
    id: "4",
    title: "NCERT Geography Class XII",
    image: "https://ncert.nic.in/textbook/pdf/kehs1cc.jpg",
    distance: "2.8 km",
    mrp: 1700,
    price: 1275,
  },
  {
    id: "5",
    title: "NCERT Economics Class XII",
    image: "https://ncert.nic.in/textbook/pdf/keec1cc.jpg",
    distance: "3.5 km",
    mrp: 1900,
    price: 1425,
  },
  {
    id: "6",
    title: "NCERT Political Science Class XI",
    image: "https://ncert.nic.in/textbook/pdf/leps1cc.jpg",
    distance: "1.6 km",
    mrp: 1500,
    price: 1125,
  },
];

const SUGGESTED_BOOKS = [
  {
    id: "1",
    title: "NCERT Mathematics Textbook for Class X",
    image: "https://ncert.nic.in/textbook/pdf/jemh1cc.jpg",
    distance: "2.5 km",
    mrp: 2000,
    price: 1509,
  },
  {
    id: "2",
    title: "NCERT Chemistry Class XII",
    image: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg",
    distance: "2 km",
    mrp: 2500,
    price: 1900,
  },
  {
    id: "3",
    title: "NCERT Science Textbook for Class X",
    image: "https://ncert.nic.in/textbook/pdf/jesc1cc.jpg",
    distance: "1.5 km",
    mrp: 1500,
    price: 1000,
  },
  {
    id: "4",
    title: "NCERT Physics Class XII Part 1",
    image: "https://ncert.nic.in/textbook/pdf/leph1cc.jpg",
    distance: "1.8 km",
    mrp: 1800,
    price: 1350,
  },
  {
    id: "5",
    title: "NCERT Biology Class XI",
    image: "https://ncert.nic.in/textbook/pdf/lebo1cc.jpg",
    distance: "2.3 km",
    mrp: 1600,
    price: 1200,
  },
  {
    id: "6",
    title: "NCERT History Class X",
    image: "https://ncert.nic.in/textbook/pdf/jehs1cc.jpg",
    distance: "1.2 km",
    mrp: 1400,
    price: 1050,
  },
  {
    id: "7",
    title: "General English Textbook for All Exams",
    image: "https://ncert.nic.in/textbook/pdf/jehe1cc.jpg",
    distance: "3 km",
    mrp: 2500,
    price: 1899,
  },
  {
    id: "8",
    title: "Flamingo English Textbook for Class XII",
    image: "https://ncert.nic.in/textbook/pdf/lefl1cc.jpg",
    distance: "500 m",
    mrp: 1200,
    price: 899,
  },
];

// Responsive scaling utilities
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

const Dashboard = () => {
  const { width, height } = useWindowDimensions();
  const [liveAddress, setLiveAddress] = useState("Fetching location...");
  const insets = useSafeAreaInsets();

  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Function to run the shake sequence
    const runAttentionAnimation = () => {
      // 1. Fade in Tooltip
      Animated.timing(tooltipOpacity, {
        toValue: 1,
        duration: 30,
        useNativeDriver: true,
      }).start();

      // 2. Shake Button sequence
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start(() => {
        // 3. Wait 3 seconds then fade out tooltip
        setTimeout(() => {
          Animated.timing(tooltipOpacity, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }).start();
        }, 3000);
      });
    };

    // Initial delay of 2 seconds so it doesn't pop immediately on load
    const initialTimer = setTimeout(runAttentionAnimation, 2000);

    // Set interval to repeat every 60 seconds (1 minute)
    const intervalId = setInterval(runAttentionAnimation, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalId);
    };
  }, []);

  // Interpolate shake value to rotation degrees
  const spin = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLiveAddress("Location permission denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const { latitude, longitude } = location.coords;

        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressResponse.length > 0) {
          const addr = addressResponse[0];

          const formattedAddress = [
            addr.name,
            addr.city || addr.district,
            addr.subregion,
            addr.street,
            addr.region,
          ]
            .filter(Boolean)
            .join(", ");

          setLiveAddress(formattedAddress);
        }
      } catch (error) {
        console.log("Location error:", error);
        setLiveAddress("Unable to fetch location");
      }
    })();
  }, []);

  // Memoize styles to prevent unnecessary recalculations
  const styles = useMemo(() => createStyles(width, height), [width, height]);

  // Memoize grid rows to prevent unnecessary recalculations
  const suggestedBooksRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < SUGGESTED_BOOKS.length; i += 2) {
      rows.push(SUGGESTED_BOOKS.slice(i, i + 2));
    }
    return rows;
  }, []);

  // Reusable Book Card Component matching BookNearMeScreen design
  const renderBookCard = (item: typeof NEAR_BOOKS[number]) => (
    <TouchableOpacity key={item.id} style={styles.bookCard} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        <View style={styles.distanceBadge}>
          <Ionicons
            name="location-sharp"
            size={scale(10, width)}
            color="#f90000ff"
          />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>

        <View style={styles.imagePlaceholder}>
          <Image
            source={{ uri: item.image }}
            style={styles.bookImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.bookName} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.mrp}>₹{item.mrp}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <Text style={styles.buyText}>Buy at ₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render grid card for suggested books
  const renderSuggestedBookCard = (item: typeof SUGGESTED_BOOKS[number]) => (
    <TouchableOpacity key={item.id} style={styles.suggestedBookCard} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        <View style={styles.distanceBadge}>
          <Ionicons
            name="location-sharp"
            size={scale(10, width)}
            color="#f90000ff"
          />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>

        <View style={styles.imagePlaceholder}>
          <Image
            source={{ uri: item.image }}
            style={styles.bookImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.bookName} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.mrp}>₹{item.mrp}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>

        <Text style={styles.buyText}>Buy at ₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#6FE9F0", "#CFF7FA"]} style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity activeOpacity={0.7} style={styles.locationBox}>
              <Ionicons
                name="location-sharp"
                size={scale(16, width)}
                color="#000"
              />
              <Text style={styles.locationTitle}>Home</Text>
              <Ionicons
                name="chevron-down"
                size={scale(16, width)}
                color="#000"
              />
            </TouchableOpacity>

            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.coinBox} activeOpacity={0.7}>
                <LinearGradient
                  colors={["#FFD700", "#FFA500"]}
                  style={styles.coinIconWrapper}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons
                    name="currency-rupee"
                    size={scale(16, width)}
                    color="#FFFFFF"
                  />
                </LinearGradient>
                <Text style={styles.coinText}>10</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => router.push("/(screen)/Profile")}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#6634C9", "#4e46e5"]}
                  style={styles.avatarBorder}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.avatar}>
                    <Image
                      source={require("../../assets/images/profile.png")}
                      style={styles.profileImage}
                      contentFit="cover"
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.addressText} numberOfLines={1}>
            {liveAddress}
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(screen)/SearchScreen")}
          >
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={scale(20, width)}
                color="#00000060"
              />
              <Text style={styles.searchPlaceholder}>
                Search books, authors, subjects
              </Text>
              <View style={styles.micDivider} />
              <Ionicons name="mic" size={scale(22, width)} color="#003EF9" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Floating Upload Button Container */}
        <View style={styles.floatingContainer} pointerEvents="box-none">
            {/* Tooltip Bubble */}
            <Animated.View style={[styles.tooltipContainer, { opacity: tooltipOpacity }]}>
                <Text style={styles.tooltipText}>Sell Book</Text>
                <View style={styles.tooltipArrow} />
            </Animated.View>

            {/* Shaking Button */}
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.floatingUploadButton}
                    onPress={() => router.push('/(screen)/UploadScreen1')}
                >
                    <LinearGradient
                    colors={["#44D6FF", "#002593"]}
                    style={styles.uploadButtonGradient}
                    >
                    <Image
                        source={require("../../assets/images/Sellbook.png")}
                        contentFit="contain"
                        style={styles.uploadButtonImage}
                    />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.mainContent}
        >
          <BannerCarousel />

          {/* Books Near Me */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Books Near Me</Text>
              <TouchableOpacity
                onPress={() => router.push("/(screen)/BookNearMeScreen")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-forward"
                  size={scale(18, width)}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bookList}
            >
              {NEAR_BOOKS.map((item) => renderBookCard(item))}
            </ScrollView>
          </View>

          {/* Trending Books */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Trending Books</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons
                  name="arrow-forward"
                  size={scale(18, width)}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bookList}
            >
              {TRENDING_BOOKS.map((item) => renderBookCard(item))}
            </ScrollView>
          </View>

          {/* Suggested Books Grid */}
          <View style={styles.separatedSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suggested Books</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons
                  name="arrow-forward"
                  size={scale(18, width)}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.gridContainer}>
              {suggestedBooksRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.suggestedRow}>
                  {row.map((item) => renderSuggestedBookCard(item))}
                </View>
              ))}
            </View>
          </View>

          <SuggestedBooksCart />
        </ScrollView>
      </LinearGradient>

      <View style={{ height: insets.bottom, backgroundColor: "#111111" }} />
    </View>
  );
};

export default Dashboard;

/* RESPONSIVE STYLES */

const createStyles = (width: number, height: number) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  const cardGap = s(12);
  const cardW = s(160);
  const gutter = s(16);

  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      paddingTop: vs(50),
      paddingHorizontal: gutter,
      paddingBottom: vs(14),
      minHeight: vs(150),
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    locationBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(2),
    },
    locationTitle: {
      fontSize: ms(16),
      fontWeight: "bold",
      color: "#000000",
      marginHorizontal: s(1),
    },
    addressText: {
      fontSize: ms(12),
      color: "#000000E0",
      marginTop: vs(1),
      fontWeight: "400",
      marginBottom: vs(10),
      width: "70%",
    },
    rightIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(12),
    },
    coinBox: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: s(12),
      paddingVertical: vs(6),
      borderRadius: ms(20),
      borderWidth: 2,
      borderColor: "#6634c9a2",
    },
    coinIconWrapper: {
      width: s(26),
      height: s(26),
      borderRadius: s(13),
      justifyContent: "center",
      alignItems: "center",
      marginRight: s(6),
      shadowColor: "#FFA500",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4,
      shadowRadius: 2,
      elevation: 3,
    },
    coinText: {
      fontSize: ms(16),
      fontWeight: "800",
      color: "#000000",
      letterSpacing: 0.5,
    },
    avatarContainer: {
      shadowColor: "#6634C9",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    avatarBorder: {
      width: s(48),
      height: s(48),
      borderRadius: s(24),
      justifyContent: "center",
      alignItems: "center",
      padding: 2,
    },
    avatar: {
      width: s(44),
      height: s(44),
      borderRadius: s(22),
      backgroundColor: "#E0E7FF",
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    profileImage: { width: "100%", height: "100%" },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderRadius: ms(28),
      paddingHorizontal: gutter,
      height: vs(50),
      shadowColor: "#003EF9",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1.5,
      borderColor: "#003EF920",
    },
    searchPlaceholder: {
      flex: 1,
      marginLeft: s(10),
      fontSize: ms(15),
      color: "#00000060",
      fontWeight: "500",
    },
    micDivider: {
      width: 1,
      height: "60%",
      backgroundColor: "#00000015",
      marginHorizontal: s(12),
    },
    mainContent: { flex: 1 },
    scrollContent: { paddingBottom: vs(20) },
    section: { marginTop: vs(20) },
    separatedSection: {
      marginTop: vs(30),
      backgroundColor: "#efe9e97e",
      borderRadius: ms(16),
      marginHorizontal: 5,
      paddingVertical: vs(15),
      
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: gutter,
      marginBottom: vs(10),
    },
    sectionTitle: {
      fontSize: ms(16),
      fontWeight: "bold",
      color: "#000",
    },
    bookList: {
      paddingHorizontal: s(15),
      paddingBottom: vs(5),
    },
    bookCard: {
      width: cardW,
      marginRight: cardGap,
      backgroundColor: "#fff",
      borderRadius: ms(12),
      padding: s(8),
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    imageWrapper: {
      position: "relative",
      height: vs(140),
      marginBottom: vs(10),
    },
    distanceBadge: {
      position: "absolute",
      top: s(10),
      left: s(10),
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      borderRadius: ms(20),
      gap: s(4),
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    distanceText: {
      fontSize: ms(10),
      fontWeight: "700",
      color: "#f91500ff",
    },
    imagePlaceholder: {
      width: "100%",
      height: "100%",
      borderRadius: ms(8),
      overflow: "hidden",
      backgroundColor: "#F1F5F9",
    },
    bookImage: { width: "100%", height: "100%" },
    infoContainer: { paddingHorizontal: s(2) },
    bookName: {
      fontSize: ms(13),
      fontWeight: "600",
      color: "#0F172A",
      marginBottom: vs(6),
      lineHeight: ms(18),
      height: ms(36),
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: vs(6),
    },
    mrp: {
      fontSize: ms(12),
      color: "#94A3B8",
      textDecorationLine: "line-through",
      fontWeight: "500",
    },
    price: {
      fontSize: ms(14),
      color: "#0F172A",
      fontWeight: "700",
    },
    buyText: {
      fontSize: ms(12),
      color: "#003EF9",
      fontWeight: "700",
    },
    gridContainer: { paddingHorizontal: gutter },
    suggestedRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: vs(12),
    },
    suggestedBookCard: {
      width: (width - gutter * 2 - s(16)) / 2,
      backgroundColor: "#fff",
      borderRadius: ms(12),
      padding: s(8),
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    // UPDATED FLOATING BUTTON STYLES
    floatingContainer: {
        position: "absolute",
        bottom: vs(40),
        right: s(10),
        zIndex: 1000,
        alignItems: "center",
        justifyContent: "center",
    },
    floatingUploadButton: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    uploadButtonGradient: {
      width: s(56),
      height: s(56),
      borderRadius: s(28),
      justifyContent: "center",
      alignItems: "center",
    },
    uploadButtonImage: { width: s(30), height: s(30), top: 3 },
    // NEW TOOLTIP STYLES
    tooltipContainer: {
        position: 'absolute',
        bottom: s(70), 
        backgroundColor: '#fff',
        paddingVertical: s(6),
        paddingHorizontal: s(12),
        borderRadius: s(8),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center',
    },
    tooltipText: {
        fontSize: ms(12),
        fontWeight: 'bold',
        color: '#002593',
    },
    tooltipArrow: {
        position: 'absolute',
        bottom: -s(6),
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: s(6),
        borderRightWidth: s(6),
        borderTopWidth: s(6),
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#fff',
    }
  });
};