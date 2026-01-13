// import { Ionicons } from "@expo/vector-icons";
// import { Image } from "expo-image";
// import { LinearGradient } from "expo-linear-gradient";

// import { router } from "expo-router";
// import React, { useEffect, useMemo, useRef } from "react"; // Added useRef
// import {
//   Animated,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useDashboardStore } from "../../Context/DashboardContext";
// import { useLocationStore } from "../../Context/LocationContext";
// import { useProfileStore } from "../../Context/ProfileContext";
// import {
//   getCurrentLocation,
//   reverseGeocode,
// } from "../../Services/locationService";

// import BannerCarousel from "../Components/Banner";
// import { FloatingActionDock } from "../Components/FloatingUploadBtn";
// import LocationEmptyState from "../Components/LocationEmptyState";
// import SuggestedBooksCart from "../Components/SuggestedBooksCart";

// // Responsive scaling utilities
// const scale = (size: number, width: number) => (width / 375) * size;
// const verticalScale = (size: number, height: number) => (height / 812) * size;
// const moderateScale = (size: number, factor: number = 0.5, width: number) =>
//   size + (scale(size, width) - size) * factor;

// const BANNERS = [
//   {
//     id: "1",
//     image: require("../../assets/images/Banner1.jpeg"),
//   },
//   {
//     id: "2",
//     image: require("../../assets/images/Banner2.jpeg"),
//   },
//   {
//     id: "3",
//     image: require("../../assets/images/Banner3.jpeg"),
//   },
//    {
//     id: "4",
//     image: require("../../assets/images/Banner4.jpeg"),
//   },
//    {
//     id: "5",
//     image: require("../../assets/images/Banner3.jpeg"),
//   },
// ];

// const Dashboard = () => {
//   const { profileImage, isProfileLoaded } = useProfileStore();
//   const {
//     formattedAddress,
//     source,
//     isReady,
//     location,
//     setGpsLocation,
//     setLocationFormated,
//   } = useLocationStore();
//   const { data, loading, fetchDashboard } = useDashboardStore();

//   const { width, height } = useWindowDimensions();

//   const insets = useSafeAreaInsets();

//   // Animation values
//   const shakeAnim = useRef(new Animated.Value(0)).current;
//   const tooltipOpacity = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Function to run the shake sequence
//     const runAttentionAnimation = () => {
//       // 1. Fade in Tooltip
//       Animated.timing(tooltipOpacity, {
//         toValue: 1,
//         duration: 30,
//         useNativeDriver: true,
//       }).start();

//       // 2. Shake Button sequence
//       Animated.sequence([
//         Animated.delay(100),
//         Animated.timing(shakeAnim, {
//           toValue: 1,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(shakeAnim, {
//           toValue: -1,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(shakeAnim, {
//           toValue: 1,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(shakeAnim, {
//           toValue: 0,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         // 3. Wait 3 seconds then fade out tooltip
//         setTimeout(() => {
//           Animated.timing(tooltipOpacity, {
//             toValue: 0,
//             duration: 50,
//             useNativeDriver: true,
//           }).start();
//         }, 3000);
//       });
//     };

//     // Initial delay of 2 seconds so it doesn't pop immediately on load
//     const initialTimer = setTimeout(runAttentionAnimation, 2000);

//     // Set interval to repeat every 60 seconds (1 minute)
//     const intervalId = setInterval(runAttentionAnimation, 60000);

//     return () => {
//       clearTimeout(initialTimer);
//       clearInterval(intervalId);
//     };
//   }, []);

//   useEffect(() => {
//     if (source !== "gps") return;
//     if (isReady) return; // already resolved

//     const resolveGps = async () => {
//       const coords = await getCurrentLocation();
//       if (!coords) return;

//       const address = await reverseGeocode(coords);
//       setGpsLocation(coords, address);
//       setLocationFormated(address);
//     };

//     resolveGps();
//   }, [source, isReady]);

//   useEffect(() => {
//     if (!location || !isReady) return;

//     fetchDashboard(location);
//   }, [location, isReady]);

//   const isDashboardEmpty =
//     data &&
//     data.nearYou.length === 0 &&
//     data.aroundYou.length === 0 &&
//     data.explore.length === 0;

//   // Interpolate shake value to rotation degrees
//   const spin = shakeAnim.interpolate({
//     inputRange: [-1, 1],
//     outputRange: ["-15deg", "15deg"],
//   });

//   // Memoize styles to prevent unnecessary recalculations
//   const styles = useMemo(() => createStyles(width, height), [width, height]);

//   // Reusable Book Card Component matching BookNearMeScreen design
//   const renderBookCard = (item: any) => (
//     <TouchableOpacity
//       key={item.book.id}
//       style={styles.bookCard}
//       activeOpacity={0.8}
//       onPress={() =>
//         router.push({
//           pathname: "/(screen)/DiscloseScreen",
//           params: {
//             bookId: item.book.id,
//             distance: item.distance_km,
//           },
//         })
//       }
//     >
//       <View style={styles.imageWrapper}>
//         <View style={styles.distanceBadge}>
//           <Ionicons
//             name="location-sharp"
//             size={scale(10, width)}
//             color="#f90000ff"
//           />
//           <Text style={styles.distanceText}>{item.distance_km} km</Text>
//         </View>

//         <View style={styles.imagePlaceholder}>
//           <Image
//             source={{ uri: item.book.images?.[0] }}
//             style={styles.bookImage}
//             contentFit="cover"
//             transition={200}
//           />
//         </View>
//       </View>

//       <View style={styles.infoContainer}>
//         <Text style={styles.bookName} numberOfLines={2}>
//           {item.book.title}
//         </Text>

//         <View style={styles.priceRow}>
//           <Text style={styles.mrp}>₹{item.book.original_price}</Text>
//           <Text style={styles.price}>₹{item.book.generated_price}</Text>
//         </View>

//         <Text style={styles.buyText}>Buy at ₹{item.book.generated_price}</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center",backgroundColor:'#ffffff00' }}>
//         <Image
//           source={require("../../assets/images/loading.gif")}
//           style={styles.loadingGif}
          
//         />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <LinearGradient
//         colors={["#ffffff", "#f2fbfbff"]}
//         style={styles.container}
//       >
//         {/* HEADER */}
//         <View style={styles.header} >
         
//                       <View style={styles.headerRow}>
//             <TouchableOpacity
//               activeOpacity={0.7}
//               style={styles.locationBox}
//               onPress={() => router.push("/Components/HomeLocationChange")}
//             >
//               <Ionicons
//                 name="location-sharp"
//                 size={scale(16, width)}
//                 color="#000"
//               />
//               <Text style={styles.locationTitle}>Home</Text>
//               <Ionicons
//                 name="chevron-down"
//                 size={scale(16, width)}
//                 color="#000"
//               />
//             </TouchableOpacity>

//             <View style={styles.rightIcons}>
//               <TouchableOpacity
//                 style={styles.coinBox}
//                 activeOpacity={0.7}
//                 onPress={() => router.push("/(screen)/GoldSection")}
//               >
//                 <Image
//                   source={require("../../assets/images/Front-coin.png")} // <-- add your coin image here
//                   style={styles.coinImage}
//                   contentFit="contain"
//                 />
//                 <Text style={styles.coinText}>0</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.avatarContainer}
//                 onPress={() => router.push("/(screen)/Profile")}
//                 activeOpacity={0.7}
//               >
//                 <LinearGradient
//                   colors={["#6634C9", "#4e46e5"]}
//                   style={styles.avatarBorder}
//                   start={{ x: 0, y: 0 }}
//                   end={{ x: 1, y: 1 }}
//                 >
//                   <View style={styles.avatar}>
//                     <Image
//                       source={
//                         profileImage
//                           ? { uri: profileImage }
//                           : require("../../assets/images/profile.png")
//                       }
//                       style={styles.profileImage}
//                       contentFit="cover"
//                     />
//                   </View>
//                 </LinearGradient>
//               </TouchableOpacity>
//             </View>
//           </View>

//           <Text style={styles.addressText} numberOfLines={1}>
//             {!isReady ? "Fetching your location..." : formattedAddress}
//           </Text>

//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={() => router.push("/(screen)/SearchScreen")}
//           >
//             <View style={styles.searchBox}>
//               <Ionicons
//                 name="search-outline"
//                 size={scale(20, width)}
//                 color="#00000060"
//               />
//               <Text style={styles.searchPlaceholder}>
//                 Search books, authors, subjects
//               </Text>
//               <View style={styles.micDivider} />
//               <Ionicons name="mic" size={scale(22, width)} color="#003EF9" />
//             </View>
//           </TouchableOpacity>
          
//         </View>

//         {/* Main Content */}
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//           style={styles.mainContent}
//         >
          

//           {/* Books Near Me */}
//           {/* <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Books Near Me</Text>
//               <TouchableOpacity
//                 onPress={() => router.push("/(screen)/BookNearMeScreen")}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons
//                   name="arrow-forward"
//                   size={scale(18, width)}
//                   color="#000"
//                 />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.bookList}
//             ></ScrollView>
//           </View> */}

//           {!!data?.nearYou?.length && (
//             <View style={styles.section}>
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>Books Near Me</Text>
//                 <TouchableOpacity
//                   onPress={() => router.push("/(screen)/BookNearMeScreen")}
//                   activeOpacity={0.7}
//                 >
//                   <Ionicons
//                     name="arrow-forward"
//                     size={scale(18, width)}
//                     color="#000"
//                   />
//                 </TouchableOpacity>
//               </View>

//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.bookList}
//               >
//                 {data.nearYou.map((item: any) => renderBookCard(item))}
//               </ScrollView>
//             </View>
//           )}

//           {/* Trending Books */}
//           {/* <View style={styles.section}>
//             <View style={styles.sectionHeader}>
//               <Text style={styles.sectionTitle}>Books Around You</Text>
//               <TouchableOpacity activeOpacity={0.7}>
//                 <Ionicons
//                   name="arrow-forward"
//                   size={scale(18, width)}
//                   color="#000"
//                 />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.bookList}
//             >
//               {TRENDING_BOOKS.map((item) => renderBookCard(item))}
//             </ScrollView>
//           </View> */}
//           {!!data?.aroundYou?.length && (
//             <View style={styles.section}>
//               <View style={styles.sectionHeader}>
//                 <Text style={styles.sectionTitle}>Books Around You</Text>
//                 <TouchableOpacity activeOpacity={0.7}>
//                   <Ionicons
//                     name="arrow-forward"
//                     size={scale(18, width)}
//                     color="#000"
//                   />
//                 </TouchableOpacity>
//               </View>

//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.bookList}
//               >
//                 {data.aroundYou.map((item: any) => renderBookCard(item))}
//               </ScrollView>
//             </View>
//           )}

//           {/* <View
//             style={{
//               width: "100%",
//               height: 1,
//               backgroundColor: "#e0e8ecff",
//               marginTop: 30,
//             }}
//           />
//           <SuggestedBooksCart /> */}

//           {data?.explore && data.explore.length > 0 && (
//             <>
//               <View
//                 style={{
//                   width: "100%",
//                   height: 1,
//                   backgroundColor: "#e0e8ecff",
//                   marginTop: 30,
//                 }}
//               />
//               <SuggestedBooksCart books={data.explore} />
//             </>
//           )}
//           {isDashboardEmpty && (
//             <LocationEmptyState
//               title="No books found at this location"
//               subtitle="Change your location to discover books nearby"
//             />
//           )}
//         </ScrollView>
//         {/* Positioned absolutely at the bottom */}
//         <View
//           style={{
//             position: "absolute",
//             bottom: -50,
//             left: 0,
//             right: 0,
//             zIndex: 999,
//           }}
//           pointerEvents="box-none" // Allows touches to pass through empty space
//         >
//           <FloatingActionDock />
//         </View>
//       </LinearGradient>

//       <View style={{ height: insets.bottom, backgroundColor: "#ebf6ff" }} />
//     </View>
//   );
// };

// export default Dashboard;

// /* RESPONSIVE STYLES */

// const createStyles = (width: number, height: number) => {
//   const s = (size: number) => scale(size, width);
//   const vs = (size: number) => verticalScale(size, height);
//   const ms = (size: number, factor?: number) =>
//     moderateScale(size, factor, width);

//   const cardGap = s(12);
//   const cardW = s(160);
//   const gutter = s(16);

//   return StyleSheet.create({
//     container: { flex: 1 },
//     header: {
//       paddingTop: vs(50),
//       paddingHorizontal: gutter,
//       paddingBottom: vs(14),
    
      
//     },
//     headerRow: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//     },
//     locationBox: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: s(2),
//     },
//     locationTitle: {
//       fontSize: ms(16),
//       fontWeight: "bold",
//       color: "#000000",
//       marginHorizontal: s(1),
//     },
//     addressText: {
//       fontSize: ms(12),
//       color: "#000000E0",

//       fontWeight: "400",
//       marginBottom: vs(10),
//       width: "70%",
//     },
//     rightIcons: {
//       flexDirection: "row",
//       alignItems: "center",
//       gap: s(12),
//     },
//     coinBox: {
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: s(5),
//       paddingVertical: vs(2),
//       borderRadius: ms(20),
//       borderWidth: 2,
//       borderColor: "#6634c9a2",
//     },
//     coinIconWrapper: {
//       width: s(26),
//       height: s(26),
//       borderRadius: s(13),
//       justifyContent: "center",
//       alignItems: "center",
//       marginRight: s(6),
//       shadowColor: "#FFA500",
//       shadowOffset: { width: 0, height: 1 },
//       shadowOpacity: 0.4,
//       shadowRadius: 2,
//       elevation: 3,
//     },
//     coinText: {
//       fontSize: ms(16),
//       fontWeight: "800",
//       color: "#000000",
//       letterSpacing: 0.5,
//     },
//     avatarContainer: {
//       shadowColor: "#6634C9",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.3,
//       shadowRadius: 4,
//       elevation: 4,
//     },
//     avatarBorder: {
//       width: s(40),
//       height: s(40),
//       borderRadius: s(24),
//       justifyContent: "center",
//       alignItems: "center",
//       padding: 2,
//     },
//     avatar: {
//       width: s(38),
//       height: s(38),
//       borderRadius: s(22),
//       backgroundColor: "#E0E7FF",
//       overflow: "hidden",
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     profileImage: { width: "100%", height: "100%" },
//     searchBox: {
//       flexDirection: "row",
//       alignItems: "center",
//       backgroundColor: "#FFFFFF",
//       borderRadius: ms(28),
//       paddingHorizontal: gutter,
//       height: vs(50),
//       shadowColor: "#003EF9",
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       elevation: 6,
//       borderWidth: 1.5,
//       borderColor: "#003EF920",
//     },
//     searchPlaceholder: {
//       flex: 1,
//       marginLeft: s(10),
//       fontSize: ms(15),
//       color: "#00000060",
//       fontWeight: "500",
//     },
//     micDivider: {
//       width: 1,
//       height: "60%",
//       backgroundColor: "#00000015",
//       marginHorizontal: s(12),
//     },
//     mainContent: { flex: 1 },
//     scrollContent: { paddingBottom: vs(20) },
//     section: { marginTop: vs(20) },
//     separatedSection: {
//       marginTop: vs(30),
//       backgroundColor: "#efe9e97e",
//       borderRadius: ms(16),
//       marginHorizontal: 5,
//       paddingVertical: vs(15),
//     },
//     sectionHeader: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       paddingHorizontal: gutter,
//       marginBottom: vs(10),
//     },
//     sectionTitle: {
//       fontSize: ms(16),
//       fontWeight: "bold",
//       color: "#000",
//     },
//     bookList: {
//       paddingHorizontal: s(15),
//       paddingBottom: vs(5),
//     },
//     bookCard: {
//       width: cardW,
//       marginRight: cardGap,
//       backgroundColor: "#fff",
//       borderRadius: ms(12),
//       padding: s(8),
//       elevation: 2,
//       shadowColor: "#636161ff",
//       shadowOpacity: 0.1,
//       shadowRadius: 8,
//       shadowOffset: { width: 0, height: 4 },
//     },
//     imageWrapper: {
//       position: "relative",
//       height: vs(140),
//       marginBottom: vs(10),
//     },
//     distanceBadge: {
//       position: "absolute",
//       top: s(10),
//       left: s(10),
//       zIndex: 10,
//       flexDirection: "row",
//       alignItems: "center",
//       backgroundColor: "#fff",
//       paddingHorizontal: s(8),
//       paddingVertical: s(4),
//       borderRadius: ms(20),
//       gap: s(4),
//       shadowColor: "#000",
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       shadowOffset: { width: 0, height: 2 },
//       elevation: 3,
//     },
//     distanceText: {
//       fontSize: ms(10),
//       fontWeight: "700",
//       color: "#f91500ff",
//     },
//     imagePlaceholder: {
//       width: "100%",
//       height: "100%",
//       borderRadius: ms(8),
//       overflow: "hidden",
//       backgroundColor: "#F1F5F9",
//     },
//     bookImage: { width: "100%", height: "100%" },
//     infoContainer: { paddingHorizontal: s(2) },
//     bookName: {
//       fontSize: ms(13),
//       fontWeight: "600",
//       color: "#0F172A",
//       marginBottom: vs(6),
//       lineHeight: ms(18),
//       height: ms(36),
//     },
//     priceRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       marginBottom: vs(6),
//     },
//     mrp: {
//       fontSize: ms(12),
//       color: "#94A3B8",
//       textDecorationLine: "line-through",
//       fontWeight: "500",
//     },
//     price: {
//       fontSize: ms(14),
//       color: "#0F172A",
//       fontWeight: "700",
//     },
//     buyText: {
//       fontSize: ms(12),
//       color: "#003EF9",
//       fontWeight: "700",
//     },
//     gridContainer: { paddingHorizontal: gutter },
//     coinImage: {
//       width: 25,
//       height: 25,
//       marginRight: 6,
//     },

//     // UPDATED FLOATING BUTTON STYLES
//     floatingContainer: {
//       position: "absolute",
//       bottom: vs(40),
//       right: s(10),
//       zIndex: 1000,
//       alignItems: "center",
//       justifyContent: "center",
//     },
//     floatingUploadButton: {
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 4 },
//       shadowOpacity: 0.3,
//       shadowRadius: 8,
//       elevation: 10,
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     uploadButtonGradient: {
//       width: s(56),
//       height: s(56),
//       borderRadius: s(28),
//       justifyContent: "center",
//       alignItems: "center",
//     },
//     uploadButtonImage: { width: s(30), height: s(30), top: 3 },
//     // NEW TOOLTIP STYLES
//     tooltipContainer: {
//       position: "absolute",
//       bottom: s(70),
//       backgroundColor: "#fff",
//       paddingVertical: s(6),
//       paddingHorizontal: s(12),
//       borderRadius: s(8),
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.2,
//       shadowRadius: 4,
//       elevation: 5,
//       alignItems: "center",
//     },
//     tooltipText: {
//       fontSize: ms(12),
//       fontWeight: "bold",
//       color: "#002593",
//     },
//     tooltipArrow: {
//       position: "absolute",
//       bottom: -s(6),
//       width: 0,
//       height: 0,
//       backgroundColor: "transparent",
//       borderStyle: "solid",
//       borderLeftWidth: s(6),
//       borderRightWidth: s(6),
//       borderTopWidth: s(6),
//       borderLeftColor: "transparent",
//       borderRightColor: "transparent",
//       borderTopColor: "#fff",
//     },
//         loadingGif: {
//       width: s(100),
//       height: s(100),
//       marginBottom: vs(10),
//     },
//   });
// };


import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDashboardStore } from "../../Context/DashboardContext";
import { useLocationStore } from "../../Context/LocationContext";
import { useProfileStore } from "../../Context/ProfileContext";
import {
  getCurrentLocation,
  reverseGeocode,
} from "../../Services/locationService";

import { FloatingActionDock } from "../Components/FloatingUploadBtn";
import LocationEmptyState from "../Components/LocationEmptyState";
import SuggestedBooksCart from "../Components/SuggestedBooksCart";

// Responsive scaling utilities
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

const BANNERS = [
  {
    id: "1",
    image: require("../../assets/images/banner1.png"),
  },

  {
    id: "2",
    image: require("../../assets/images/banner6.jpeg"),
  },
   {
    id: "3",
    image: require("../../assets/images/banner7.jpeg"),
  },
    {
    id: "4",
    image: require("../../assets/images/banner8.jpeg"),
  },
  {
    id: "5",
    image: require("../../assets/images/banner9.jpeg"),
  },

];

const Dashboard = () => {
  const { profileImage, isProfileLoaded } = useProfileStore();
  const {
    formattedAddress,
    source,
    isReady,
    location,
    setGpsLocation,
    setLocationFormated,
  } = useLocationStore();
  const { data, loading, fetchDashboard } = useDashboardStore();

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const tooltipOpacity = useRef(new Animated.Value(0)).current;
  
  // State for banner carousel
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-rotate banners every 5 seconds
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === BANNERS.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
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

  useEffect(() => {
    if (source !== "gps") return;
    if (isReady) return; // already resolved

    const resolveGps = async () => {
      const coords = await getCurrentLocation();
      if (!coords) return;

      const address = await reverseGeocode(coords);
      setGpsLocation(coords, address);
      setLocationFormated(address);
    };

    resolveGps();
  }, [source, isReady]);

  useEffect(() => {
    if (!location || !isReady) return;

    fetchDashboard(location);
  }, [location, isReady]);

  const isDashboardEmpty =
    data &&
    data.nearYou.length === 0 &&
    data.aroundYou.length === 0 &&
    data.explore.length === 0;

  // Interpolate shake value to rotation degrees
  const spin = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  // Memoize styles to prevent unnecessary recalculations
  const styles = useMemo(() => createStyles(width, height), [width, height]);

  // Reusable Book Card Component matching BookNearMeScreen design
  const renderBookCard = (item: any) => (
    <TouchableOpacity
      key={item.book.id}
      style={styles.bookCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/(screen)/DiscloseScreen",
          params: {
            bookId: item.book.id,
            distance: item.distance_km,
          },
        })
      }
    >
      <View style={styles.imageWrapper}>
        <View style={styles.distanceBadge}>
          <Ionicons
            name="location-sharp"
            size={scale(10, width)}
            color="#f90000ff"
          />
          <Text style={styles.distanceText}>{item.distance_km} km</Text>
        </View>

        <View style={styles.imagePlaceholder}>
          <Image
            source={{ uri: item.book.images?.[0] }}
            style={styles.bookImage}
            contentFit="cover"
            transition={200}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.bookName} numberOfLines={2}>
          {item.book.title}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.mrp}>₹{item.book.original_price}</Text>
          <Text style={styles.price}>₹{item.book.generated_price}</Text>
        </View>

        <Text style={styles.buyText}>Buy at ₹{item.book.generated_price}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center",backgroundColor:'#ffffff00' }}>
        <Image
          source={require("../../assets/images/loading.gif")}
          style={styles.loadingGif}
          
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#ffffff", "#f2fbfbff"]}
        style={styles.container}
      >
        {/* HEADER WITH BACKGROUND BANNER */}
        <View style={styles.headerContainer}>
          {/* Banner Background */}
          <View style={styles.bannerContainer}>
            <Image
              source={BANNERS[currentBannerIndex].image}
              style={styles.bannerImage}
              contentFit="cover"
              transition={300}
            />
            
            {/* Overlay gradient for better text visibility */}
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'transparent']}
              style={styles.bannerOverlay}
            />
            
            {/* Banner Indicators */}
            <View style={styles.bannerIndicators}>
              {BANNERS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.bannerIndicator,
                    currentBannerIndex === index && styles.bannerIndicatorActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Header Content */}
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.locationBox}
                onPress={() => router.push("/Components/HomeLocationChange")}
              >
                <Ionicons
                  name="location-sharp"
                  size={scale(16, width)}
                  color="#fff"
                />
                <Text style={styles.locationTitle}>Home</Text>
                <Ionicons
                  name="chevron-down"
                  size={scale(16, width)}
                  color="#fff"
                />
              </TouchableOpacity>

              <View style={styles.rightIcons}>
                <TouchableOpacity
                  style={styles.coinBox}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(screen)/GoldSection")}
                >
                  <Image
                    source={require("../../assets/images/Front-coin.png")}
                    style={styles.coinImage}
                    contentFit="contain"
                  />
                  <Text style={styles.coinText}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarContainer}
                  onPress={() => router.push("/(screen)/Profile")}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["#ffffff4d", "#ffffff4d"]}
                    style={styles.avatarBorder}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.avatar}>
                      <Image
                        source={
                          profileImage
                            ? { uri: profileImage }
                            : require("../../assets/images/profile.png")
                        }
                        style={styles.profileImage}
                        contentFit="cover"
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.addressText} numberOfLines={1}>
              {!isReady ? "Fetching your location..." : formattedAddress}
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
        </View>

        {/* Main Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.mainContent}
        >
          {!!data?.nearYou?.length && (
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
                {data.nearYou.map((item: any) => renderBookCard(item))}
              </ScrollView>
            </View>
          )}

          {!!data?.aroundYou?.length && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Books Around You</Text>
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
                {data.aroundYou.map((item: any) => renderBookCard(item))}
              </ScrollView>
            </View>
          )}

          {data?.explore && data.explore.length > 0 && (
            <>
              <View
                style={{
                  width: "100%",
                  height: 1,
                  backgroundColor: "#e0e8ecff",
                  marginTop: 30,
                }}
              />
              <SuggestedBooksCart books={data.explore} />
            </>
          )}
          {isDashboardEmpty && (
            <LocationEmptyState
              title="No books found at this location"
              subtitle="Change your location to discover books nearby"
            />
          )}
        </ScrollView>
        
        {/* Positioned absolutely at the bottom */}
        <View
          style={{
            position: "absolute",
            bottom: -50,
            left: 0,
            right: 0,
            zIndex: 999,
          }}
          pointerEvents="box-none"
        >
          <FloatingActionDock />
        </View>
      </LinearGradient>

      <View style={{ height: insets.bottom, backgroundColor: "#ebf6ff" }} />
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
    
    // New Header Container with Banner
    headerContainer: {
      position: 'relative',
      overflow: 'hidden',
    },
    
    bannerContainer: {
      width: '100%',
      height: vs(290),
      position: 'relative',
      elevation:8,
      shadowColor:'red'
    },
    
    bannerImage: {
      width: '100%',
      height: '100%',
      elevation:8,
      shadowColor:'red'
    },
    
    bannerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: vs(280),
       elevation:8,
    },
    
    bannerIndicators: {
      position: 'absolute',
      bottom: s(15),
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: s(6),
    },
    
    bannerIndicator: {
      width: s(8),
      height: s(8),
      borderRadius: s(4),
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    
    bannerIndicatorActive: {
      backgroundColor: '#fff',
      width: s(20),
    },
    
    headerContent: {
      position: 'absolute',
      top: vs(50),
      left: 0,
      right: 0,
      paddingHorizontal: gutter,
      paddingBottom: vs(14),
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
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: s(10),
      paddingVertical: s(5),
      borderRadius: s(20),
      backdropFilter: 'blur(10px)',
    },
    
    locationTitle: {
      fontSize: ms(16),
      fontWeight: "bold",
      color: "#fff",
      marginHorizontal: s(1),
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    
    addressText: {
      fontSize: ms(12),
      color: "#fff",
      fontWeight: "500",
      marginTop: vs(8),
      marginBottom: vs(10),
      width: "70%",
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    
    rightIcons: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(12),
    },
    
    coinBox: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: s(5),
      paddingVertical: vs(2),
      borderRadius: ms(20),
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      borderWidth: 1,
      borderColor: '#ffffff4d',
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
      color: "#fff",
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    
    avatarContainer: {
      shadowColor: "#6634C9",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    
    avatarBorder: {
      width: s(40),
      height: s(40),
      borderRadius: s(24),
      justifyContent: "center",
      alignItems: "center",
      padding: 2,
    },
    
    avatar: {
      width: s(38),
      height: s(38),
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
      elevation: 2,
      shadowColor: "#636161ff",
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
    
    coinImage: {
      width: 25,
      height: 25,
      marginRight: 6,
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
      position: "absolute",
      bottom: s(70),
      backgroundColor: "#fff",
      paddingVertical: s(6),
      paddingHorizontal: s(12),
      borderRadius: s(8),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      alignItems: "center",
    },
    
    tooltipText: {
      fontSize: ms(12),
      fontWeight: "bold",
      color: "#002593",
    },
    
    tooltipArrow: {
      position: "absolute",
      bottom: -s(6),
      width: 0,
      height: 0,
      backgroundColor: "transparent",
      borderStyle: "solid",
      borderLeftWidth: s(6),
      borderRightWidth: s(6),
      borderTopWidth: s(6),
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderTopColor: "#fff",
    },
    
    loadingGif: {
      width: s(100),
      height: s(100),
      marginBottom: vs(10),
    },
  });
};