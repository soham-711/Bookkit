import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocationStore } from "../../Context/LocationContext";
import { fetchBooksByDistance } from "../../Services/dashboardService";
import { LocationCoords } from "../../Services/locationService";
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

// === DATA ==

// === UTILS ===
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

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
  const { location, isReady } = useLocationStore();

  const lastLocationKeyRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[]>([]);

  const buildLocationKey = (location: LocationCoords) =>
    `${location.latitude.toFixed(4)}-${location.longitude.toFixed(4)}`;

  const fetchNearMeBooks = async (location: LocationCoords, force = false) => {
    const key = buildLocationKey(location);

    // 🚫 prevent unnecessary refetch
    if (!force && lastLocationKeyRef.current === key) {
      return;
    }

    lastLocationKeyRef.current = key;

    try {
      setLoading(true);

      // ✅ CALL YOUR EXISTING SERVICE
      const data = await fetchBooksByDistance(location, 0, 5);

      setBooks(data);
    } catch (err) {
      console.error("Near me fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isReady || !location) return;
    fetchNearMeBooks(location);
  }, [location, isReady]);

  const SkeletonCard = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => {
    const styles = createStyles(width, height);

    return (
      <View style={[styles.bookCard, { opacity: 0.6 }]}>
        <View style={styles.imageWrapper}>
          <View
            style={[styles.imagePlaceholder, { backgroundColor: "#E5E7EB" }]}
          />
        </View>

        <View style={styles.infoContainer}>
          <View
            style={{
              height: 14,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
              marginBottom: 8,
            }}
          />
          <View
            style={{
              height: 12,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
              width: "60%",
              marginBottom: 6,
            }}
          />
          <View
            style={{
              height: 12,
              backgroundColor: "#E5E7EB",
              borderRadius: 6,
              width: "40%",
            }}
          />
        </View>
      </View>
    );
  };

  const LoaderGrid = () => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} width={width} height={height} />
      ))}
    </View>
  );

  // Filter & Sort Data
  // === RENDER ITEM WITH NAVIGATION TO DISCLOSURE PAGE ===
  const renderItem = ({ item }: { item: any }) => {
    return (
      <Pressable
        style={styles.bookCard}
        onPress={() =>
          router.push({
            pathname: '/(screen)/DiscloseScreen',
            params: {
              bookId: item.book.id,
              distance: item.distance_km,
            },
          })
        }
      >
        {/* Image Section */}
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

        {/* Info Section */}
        <View style={styles.infoContainer}>
          <Text style={styles.bookName} numberOfLines={2}>
            {item.book.title}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.mrp}>₹{item.book.original_price}</Text>
            <Text style={styles.price}>₹{item.book.generated_price}</Text>
          </View>

          <Text style={styles.buyText}>
            Buy at ₹{item.book.generated_price}
          </Text>
        </View>
      </Pressable>
    );
  };

  // === FIXED HEADER COMPONENT ===
  const HeaderComponent = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={styles.icon28.fontSize}
            color="#0B1220"
          />
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
          <Text style={styles.searchPlaceholder}>Search</Text>
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
            <Ionicons name="search" size={scale(14, width)} color="#003EF9" />
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
            {books.length} {books.length === 1 ? "result" : "results"} found
          </Text>
        </View>
      ) : null}
    </View>
  );

  // === LIST CONTENT HEADER (EMPTY TO OFFSET FIXED HEADER) ===
  const ListHeaderSpacer = () => <View style={styles.listHeaderSpacer} />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Light Blue Background Gradient */}
      <LinearGradient
        colors={["#ffffffff", "#f2fbfbff"]}
        style={StyleSheet.absoluteFill}
      />

      {/* FIXED HEADER */}
      <HeaderComponent />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.book.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeaderSpacer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            loading ? (
              <LoaderGrid />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={scale(60, width)}
                  color="#CBD5E1"
                />
                <Text style={styles.emptyText}>No books found</Text>
              </View>
            )
          }
        />

        {/* Bottom Filter/Sort Bar */}
        <View style={styles.bottomBar}>
          <Pressable
            style={[styles.bottomBtn, styles.bottomBtnLeft]}
            onPress={() =>
              router.push({
                pathname: "../(screen)/SortScreen",
                params: { currentSort: sortKey },
              })
            }
          >
            <Ionicons
              name="swap-vertical"
              size={styles.icon18.fontSize}
              color="#0B1220"
            />
            <Text style={styles.bottomText}>Sort</Text>
          </Pressable>
          <View style={styles.bottomDivider} />
          <Pressable
            style={[styles.bottomBtn, styles.bottomBtnRight]}
            onPress={() =>
              router.push({
                pathname: "../(screen)/FilterScreen",
                params: {
                  currentMaxDistanceKm: filters.maxDistanceKm?.toString() ?? "",
                  currentMinPrice: filters.minPrice?.toString() ?? "",
                  currentMaxPrice: filters.maxPrice?.toString() ?? "",
                  currentOnlyDiscounted: String(filters.onlyDiscounted),
                },
              })
            }
          >
            <Ionicons
              name="options-outline"
              size={styles.icon18.fontSize}
              color="#0B1220"
            />
            <Text style={styles.bottomText}>Filter</Text>
          </Pressable>
        </View>

        {/* Transparent Bottom Safe Area */}
        <View style={styles.bottomSafeArea} />
      </SafeAreaView>
    </View>
  );
}

// === UPDATED STYLES ===
const createStyles = (width: number, height: number) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  const gutter = s(14);
  const cardGap = s(12);
  const cardW = (width - gutter * 2 - cardGap) / 2;
  const radius = ms(12);

  // Calculate header height based on content
  const topBarHeight = vs(70); // Increased for better alignment
  const tagContainerHeight = vs(50);
  const headerTotalHeight = topBarHeight;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: "#ffffff",
    },
    safe: {
      flex: 1,
    },

    // Fixed Header Container
    headerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: "#ffffff",
      paddingTop: Platform.select({
        ios: 0,
        android: StatusBar.currentHeight,
        default: 0,
      }),
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },

    icon18: { fontSize: ms(18) },
    icon20: { fontSize: ms(20) },
    icon22: { fontSize: ms(22) },
    icon28: { fontSize: ms(28) },

    // Top Bar - Improved Alignment
    topBar: {
      height: topBarHeight,
      paddingHorizontal: s(16),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backBtn: {
      width: s(44),
      height: s(44),
      alignItems: "center",
      justifyContent: "center",
      borderRadius: s(22),
      backgroundColor: "#f8fafc",
    },

    searchBar: {
      flex: 1,
      height: vs(50),
      marginHorizontal: s(12),
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
      fontWeight: "500",
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
      justifyContent: "center",
      borderRadius: s(22),
      backgroundColor: "#f8fafc",
    },
    sellBookImage: {
      width: s(28),
      height: s(28),
      resizeMode: "contain",
    },

    // Search Tag Chip Styles
    tagContainer: {
      height: tagContainerHeight,
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

    // List Spacer for Fixed Header
    listHeaderSpacer: {
      height: headerTotalHeight,
      marginTop: 10,
    },

    // List Content
    listContent: {
      paddingHorizontal: gutter,
      paddingBottom: vs(100),
    },
    row: {
      justifyContent: "space-between",
      marginBottom: vs(12),
    },

    // Empty State
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: vs(80),
      marginTop: vs(40),
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
      bottom: vs(70), // Positioned above transparent safe area
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
      gap: s(6),
    },
    bottomBtnLeft: {
      borderTopLeftRadius: ms(25),
      borderBottomLeftRadius: ms(25),
    },
    bottomBtnRight: {
      borderTopRightRadius: ms(25),
      borderBottomRightRadius: ms(25),
    },
    bottomDivider: {
      width: 1,
      height: "50%",
      backgroundColor: "#E2E8F0",
    },
    bottomText: {
      fontSize: ms(13),
      fontWeight: "600",
      color: "#0F172A",
    },

    // Transparent Bottom Safe Area
    bottomSafeArea: {
      height: Platform.OS === "ios" ? vs(20) : 0,
      backgroundColor: "transparent",
    },
  });
};
