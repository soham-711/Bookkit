import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ---------- MOCK DATA ---------- */
const NEAR_BOOKS = [
  {
    id: "1",
    name: "NCERT Mathematics Textbook for Class X",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    distance: "2.5 km",
    mrp: 2000,
    price: 1509,
  },
  {
    id: "2",
    name: "NCERT Chemistry Part 1 Textbook",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
    distance: "2 km",
    mrp: 2500,
    price: 1900,
  },
  {
    id: "3",
    name: "NCERT Science Textbook",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    distance: "1.5 km",
    mrp: 1800,
    price: 1200,
  },
  {
    id: "4",
    name: "General English Guide",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d",
    distance: "2 km",
    mrp: 1500,
    price: 999,
  },
];

const BookNearMeScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(width, insets);

  const renderBook = ({ item }: any) => (
    <View style={styles.bookCard}>
      <View style={styles.imageWrapper}>
        <View style={styles.distanceBadge}>
          <Ionicons name="location" size={12} color="#003EF9" />
          <Text style={styles.distanceText}>{item.distance}</Text>
        </View>

        <Image source={{ uri: item.image }} style={styles.bookImage} />
      </View>

      <Text style={styles.bookName} numberOfLines={2}>
        {item.name}
      </Text>

      <View style={styles.priceRow}>
        <Text style={styles.mrp}>₹{item.mrp}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>

      <Text style={styles.buyText}>Buy at ₹{item.price}</Text>
    </View>
  );

  return (
    <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={{ flex: 1 }}>
      {/* HEADER */}
      <LinearGradient colors={["#FFFFFF", "#8CF5FB"]} style={styles.topSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#003EF9" />
            <TextInput
              placeholder="books near me"
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity onPress={()=>router.push('/(screen)/UploadScreen1')}>
            <Image
            source={require("../../assets/images/Sellbook.png")}
            style={styles.rightImage}
            
          />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* BOOK GRID */}
      <FlatList
        data={NEAR_BOOKS}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.bookList}
        showsVerticalScrollIndicator={false}
      />

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.bottomBtn, styles.bottomBtnLeft]}
          onPress={() => router.push("/Components/SortList")}
        >
          <Ionicons name="swap-vertical" size={18} color="#0B1220" />
          <Text style={styles.bottomText}>Sort</Text>
        </Pressable>

        <View style={styles.bottomDivider} />

        <Pressable
          style={[styles.bottomBtn, styles.bottomBtnRight]}
          onPress={() => router.push("/Components/Filter")}
        >
          <Ionicons name="options-outline" size={18} color="#0B1220" />
          <Text style={styles.bottomText}>Filter</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
};

export default BookNearMeScreen;

/* ---------- STYLES ---------- */
const createStyles = (width: number, insets: any) =>
  StyleSheet.create({
    topSection: {
      paddingTop: Math.max(insets.top, 70),
      paddingBottom: 16,
      paddingHorizontal: 16,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ECEBEB",
      borderRadius: 9,
      paddingHorizontal: 10,
      height: 40,
    },

    searchInput: {
      flex: 1,
      marginLeft: 6,
      fontSize: 14,
      color: "#000",
    },

    rightImage: {
      width: 32,
      height: 40,
      top:4,
      resizeMode: "contain",
    },

    bookList: {
      padding: 12,
      paddingBottom: 90,
    },

    bookCard: {
      width: (width - 36) / 2,
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 8,
      margin: 6,
      elevation: 4,
    },

    imageWrapper: {
      height: 200,
      borderRadius: 8,
      overflow: "hidden",
    },

    bookImage: {
      width: "100%",
      height: "100%",
    },

    distanceBadge: {
      position: "absolute",
      top: 6,
      left: 6,
      flexDirection: "row",
      backgroundColor: "#fff",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      zIndex: 10,
      alignItems: "center",
    },

    distanceText: {
      fontSize: 10,
      marginLeft: 3,
      color: "#003EF9",
      fontWeight: "600",
    },

    bookName: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: 6,
    },

    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },

    mrp: {
      fontSize: 11,
      color: "#888",
      textDecorationLine: "line-through",
    },

    price: {
      fontSize: 13,
      fontWeight: "700",
    },

    buyText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#003EF9",
      marginTop: 4,
    },

    bottomBar: {
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#fff",
      flexDirection: "row",
      alignItems: "center",
      elevation: 6,
    },

    bottomBtn: {
      flex: 1,
      height: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    bottomBtnLeft: {
      borderTopLeftRadius: 25,
      borderBottomLeftRadius: 25,
    },

    bottomBtnRight: {
      borderTopRightRadius: 25,
      borderBottomRightRadius: 25,
    },

    bottomDivider: {
      width: 1,
      height: "50%",
      backgroundColor: "#E2E8F0",
    },

    bottomText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#0F172A",
    },
  });
  