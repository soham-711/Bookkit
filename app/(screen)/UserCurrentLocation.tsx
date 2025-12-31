// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import * as Location from "expo-location";
// import { router } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   Keyboard,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from "react-native";
// import MapView, { Circle, Region } from "react-native-maps";
// import { useSafeAreaInsets } from "react-native-safe-area-context";

// const DEFAULT_DELTA = {
//   latitudeDelta: 0.01,
//   longitudeDelta: 0.01,
// };

// // Responsive scaling utilities
// const scale = (size: number, width: number) => (width / 375) * size;
// const verticalScale = (size: number, height: number) => (height / 812) * size;
// const moderateScale = (size: number, factor: number = 0.5, width: number) =>
//   size + (scale(size, width) - size) * factor;

// export default function UserCurrentLocation() {
//   const { width, height } = useWindowDimensions();
//   const insets = useSafeAreaInsets(); // Get safe area insets
//   const mapRef = useRef<MapView>(null);

//   const [addressType, setAddressType] = useState<
//     "Home" | "Work" | "Other" | null
//   >(null);

//   /** 🔵 USER GPS LOCATION */
//   const [userLocation, setUserLocation] = useState<{
//     latitude: number;
//     longitude: number;
//     accuracy: number;
//   } | null>(null);

//   /** 📍 SELECTED LOCATION (MAP CENTER) */
//   const [selectedLocation, setSelectedLocation] = useState<{
//     latitude: number;
//     longitude: number;
//   } | null>(null);

//   const [keyboardHeight, setKeyboardHeight] = useState(0);
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
//   const bottomSheetAnim = useRef(new Animated.Value(0)).current;
//   const scrollViewRef = useRef<ScrollView>(null);

//   const [addressFields, setAddressFields] = useState({
//     formattedAddress: "",
//     block: "",
//     district: "",
//     city: "",
//     state: "",
//     pincode: "",
//     landmark: "",
//   });

//   const [addressComponents, setAddressComponents] = useState({
//     street: "",
//     city: "",
//     region: "",
//     country: "",
//     postalCode: "",
//   });

//   const [searchText, setSearchText] = useState("");
//   const [searchResults, setSearchResults] = useState<any[]>([]);
//   const [isSearching, setIsSearching] = useState(false);

//   /* ================= INIT ================= */
//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") return;

//       const pos = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.Balanced,
//       });

//       const coord = {
//         latitude: pos.coords.latitude,
//         longitude: pos.coords.longitude,
//         accuracy: pos.coords.accuracy ?? 50,
//       };

//       setUserLocation(coord);
//       setSelectedLocation(coord);

//       mapRef.current?.animateToRegion({ ...coord, ...DEFAULT_DELTA }, 800);

//       updateAddress(coord.latitude, coord.longitude);
//     })();

//     const show = Keyboard.addListener("keyboardDidShow", (e) => {
//       setKeyboardHeight(e.endCoordinates.height);
//       setIsKeyboardVisible(true);
//       Animated.timing(bottomSheetAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: false,
//       }).start();
//     });

//     const hide = Keyboard.addListener("keyboardDidHide", () => {
//       setKeyboardHeight(0);
//       setIsKeyboardVisible(false);
//       Animated.timing(bottomSheetAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: false,
//       }).start();
//     });

//     return () => {
//       show.remove();
//       hide.remove();
//     };
//   }, []);

//   const AddressTag = ({
//     label,
//     icon,
//   }: {
//     label: "Home" | "Work" | "Other";
//     icon: keyof typeof Ionicons.glyphMap;
//   }) => {
//     const isActive = addressType === label;
//     const styles = createStyles(width, height, insets);

//     return (
//       <TouchableOpacity
//         onPress={() => setAddressType(label)}
//         style={[styles.tag, isActive && styles.tagActive]}
//       >
//         <Ionicons
//           name={icon}
//           size={scale(16, width)}
//           color={isActive ? "#007AFF" : "#000"}
//         />
//         <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
//           {label}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   /* ================= USE CURRENT LOCATION ================= */
//   const handleCurrentLocation = async () => {
//     try {
//       let position = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });

//       const { latitude, longitude } = position.coords;

//       const newCoord = {
//         latitude,
//         longitude,
//       };

//       setSelectedLocation(newCoord);

//       mapRef.current?.animateToRegion(
//         {
//           ...newCoord,
//           latitudeDelta: 0.005,
//           longitudeDelta: 0.005,
//         },
//         1000
//       );

//       await updateAddress(latitude, longitude);
//     } catch (error) {
//       console.log("❌ Error getting current location:", error);
//     }
//   };

//   /* ================= MAP MOVE ================= */
//   const handleRegionChangeComplete = (region: Region) => {
//     const center = {
//       latitude: region.latitude,
//       longitude: region.longitude,
//     };

//     setSelectedLocation(center);
//     updateAddress(center.latitude, center.longitude);
//     setAddressFields((prev) => ({
//       ...prev,
//       block: "",
//       landmark: "",
//     }));
//   };

//   /* ================= REVERSE GEOCODE ================= */
//   const updateAddress = async (lat: number, lng: number) => {
//     try {
//       const res = await Location.reverseGeocodeAsync({
//         latitude: lat,
//         longitude: lng,
//       });
//       if (res.length > 0) {
//         const address = res[0];
//         console.log("📍 Address:", address);

//         const formattedAddr = [
//           address.name,
//           address.street,
//           address.district,
//           address.city,
//           address.region,
//           address.country,
//           address.postalCode,
//         ]
//           .filter(Boolean)
//           .join(", ");

//         setAddressFields((prev) => ({
//           ...prev,
//           formattedAddress: formattedAddr,
//           district: address.subregion || "",
//           city: address.city || "",
//           state: address.region || "",
//           pincode: address.postalCode || "",
//         }));
//       }
//     } catch (e) {
//       console.log("Reverse geocode error", e);
//     }
//   };

//   const handleSaveAddress = () => {
//     const addressParts = [
//       addressFields.formattedAddress,
//       addressFields.block,
//       addressFields.district,
//       addressFields.city,
//       addressFields.state,
//       addressFields.pincode,
//     ].filter(Boolean);

//     if (addressFields.landmark) {
//       addressParts.unshift(`Near ${addressFields.landmark}`);
//     }

//     const formattedAddress = addressParts.join(", ");

//     const addressData = {
//       ...addressFields,
//       addressType,
//       coordinates: selectedLocation,
//       formattedAddress: formattedAddress,
//       addressComponents: {
//         completeAddress: addressFields.formattedAddress,
//         block: addressFields.block,
//         district: addressFields.district,
//         city: addressFields.city,
//         state: addressFields.state,
//         pincode: addressFields.pincode,
//         landmark: addressFields.landmark,
//       },
//       savedAt: new Date().toISOString(),
//     };

//     console.log("✅ Saved Address:", addressData);
//     console.log("📍 Coordinates:", selectedLocation);
//     console.log("🏷️ Address Type:", addressType);
//     router.push('/(screen)/Dashboard')
//     alert(`Your address is saved ${addressData} and ${addressType}`)
//   }

//   const searchPlaces = async (query: string) => {
//     if (query.length < 3) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       setIsSearching(true);

//       const response = await fetch(
//         `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`
//       );

//       const data = await response.json();

//       const results = data.features.map((item: any) => ({
//         name: item.properties.name || "",
//         city: item.properties.city || "",
//         state: item.properties.state || "",
//         lat: item.geometry.coordinates[1],
//         lng: item.geometry.coordinates[0],
//       }));

//       setSearchResults(results);
//     } catch (err) {
//       console.log("Search error:", err);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   if (!selectedLocation) return null;

//   const BOTTOM_SHEET_RATIO = 0.38;
//   const BOTTOM_SHEET_HEIGHT = height * BOTTOM_SHEET_RATIO;

//   const bottomSheetPosition = bottomSheetAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, -(keyboardHeight * 0.5)],
//   });

//   const styles = createStyles(width, height, insets);

//   return (
//     <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={{ flex: 1 }}>
//       {/* ===== TOP ===== */}
//       <LinearGradient colors={["#FFFFFF", "#85F4FA"]} style={styles.topSection}>
//         {/* Back + Title */}
//         <View style={styles.headerRow}>
//           <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
//             <Ionicons
//               name="chevron-back"
//               size={scale(24, width)}
//               color="#000"
//             />
//           </TouchableOpacity>

//           <Text style={styles.headerText}>
//             Select your location to share knowledge
//           </Text>
//         </View>

//         {/* Search Bar */}
//         <View style={styles.searchBox}>
//           <Ionicons name="search" size={scale(18, width)} color="#003EF9" />
//           <TextInput
//             placeholder="Search your area, street name..."
//             placeholderTextColor="#6B6B6B"
//             style={styles.searchInput}
//             value={searchText}
//             onChangeText={(text) => {
//               setSearchText(text);
//               searchPlaces(text);
//             }}
//           />
//           <TouchableOpacity>
//             <Ionicons name="mic" size={scale(18, width)} color="#333" />
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       {searchResults.length > 0 && (
//         <View style={styles.searchDropdown}>
//           <ScrollView
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//           >
//             {searchResults.map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.searchItem}
//                 onPress={() => {
//                   const coord = {
//                     latitude: item.lat,
//                     longitude: item.lng,
//                   };

//                   setSearchText(`${item.name}, ${item.city}`);
//                   setSearchResults([]);
//                   Keyboard.dismiss();

//                   setSelectedLocation(coord);

//                   mapRef.current?.animateToRegion(
//                     {
//                       ...coord,
//                       latitudeDelta: 0.01,
//                       longitudeDelta: 0.01,
//                     },
//                     700
//                   );

//                   updateAddress(item.lat, item.lng);
//                 }}
//               >
//                 <Ionicons
//                   name="location-outline"
//                   size={scale(18, width)}
//                   color="#007AFF"
//                 />
//                 <View style={{ marginLeft: scale(10, width), flex: 1 }}>
//                   <Text style={styles.searchTitle} numberOfLines={1}>
//                     {item.name}
//                   </Text>
//                   <Text style={styles.searchSubtitle} numberOfLines={1}>
//                     {item.city} {item.state}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       )}

//       {/* ===== MAP CONTAINER ===== */}
//       <View style={styles.mapContainer}>
//         <MapView
//           ref={mapRef}
//           style={StyleSheet.absoluteFillObject}
//           customMapStyle={LightMapStyle}
//           initialRegion={{ ...selectedLocation, ...DEFAULT_DELTA }}
//           showsUserLocation={false}
//           onRegionChangeComplete={handleRegionChangeComplete}
//         >
//           {/* 🔵 CURRENT LOCATION INDICATOR */}
//           {userLocation && (
//             <Circle
//               center={{
//                 latitude: userLocation.latitude,
//                 longitude: userLocation.longitude,
//               }}
//               radius={userLocation.accuracy}
//               fillColor="rgba(0,122,255,0.15)"
//               strokeColor="rgba(0,122,255,0.4)"
//             />
//           )}
//         </MapView>

//         {/* 📍 FIXED CENTER PIN - Better centering method */}
//         <View pointerEvents="none" style={styles.centerPinContainer}>
//           <Ionicons
//             name="location-sharp"
//             size={scale(42, width)}
//             color="#FF3B30"
//           />
//         </View>

//         {/* 🔵 CENTER BLUE DOT */}
//         <View pointerEvents="none" style={styles.centerIndicator}>
//           <View style={styles.centerDot} />
//         </View>

//         {/* 📌 USE CURRENT LOCATION BUTTON */}
//         <Pressable
//           style={styles.currentLocationBtn}
//           onPress={handleCurrentLocation}
//         >
//           <MaterialIcons
//             name="my-location"
//             size={scale(20, width)}
//             color="#FF3B30"
//           />
//           <Text style={styles.currentLocationText}>Use current location</Text>
//         </Pressable>
//       </View>

//       {/* ===== BOTTOM ADDRESS CARD ===== */}
//       <Animated.View
//         style={[
//           styles.bottomCard,
//           {
//             transform: [{ translateY: bottomSheetPosition }],
//           },
//         ]}
//       >
//         <View style={styles.dragHandle} />

//         <ScrollView
//           ref={scrollViewRef}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           contentContainerStyle={styles.scrollContent}
//           style={{ flex: 1 }}
//         >
//           {/* Full Formatted Address */}
//           <Text style={styles.inputLabel}>Complete Address</Text>
//           <TextInput
//             placeholder="Complete Address"
//             placeholderTextColor="#FFFFFFE0"
//             style={[styles.addressInput, styles.fullWidthInput]}
//             value={addressFields.formattedAddress}
//             onChangeText={(text) =>
//               setAddressFields((prev) => ({ ...prev, formattedAddress: text }))
//             }
//             multiline
//             numberOfLines={2}
//             onFocus={() => {
//               setTimeout(() => {
//                 scrollViewRef.current?.scrollToEnd({ animated: true });
//               }, 300);
//             }}
//           />

//           {/* Block/District and State in 50-50 row */}
//           <View style={styles.row}>
//             <TextInput
//               placeholder="Block / Tehsil"
//               placeholderTextColor="#FFFFFFE0"
//               style={[styles.addressInput, styles.halfInput]}
//               value={addressFields.block}
//               onChangeText={(text) =>
//                 setAddressFields((prev) => ({ ...prev, block: text }))
//               }
//             />
//             <TextInput
//               placeholder="District"
//               placeholderTextColor="#FFFFFFE0"
//               style={[styles.addressInput, styles.halfInput]}
//               value={addressFields.district}
//               onChangeText={(text) =>
//                 setAddressFields((prev) => ({ ...prev, district: text }))
//               }
//             />
//           </View>

//           {/* City and State in 50-50 row */}
//           <View style={styles.row}>
//             <TextInput
//               placeholder="City"
//               placeholderTextColor="#FFFFFFE0"
//               style={[styles.addressInput, styles.halfInput]}
//               value={addressFields.city}
//               onChangeText={(text) =>
//                 setAddressFields((prev) => ({ ...prev, city: text }))
//               }
//             />
//             <TextInput
//               placeholder="State"
//               placeholderTextColor="#FFFFFFE0"
//               style={[styles.addressInput, styles.halfInput]}
//               value={addressFields.state}
//               onChangeText={(text) =>
//                 setAddressFields((prev) => ({ ...prev, state: text }))
//               }
//             />
//           </View>

//           {/* Pincode and Landmark in 50-50 row */}
//           <View style={styles.row}>
//             <TextInput
//               placeholder="PIN Code"
//               placeholderTextColor="#FFFFFFE0"
//               keyboardType="number-pad"
//               maxLength={6}
//               style={[styles.addressInput, styles.halfInput]}
//               value={addressFields.pincode}
//               onChangeText={(text) =>
//                 setAddressFields((prev) => ({ ...prev, pincode: text }))
//               }
//             />
//             <TextInput
//               placeholder="Landmark (Optional)"
//               placeholderTextColor="#FFFFFFE0"
//               style={[styles.addressInput, styles.halfInput]}
//               value={addressFields.landmark}
//               onChangeText={(text) =>
//                 setAddressFields((prev) => ({ ...prev, landmark: text }))
//               }
//             />
//           </View>

//           <Text style={styles.saveAsText}>Save address as</Text>

//           <View style={styles.tagRow}>
//             <AddressTag label="Home" icon="home-outline" />
//             <AddressTag label="Work" icon="briefcase-outline" />
//             <AddressTag label="Other" icon="location-outline" />
//           </View>
//         </ScrollView>

//         <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
//           <Text style={styles.saveBtnText}>Save address</Text>
//         </TouchableOpacity>
//       </Animated.View>
//     </LinearGradient>
//   );
// }

// /* ================= RESPONSIVE STYLES ================= */

// const createStyles = (width: number, height: number, insets: any) => {
//   const s = (size: number) => scale(size, width);
//   const vs = (size: number) => verticalScale(size, height);
//   const ms = (size: number, factor?: number) =>
//     moderateScale(size, factor, width);

//   return StyleSheet.create({
//     topSection: {
//       width: "100%",
//       paddingTop: Math.max(insets.top, vs(50)), // Respect safe area top
//       paddingBottom: vs(10),
//       paddingHorizontal: s(16),
//       borderBottomWidth: 0.2,
//     },

//     headerRow: {
//       flexDirection: "row",
//       alignItems: "center",
//       marginBottom: vs(10),
//     },

//     headerText: {
//       fontSize: ms(14),
//       fontWeight: "400",
//       color: "#000000",
//       marginLeft: s(5),
//       flexShrink: 1,
//       fontFamily: "poppins",
//     },

//     searchBox: {
//       flexDirection: "row",
//       alignItems: "center",
//       backgroundColor: "#ECEBEB",
//       borderRadius: ms(9),
//       paddingHorizontal: s(10),
//       height: vs(40),
//       elevation: 2,
//     },

//     searchInput: {
//       flex: 1,
//       fontSize: ms(15),
//       marginLeft: s(8),
//       color: "#000",
//       fontWeight: "400",
//       fontFamily: "Poppins",
//     },

//     mapContainer: {
//       height: height * 0.5,
//       position: "relative",
//     },

//     // Better pin centering using flexbox
//     centerPinContainer: {
//       position: "absolute",
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 23,
//       justifyContent: "center",
//       alignItems: "center",
//       marginBottom: vs(21), // Half of icon size to point to exact center
//       pointerEvents: "none",
//     },

//     centerIndicator: {
//       position: "absolute",
//       top: "50%",
//       left: "50%",
//       width: s(24),
//       height: s(24),
//       marginLeft: s(-12),
//       marginTop: s(-12),
//       borderRadius: s(12),
//       backgroundColor: "rgba(0,122,255,0.15)",
//       justifyContent: "center",
//       alignItems: "center",
//       zIndex: 1,
//       pointerEvents: "none",
//     },

//     centerDot: {
//       width: s(10),
//       height: s(10),
//       borderRadius: s(5),
//       backgroundColor: "#007AFF",
//     },

//     currentLocationBtn: {
//       position: "absolute",
//       right: s(10),
//       top: vs(5),
//       backgroundColor: "#fff",
//       padding: s(10),
//       paddingHorizontal: s(12),
//       borderRadius: s(25),
//       flexDirection: "row",
//       alignItems: "center",
//       elevation: 6,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.25,
//       shadowRadius: 3.84,
//     },

//     currentLocationText: {
//       marginLeft: s(8),
//       color: "#FF3B30",
//       fontWeight: "600",
//       fontSize: ms(13),
//     },

//     bottomCard: {
//       position: "absolute",
//       bottom: 0,
//       left: 0,
//       right: 0,
//       backgroundColor: "#ffff",
//       borderTopLeftRadius: ms(24),
//       borderTopRightRadius: ms(24),
//       borderLeftWidth: 1,
//       borderRightWidth: 1,
//       paddingHorizontal: s(15),
//       borderColor: "#7CF3FA",
//       borderTopWidth: 1,
//       paddingTop: vs(5),
//       paddingBottom: Math.max(insets.bottom, vs(10)), // Respect safe area bottom (gesture bar)
//       zIndex: 10,
//       maxHeight: height * 0.5,
//     },

//     dragHandle: {
//       width: s(40),
//       height: vs(5),
//       backgroundColor: "#4454FF",
//       alignSelf: "center",
//       borderRadius: ms(3),
//       marginBottom: vs(10),
//     },

//     scrollContent: {
//       paddingBottom: vs(10),
//     },

//     addressInput: {
//       backgroundColor: "#83AAAC",
//       borderRadius: ms(8),
//       padding: s(12),
//       color: "#000000E0",
//       marginBottom: vs(12),
//       fontSize: ms(14),
//       fontWeight: "400",
//     },

//     inputLabel: {
//       fontSize: ms(13),
//       fontWeight: "500",
//       color: "#333",
//       marginBottom: vs(5),
//       fontFamily: "Poppins",
//     },

//     row: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       gap: s(8),
//     },

//     halfInput: {
//       flex: 1,
//     },

//     fullWidthInput: {
//       width: "100%",
//       minHeight: vs(50),
//       textAlignVertical: "top",
//     },

//     saveAsText: {
//       fontSize: ms(12),
//       color: "#333",
//       marginBottom: vs(8),
//       marginTop: vs(4),
//       fontWeight: "400",
//     },

//     tagRow: {
//       flexDirection: "row",
//       marginBottom: vs(15),
//       flexWrap: "wrap",
//       gap: s(8),
//     },

//     tag: {
//       flexDirection: "row",
//       alignItems: "center",
//       backgroundColor: "#7FC1C5",
//       borderWidth: 1,
//       borderColor: "#44D6FF",
//       paddingVertical: vs(8),
//       paddingHorizontal: s(14),
//       borderRadius: ms(10),
//     },

//     tagActive: {
//       borderColor: "#007AFF",
//       backgroundColor: "#E3F2FD",
//     },

//     tagText: {
//       marginLeft: s(6),
//       fontSize: ms(13),
//       color: "#000",
//       fontWeight: "500",
//     },

//     tagTextActive: {
//       color: "#007AFF",
//       fontWeight: "600",
//     },

//     saveBtn: {
//       backgroundColor: "#528487",
//       paddingVertical: vs(14),
//       borderRadius: ms(8),
//       alignItems: "center",
//       marginTop: vs(5),
//       marginBottom: vs(5), // Extra spacing for navigation bar
//     },

//     saveBtnText: {
//       color: "#FFFFFFE0",
//       fontSize: ms(15),
//       fontWeight: "600",
//     },

//     searchDropdown: {
//       position: "absolute",
//       top: Math.max(insets.top, vs(50)) + vs(60), // Position below header with safe area
//       left: s(16),
//       right: s(16),
//       backgroundColor: "#fff",
//       borderRadius: ms(8),
//       maxHeight: vs(220),
//       elevation: 8,
//       zIndex: 1000,
//       shadowColor: "#000",
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.25,
//       shadowRadius: 3.84,
//     },

//     searchItem: {
//       flexDirection: "row",
//       alignItems: "center",
//       padding: s(12),
//       borderBottomWidth: 0.5,
//       borderBottomColor: "#ddd",
//     },

//     searchTitle: {
//       fontSize: ms(14),
//       fontWeight: "600",
//       color: "#000",
//     },

//     searchSubtitle: {
//       fontSize: ms(12),
//       color: "#666",
//       marginTop: vs(2),
//     },
//   });
// };

// /* ===== LIGHT MAP STYLE ===== */
// const LightMapStyle = [
//   { elementType: "geometry", stylers: [{ color: "#eef1f2" }] },
//   { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
//   { featureType: "poi", stylers: [{ visibility: "off" }] },
//   { featureType: "transit", stylers: [{ visibility: "off" }] },
//   {
//     featureType: "road",
//     elementType: "geometry",
//     stylers: [{ color: "#ffffff" }],
//   },
//   {
//     featureType: "water",
//     elementType: "geometry",
//     stylers: [{ color: "#A7DBFF" }],
//   },
// ];

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import MapView, { Circle, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../Utils/supabase"; // Import your Supabase client

const DEFAULT_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Responsive scaling utilities
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

export default function UserCurrentLocation() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets(); // Get safe area insets
  const mapRef = useRef<MapView>(null);

  /** 🔵 USER GPS LOCATION */
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  /** 📍 SELECTED LOCATION (MAP CENTER) */
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Updated address state to match Supabase schema
  const [addressFields, setAddressFields] = useState({
    address_type: null as "home" | "work" | "other" | null,
    full_address: "",
    house_flatno: "",
    street: "",
    village: "",
    city: "",
    district: "",
    block: "",
    state: "",
    pincode: "",
    landmark: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const AddressTag = ({
    label,
    icon,
  }: {
    label: "home" | "work" | "other";
    icon: keyof typeof Ionicons.glyphMap;
  }) => {
    const isActive = addressFields.address_type === label;
    const styles = createStyles(width, height, insets);

    const displayLabel = label.charAt(0).toUpperCase() + label.slice(1);

    return (
      <TouchableOpacity
        onPress={() =>
          setAddressFields((prev) => ({ ...prev, address_type: label }))
        }
        style={[styles.tag, isActive && styles.tagActive]}
      >
        <Ionicons
          name={icon}
          size={scale(16, width)}
          color={isActive ? "#007AFF" : "#000"}
        />
        <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
          {displayLabel}
        </Text>
      </TouchableOpacity>
    );
  };

  /* ================= INIT ================= */
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coord = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? 50,
      };

      setUserLocation(coord);
      setSelectedLocation(coord);
      setAddressFields((prev) => ({
        ...prev,
        latitude: coord.latitude,
        longitude: coord.longitude,
      }));

      mapRef.current?.animateToRegion({ ...coord, ...DEFAULT_DELTA }, 800);

      updateAddress(coord.latitude, coord.longitude);
    })();

    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
      Animated.timing(bottomSheetAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
      Animated.timing(bottomSheetAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /* ================= USE CURRENT LOCATION ================= */
  const handleCurrentLocation = async () => {
    try {
      let position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      const newCoord = {
        latitude,
        longitude,
      };

      setSelectedLocation(newCoord);
      setAddressFields((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));
      mapRef.current?.animateToRegion(
        {
          ...newCoord,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );

      await updateAddress(latitude, longitude);
    } catch (error) {
      console.log("❌ Error getting current location:", error);
    }
  };

  /* ================= MAP MOVE ================= */
  const handleRegionChangeComplete = (region: Region) => {
    const center = {
      latitude: region.latitude,
      longitude: region.longitude,
    };

    setSelectedLocation(center);
    updateAddress(center.latitude, center.longitude);

    // Clear manual input fields when location changes
    setAddressFields((prev) => ({
      ...prev,
      house_flatno: "",
      village: "",
      block: "",
      district: "",
      landmark: "",
      latitude: center.latitude,
      longitude: center.longitude,
    }));
  };

  /* ================= REVERSE GEOCODE ================= */
  const updateAddress = async (lat: number, lng: number) => {
    try {
      const res = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });
      if (res.length > 0) {
        const address = res[0];
        console.log("📍 Address:", address);

        // Auto-fill only these fields (user can edit them)
        setAddressFields((prev) => ({
          ...prev,
          street: address.street || "",
          city: address.city || "",
          state: address.region || "",
          pincode: address.postalCode || "",
        }));

        // Build full_address from available auto-filled data
        const autoFilledParts = [
          address.street,
          address.city,
          address.region,
          address.postalCode,
        ].filter(Boolean);

        setAddressFields((prev) => ({
          ...prev,
          full_address: autoFilledParts.join(", "),
        }));
      }
    } catch (e) {
      console.log("Reverse geocode error", e);
    }
  };

  /* ================= SAVE ADDRESS TO SUPABASE ================= */
  const handleSaveAddress = async () => {
    if (
      !addressFields.city ||
      !addressFields.state ||
      !addressFields.pincode ||
      !addressFields.address_type
    ) {
      alert("Please fill required fields");
      return;
    }

    const addressParts = [
      addressFields.house_flatno,
      addressFields.street,
      addressFields.village,
      addressFields.block,
      addressFields.district,
      addressFields.city,
      addressFields.state,
      addressFields.pincode,
    ].filter(Boolean);

    if (addressFields.landmark) {
      addressParts.unshift(`Near ${addressFields.landmark}`);
    }

    const fullAddress = addressParts.join(", ");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("User not authenticated");
      return;
    }

    /** 🔹 CHECK IF USER ALREADY HAS DEFAULT ADDRESS */
    const { data: existingDefault } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle();

    const isDefault = !existingDefault; // ✅ FIRST ADDRESS ONLY

    /** 🔹 INSERT ADDRESS */
    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      address_type: addressFields.address_type,
      full_address: fullAddress,
      house_flatno: addressFields.house_flatno,
      street: addressFields.street,
      village: addressFields.village,
      city: addressFields.city,
      district: addressFields.district,
      block: addressFields.block,
      state: addressFields.state,
      pincode: addressFields.pincode,
      landmark: addressFields.landmark,
      latitude: addressFields.latitude,
      longitude: addressFields.longitude,
      is_default: isDefault,
    });

    if (error) {
      console.error(error);
      alert("Failed to save address");
      return;
    }

    alert(isDefault ? "Address saved as default" : "Address saved");
    router.push("/(screen)/Dashboard");
  };

  /* ================= SEARCH PLACES ================= */
  const searchPlaces = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);

      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`
      );

      const data = await response.json();

      const results = data.features.map((item: any) => ({
        name: item.properties.name || "",
        city: item.properties.city || "",
        state: item.properties.state || "",
        lat: item.geometry.coordinates[1],
        lng: item.geometry.coordinates[0],
      }));

      setSearchResults(results);
    } catch (err) {
      console.log("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!selectedLocation) return null;

  const BOTTOM_SHEET_RATIO = 0.38;
  const BOTTOM_SHEET_HEIGHT = height * BOTTOM_SHEET_RATIO;

  const bottomSheetPosition = bottomSheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(keyboardHeight * 0.5)],
  });

  const styles = createStyles(width, height, insets);

  return (
    <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={{ flex: 1 }}>
      {/* ===== TOP ===== */}
      <LinearGradient colors={["#FFFFFF", "#85F4FA"]} style={styles.topSection}>
        {/* Back + Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={scale(24, width)}
              color="#000"
            />
          </TouchableOpacity>

          <Text style={styles.headerText}>
            Select your location to share knowledge
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={scale(18, width)} color="#003EF9" />
          <TextInput
            placeholder="Search your area, street name..."
            placeholderTextColor="#6B6B6B"
            style={styles.searchInput}
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              searchPlaces(text);
            }}
          />
          <TouchableOpacity>
            <Ionicons name="mic" size={scale(18, width)} color="#333" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {searchResults.length > 0 && (
        <View style={styles.searchDropdown}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {searchResults.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.searchItem}
                onPress={() => {
                  const coord = {
                    latitude: item.lat,
                    longitude: item.lng,
                  };

                  setSearchText(`${item.name}, ${item.city}`);
                  setSearchResults([]);
                  Keyboard.dismiss();

                  setSelectedLocation(coord);

                  mapRef.current?.animateToRegion(
                    {
                      ...coord,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    },
                    700
                  );

                  updateAddress(item.lat, item.lng);
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={scale(18, width)}
                  color="#007AFF"
                />
                <View style={{ marginLeft: scale(10, width), flex: 1 }}>
                  <Text style={styles.searchTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.searchSubtitle} numberOfLines={1}>
                    {item.city} {item.state}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* ===== MAP CONTAINER ===== */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          customMapStyle={LightMapStyle}
          initialRegion={{ ...selectedLocation, ...DEFAULT_DELTA }}
          showsUserLocation={false}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {/* 🔵 CURRENT LOCATION INDICATOR */}
          {userLocation && (
            <Circle
              center={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              radius={userLocation.accuracy}
              fillColor="rgba(0,122,255,0.15)"
              strokeColor="rgba(0,122,255,0.4)"
            />
          )}
        </MapView>

        {/* 📍 FIXED CENTER PIN - Better centering method */}
        <View pointerEvents="none" style={styles.centerPinContainer}>
          <Ionicons
            name="location-sharp"
            size={scale(42, width)}
            color="#FF3B30"
          />
        </View>

        {/* 🔵 CENTER BLUE DOT */}
        <View pointerEvents="none" style={styles.centerIndicator}>
          <View style={styles.centerDot} />
        </View>

        {/* 📌 USE CURRENT LOCATION BUTTON */}
        <Pressable
          style={styles.currentLocationBtn}
          onPress={handleCurrentLocation}
        >
          <MaterialIcons
            name="my-location"
            size={scale(20, width)}
            color="#FF3B30"
          />
          <Text style={styles.currentLocationText}>Use current location</Text>
        </Pressable>
      </View>

      {/* ===== BOTTOM ADDRESS CARD ===== */}
      <Animated.View
        style={[
          styles.bottomCard,
          {
            transform: [{ translateY: bottomSheetPosition }],
          },
        ]}
      >
        <View style={styles.dragHandle} />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          style={{ flex: 1 }}
        >
          {/* Full Address (auto-filled from map, editable) */}
          <Text style={styles.inputLabel}>Complete Address</Text>
          <TextInput
            placeholder="Complete address will auto-fill from map"
            placeholderTextColor="#FFFFFFE0"
            style={[styles.addressInput, styles.fullWidthInput]}
            value={addressFields.full_address}
            onChangeText={(text) =>
              setAddressFields((prev) => ({ ...prev, full_address: text }))
            }
            multiline
            numberOfLines={2}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />

          {/* House/Flat No (Manual input) */}
          <TextInput
            placeholder="House / Flat / Plot No"
            placeholderTextColor="#FFFFFFE0"
            style={[styles.addressInput, styles.fullWidthInput]}
            value={addressFields.house_flatno}
            onChangeText={(text) =>
              setAddressFields((prev) => ({ ...prev, house_flatno: text }))
            }
          />

          {/* Row: Street (auto-filled) & Village/Area (manual) */}
          <View style={styles.row}>
            <TextInput
              placeholder="Street / Locality"
              placeholderTextColor="#FFFFFFE0"
              style={[styles.addressInput, styles.halfInput]}
              value={addressFields.street}
              onChangeText={(text) =>
                setAddressFields((prev) => ({ ...prev, street: text }))
              }
            />
            <TextInput
              placeholder="Village / Area"
              placeholderTextColor="#FFFFFFE0"
              style={[styles.addressInput, styles.halfInput]}
              value={addressFields.village}
              onChangeText={(text) =>
                setAddressFields((prev) => ({ ...prev, village: text }))
              }
            />
          </View>

          {/* Row: City (mandatory) & Block/Ward (manual) */}
          <View style={styles.row}>
            <TextInput
              placeholder="City *"
              placeholderTextColor="#FFFFFFE0"
              style={[styles.addressInput, styles.halfInput]}
              value={addressFields.city}
              onChangeText={(text) =>
                setAddressFields((prev) => ({ ...prev, city: text }))
              }
            />
            <TextInput
              placeholder="Block / Ward"
              placeholderTextColor="#FFFFFFE0"
              style={[styles.addressInput, styles.halfInput]}
              value={addressFields.block}
              onChangeText={(text) =>
                setAddressFields((prev) => ({ ...prev, block: text }))
              }
            />
          </View>

          {/* Row: District (manual) & State (auto-filled) */}
          <View style={styles.row}>
            <TextInput
              placeholder="District"
              placeholderTextColor="#FFFFFFE0"
              style={[styles.addressInput, styles.halfInput]}
              value={addressFields.district}
              onChangeText={(text) =>
                setAddressFields((prev) => ({ ...prev, district: text }))
              }
            />
            <TextInput
              placeholder="State *"
              placeholderTextColor="#FFFFFFE0"
              style={[styles.addressInput, styles.halfInput]}
              value={addressFields.state}
              onChangeText={(text) =>
                setAddressFields((prev) => ({ ...prev, state: text }))
              }
            />
          </View>

          {/* Row: PIN Code (auto-filled) & Landmark (optional) */}
          <View style={styles.row}>
            <TextInput
              placeholder="PIN Code *"
              placeholderTextColor="#FFFFFFE0"
              keyboardType="number-pad"
              maxLength={6}
              style={[styles.addressInput, styles.halfInput]}
              value={addressFields.pincode}
              onChangeText={(text) =>
                setAddressFields((prev) => ({ ...prev, pincode: text }))
              }
            />
            <TextInput
              placeholder="Landmark (Optional)"
              placeholderTextColor="#FFFFFFE0"
              style={[styles.addressInput, styles.halfInput]}
              value={addressFields.landmark}
              onChangeText={(text) =>
                setAddressFields((prev) => ({ ...prev, landmark: text }))
              }
            />
          </View>

          <Text style={styles.saveAsText}>Save address as</Text>

          <View style={styles.tagRow}>
            <AddressTag label="home" icon="home-outline" />
            <AddressTag label="work" icon="briefcase-outline" />
            <AddressTag label="other" icon="location-outline" />
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
          <Text style={styles.saveBtnText}>Save address</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

/* ================= RESPONSIVE STYLES ================= */

const createStyles = (width: number, height: number, insets: any) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  return StyleSheet.create({
    topSection: {
      width: "100%",
      paddingTop: Math.max(insets.top, vs(50)), // Respect safe area top
      paddingBottom: vs(10),
      paddingHorizontal: s(16),
      borderBottomWidth: 0.2,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: vs(10),
    },

    headerText: {
      fontSize: ms(14),
      fontWeight: "400",
      color: "#000000",
      marginLeft: s(5),
      flexShrink: 1,
      fontFamily: "poppins",
    },

    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ECEBEB",
      borderRadius: ms(9),
      paddingHorizontal: s(10),
      height: vs(40),
      elevation: 2,
    },

    searchInput: {
      flex: 1,
      fontSize: ms(15),
      marginLeft: s(8),
      color: "#000",
      fontWeight: "400",
      fontFamily: "Poppins",
    },

    mapContainer: {
      height: height * 0.5,
      position: "relative",
    },

    // Better pin centering using flexbox
    centerPinContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 23,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: vs(21), // Half of icon size to point to exact center
      pointerEvents: "none",
    },

    centerIndicator: {
      position: "absolute",
      top: "50%",
      left: "50%",
      width: s(24),
      height: s(24),
      marginLeft: s(-12),
      marginTop: s(-12),
      borderRadius: s(12),
      backgroundColor: "rgba(0,122,255,0.15)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
      pointerEvents: "none",
    },

    centerDot: {
      width: s(10),
      height: s(10),
      borderRadius: s(5),
      backgroundColor: "#007AFF",
    },

    currentLocationBtn: {
      position: "absolute",
      right: s(10),
      top: vs(5),
      backgroundColor: "#fff",
      padding: s(10),
      paddingHorizontal: s(12),
      borderRadius: s(25),
      flexDirection: "row",
      alignItems: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },

    currentLocationText: {
      marginLeft: s(8),
      color: "#FF3B30",
      fontWeight: "600",
      fontSize: ms(13),
    },

    bottomCard: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "#ffff",
      borderTopLeftRadius: ms(24),
      borderTopRightRadius: ms(24),
      borderLeftWidth: 1,
      borderRightWidth: 1,
      paddingHorizontal: s(15),
      borderColor: "#7CF3FA",
      borderTopWidth: 1,
      paddingTop: vs(5),
      paddingBottom: Math.max(insets.bottom, vs(10)), // Respect safe area bottom (gesture bar)
      zIndex: 10,
      maxHeight: height * 0.5,
    },

    dragHandle: {
      width: s(40),
      height: vs(5),
      backgroundColor: "#4454FF",
      alignSelf: "center",
      borderRadius: ms(3),
      marginBottom: vs(10),
    },

    scrollContent: {
      paddingBottom: vs(10),
    },

    addressInput: {
      backgroundColor: "#83AAAC",
      borderRadius: ms(8),
      padding: s(12),
      color: "#000000E0",
      marginBottom: vs(12),
      fontSize: ms(14),
      fontWeight: "400",
    },

    inputLabel: {
      fontSize: ms(13),
      fontWeight: "500",
      color: "#333",
      marginBottom: vs(5),
      fontFamily: "Poppins",
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: s(8),
    },

    halfInput: {
      flex: 1,
    },

    fullWidthInput: {
      width: "100%",
      minHeight: vs(50),
      textAlignVertical: "top",
    },

    saveAsText: {
      fontSize: ms(12),
      color: "#333",
      marginBottom: vs(8),
      marginTop: vs(4),
      fontWeight: "400",
    },

    tagRow: {
      flexDirection: "row",
      marginBottom: vs(15),
      flexWrap: "wrap",
      gap: s(8),
    },

    tag: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#7FC1C5",
      borderWidth: 1,
      borderColor: "#44D6FF",
      paddingVertical: vs(8),
      paddingHorizontal: s(14),
      borderRadius: ms(10),
    },

    tagActive: {
      borderColor: "#007AFF",
      backgroundColor: "#E3F2FD",
    },

    tagText: {
      marginLeft: s(6),
      fontSize: ms(13),
      color: "#000",
      fontWeight: "500",
    },

    tagTextActive: {
      color: "#007AFF",
      fontWeight: "600",
    },

    saveBtn: {
      backgroundColor: "#528487",
      paddingVertical: vs(14),
      borderRadius: ms(8),
      alignItems: "center",
      marginTop: vs(5),
      marginBottom: vs(5), // Extra spacing for navigation bar
    },

    saveBtnText: {
      color: "#FFFFFFE0",
      fontSize: ms(15),
      fontWeight: "600",
    },

    searchDropdown: {
      position: "absolute",
      top: Math.max(insets.top, vs(50)) + vs(60), // Position below header with safe area
      left: s(16),
      right: s(16),
      backgroundColor: "#fff",
      borderRadius: ms(8),
      maxHeight: vs(220),
      elevation: 8,
      zIndex: 1000,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },

    searchItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: s(12),
      borderBottomWidth: 0.5,
      borderBottomColor: "#ddd",
    },

    searchTitle: {
      fontSize: ms(14),
      fontWeight: "600",
      color: "#000",
    },

    searchSubtitle: {
      fontSize: ms(12),
      color: "#666",
      marginTop: vs(2),
    },
  });
};

/* ===== LIGHT MAP STYLE ===== */
const LightMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#eef1f2" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#A7DBFF" }],
  },
];
