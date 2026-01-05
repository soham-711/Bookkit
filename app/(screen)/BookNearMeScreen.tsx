import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";


// === TYPES ===
type SortKey = "distanceAsc" | "priceAsc" | "priceDesc" | "titleAsc";


type Params = {
  selectedSort?: string;
  selectedMaxDistanceKm?: string;
  selectedMinPrice?: string;
  selectedMaxPrice?: string;
  selectedOnlyDiscounted?: string;
  searchTag?: string;
};


// === DATA ===
const BOOKS = [
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


// === UTILS ===
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;


const parseDistanceKm = (d: string) => {
  const s = d.trim().toLowerCase();
  if (s.endsWith("km")) return Number(s.replace("km", "").trim()) || 0;
  if (s.endsWith("m")) return (Number(s.replace("m", "").trim()) || 0) / 1000;
  return Number(s) || 0;
};


const toNumOrUndef = (v?: string) => {
  if (!v || !v.trim()) return undefined;
  const n = Number(v.trim());
  return Number.isFinite(n) ? n : undefined;
};


const toBool = (v?: string) => v === "true";


export default function BookNearMeScreen() {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width, height), [width, height]);
  const params = useLocalSearchParams<Params>();

  const [sortKey, setSortKey] = useState<SortKey>("distanceAsc");
  const [searchTag, setSearchTag] = useState<string>("");
  const [filters, setFilters] = useState({
    maxDistanceKm: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    onlyDiscounted: false,
  });

  // Apply params including search tag
  useEffect(() => {
    if (params.selectedSort) setSortKey(params.selectedSort as SortKey);
    
    if (params.searchTag) {
      setSearchTag(params.searchTag);
    }

    const maxD = toNumOrUndef(params.selectedMaxDistanceKm);
    const minP = toNumOrUndef(params.selectedMinPrice);
    const maxP = toNumOrUndef(params.selectedMaxPrice);
    const disc = toBool(params.selectedOnlyDiscounted);

    if (
      params.selectedMaxDistanceKm !== undefined ||
      params.selectedMinPrice !== undefined ||
      params.selectedMaxPrice !== undefined ||
      params.selectedOnlyDiscounted !== undefined
    ) {
      setFilters({
        maxDistanceKm: maxD,
        minPrice: minP,
        maxPrice: maxP,
        onlyDiscounted: disc,
      });
    }
  }, [params]);

  // Filter & Sort Data
  const data = useMemo(() => {
    const s = searchTag.trim().toLowerCase();
    let arr = BOOKS.filter((b) => !s || b.title.toLowerCase().includes(s));

    if (filters.maxDistanceKm != null) {
      arr = arr.filter((b) => parseDistanceKm(b.distance) <= filters.maxDistanceKm!);
    }
    if (filters.minPrice != null) {
      arr = arr.filter((b) => b.price >= filters.minPrice!);
    }
    if (filters.maxPrice != null) {
      arr = arr.filter((b) => b.price <= filters.maxPrice!);
    }
    if (filters.onlyDiscounted) {
      arr = arr.filter((b) => b.mrp > b.price);
    }

    const sorted = [...arr];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "priceAsc": return a.price - b.price;
        case "priceDesc": return b.price - a.price;
        case "titleAsc": return a.title.localeCompare(b.title);
        case "distanceAsc": default:
          return parseDistanceKm(a.distance) - parseDistanceKm(b.distance);
      }
    });
    return sorted;
  }, [searchTag, sortKey, filters]);

  // === RENDER ITEM WITH NAVIGATION TO DISCLOSURE PAGE ===
  const renderItem = ({ item }: { item: (typeof BOOKS)[number] }) => {
    return (
      <Pressable
        style={styles.bookCard}
        onPress={() => {
          // Navigate to disclosure/details page with book data
          router.push({
            pathname: '/(screen)/DiscloseScreen',
            params: {
              bookId: item.id,
              title: item.title,
              image: item.image,
              distance: item.distance,
              mrp: item.mrp.toString(),
              price: item.price.toString(),
            },
          });
        }}
      >
        {/* Image Section */}
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

        {/* Info Section */}
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
      </Pressable>
    );
  };

  // === UPDATED LIST HEADER WITH SEARCH TAG & CLICKABLE SEARCH ===
  const ListHeaderComponent = () => (
    <>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={styles.icon28.fontSize} color="#0B1220" />
        </Pressable>
        
        {/* Search Bar - Navigates to SearchScreen */}
        <Pressable 
          style={styles.searchBar}
          onPress={() => router.push("/(screen)/SearchScreen")}
        >
          <Ionicons 
            name="search-outline" 
            size={styles.icon20.fontSize} 
            color="#00000060" 
          />
          <Text style={styles.searchPlaceholder}>
            Search 
          </Text>
          <View style={styles.micDivider} />
          <Ionicons 
            name="mic" 
            size={styles.icon22.fontSize} 
            color="#000000ff" 
          />
        </Pressable>
        
        <Pressable 
          style={styles.sellBtn}
          onPress={() => router.push("/(screen)/UploadScreen1")}
        >
          <Image
            source={require("../../assets/images/Sellbook.png")}
            style={styles.sellBookImage}
            contentFit="contain"
          />
        </Pressable>
      </View>

      {/* Search Tag Chip - Shows when search is active */}
      {searchTag ? (
        <View style={styles.tagContainer}>
          <View style={styles.searchChip}>
            <Ionicons 
              name="search" 
              size={scale(14, width)} 
              color="#003EF9" 
            />
            <Text style={styles.chipText}>{searchTag}</Text>
            <Pressable 
              onPress={() => {
                setSearchTag("");
                router.setParams({ searchTag: "" });
              }}
              hitSlop={8}
            >
              <Ionicons 
                name="close-circle" 
                size={scale(16, width)} 
                color="#64748B" 
              />
            </Pressable>
          </View>
          <Text style={styles.resultCount}>
            {data.length} {data.length === 1 ? "result" : "results"} found
          </Text>
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.root}>
      {/* Light Blue Background Gradient */}
      <LinearGradient colors={["#ffffffff", "#f2fbfbff"]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeaderComponent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="search-outline" 
                size={scale(60, width)} 
                color="#CBD5E1" 
              />
              <Text style={styles.emptyText}>No books found</Text>
              {searchTag ? (
                <Text style={styles.emptySubtext}>
                  Try searching with different keywords
                </Text>
              ) : null}
            </View>
          }
        />

        {/* Bottom Filter/Sort Bar */}
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.bottomBtn, styles.bottomBtnLeft]}
            onPress={() => router.push({
              pathname: "../(screen)/SortScreen",
              params: { currentSort: sortKey },
            })}
          >
            <Ionicons name="swap-vertical" size={styles.icon18.fontSize} color="#0B1220" />
            <Text style={styles.bottomText}>Sort</Text>
          </Pressable>
          <View style={styles.bottomDivider} />
          <Pressable
            style={[styles.bottomBtn, styles.bottomBtnRight]}
            onPress={() => router.push({
              pathname: "../(screen)/FilterScreen",
              params: {
                currentMaxDistanceKm: filters.maxDistanceKm?.toString() ?? "",
                currentMinPrice: filters.minPrice?.toString() ?? "",
                currentMaxPrice: filters.maxPrice?.toString() ?? "",
                currentOnlyDiscounted: String(filters.onlyDiscounted),
              },
            })}
          >
            <Ionicons name="options-outline" size={styles.icon18.fontSize} color="#0B1220" />
            <Text style={styles.bottomText}>Filter</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}


// === STYLES (Same as before) ===
const createStyles = (width: number, height: number) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) => moderateScale(size, factor, width);

  const gutter = s(14);
  const cardGap = s(12);
  const cardW = (width - gutter * 2 - cardGap) / 2;
  const radius = ms(12);

  return StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
    
    icon18: { fontSize: ms(18) },
    icon20: { fontSize: ms(20) },
    icon22: { fontSize: ms(22) },
    icon28: { fontSize: ms(28) },

    // Top Bar
    topBar: {
      paddingHorizontal: s(16),
      paddingTop: Platform.select({ ios: vs(12), android: vs(20), default: vs(20) }),
      paddingBottom: vs(15),
      flexDirection: "row",
      alignItems: "center",
      gap: s(12),
    },
    backBtn: { 
      width: s(40), 
      height: s(40), 
      alignItems: "center", 
      justifyContent: "center" 
    },
    
    searchBar: {
      flex: 1,
      height: vs(50),
      borderRadius: ms(25),
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: s(16),
      backgroundColor: "#FFFFFF",
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
      fontWeight: "500" 
    },
    micDivider: {
      width: 1,
      height: "60%",
      backgroundColor: "#00000015",
      marginHorizontal: s(12),
    },
    
    sellBtn: { 
      width: s(44), 
      height: s(44), 
      alignItems: "center", 
      justifyContent: "center" 
    },
    sellBookImage: { width: s(32), height: s(32) },

    // Search Tag Chip Styles
    tagContainer: {
      paddingHorizontal: s(16),
      paddingBottom: vs(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    searchChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E0F2FE",
      borderRadius: ms(20),
      paddingVertical: s(8),
      paddingHorizontal: s(12),
      gap: s(6),
      borderWidth: 1,
      borderColor: "#003EF930",
    },
    chipText: {
      fontSize: ms(14),
      fontWeight: "600",
      color: "#003EF9",
    },
    resultCount: {
      fontSize: ms(13),
      fontWeight: "500",
      color: "#64748B",
    },

    // List
    listContent: { paddingHorizontal: gutter, paddingBottom: vs(100) },
    row: { justifyContent: "space-between", marginBottom: vs(12) },

    // Empty State
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: vs(80),
    },
    emptyText: {
      fontSize: ms(18),
      fontWeight: "600",
      color: "#0F172A",
      marginTop: vs(16),
      marginBottom: vs(8),
    },
    emptySubtext: {
      fontSize: ms(14),
      color: "#64748B",
      textAlign: "center",
    },

    // Card Styles
    bookCard: {
      width: cardW,
      backgroundColor: "#fff",
      borderRadius: radius,
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
    bookImage: {
      width: "100%",
      height: "100%",
    },
    infoContainer: {
      paddingHorizontal: s(2),
    },
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

    // Bottom Bar
    bottomBar: {
      position: "absolute",
      left: s(20),
      right: s(20),
      bottom: vs(20),
      height: vs(50),
      borderRadius: ms(25),
      backgroundColor: "#fff",
      flexDirection: "row",
      alignItems: "center",
      elevation: 6,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      borderWidth: 1.5,
      borderColor: "#003EF920",
    },
    bottomBtn: { 
      flex: 1, 
      height: "100%", 
      flexDirection: "row", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: s(6) 
    },
    bottomBtnLeft: { 
      borderTopLeftRadius: ms(25), 
      borderBottomLeftRadius: ms(25) 
    },
    bottomBtnRight: { 
      borderTopRightRadius: ms(25), 
      borderBottomRightRadius: ms(25) 
    },
    bottomDivider: { 
      width: 1, 
      height: "50%", 
      backgroundColor: "#E2E8F0" 
    },
    bottomText: { 
      fontSize: ms(13), 
      fontWeight: "600", 
      color: "#0F172A" 
    },
  });
};