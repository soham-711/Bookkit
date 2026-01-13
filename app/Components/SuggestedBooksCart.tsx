import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type Book = {
  id: string;

  title: string;
  description: string | null;

  images: string[] | null;

  generated_price: number;
  original_price: number | null;

  pickup_latitude: number;
  pickup_longitude: number;

  approval_status: "approved" | "pending" | "rejected";
  is_active: boolean;

  owner_id: string;

  created_at: string;
  updated_at: string | null;

  // optional fields if you added them
  category_id?: string | null;
  condition?: string | null;
  distance_km?: number;
};

type BookWithDistance = {
  book: Book;
  distance_km: string;
};

type Props = {
  books: BookWithDistance[];
};


// Scaling utilities (defined once, outside component)
const scale = (size: number, width: number) => (width / 375) * size;

const verticalScale = (size: number, height: number) => (height / 812) * size;

const moderateScale = (size: number, factor = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

// Sample data

const SuggestedBooksCart: React.FC<Props> = ({ books }) => {
  const { width, height } = useWindowDimensions();
  const styles = createStyles(width, height);

  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Books Explore More Books</Text>
      </View>

      <View style={styles.suggestedGrid}>
        {books.map((book) => (
          
          <TouchableOpacity
            key={book.book.id}
            style={styles.suggestedCard}
            onPress={() =>
              router.push({
                pathname: "/(screen)/DiscloseScreen",
                params: {
                  bookId: book.book.id,
                  distance: book.distance_km,
                },
              })
            }
          >
            <View style={styles.suggestedImageWrapper}>
              <Image
                source={{ uri: book.book.images?.[0] }}
                style={styles.suggestedBookImage}
                contentFit="cover"
              />
            </View>

            <Text style={styles.suggestedBookName} numberOfLines={1}>
              {book.book.title}
            </Text>

            <Text style={styles.suggestedPriceText}>
              Now at ₹{book.book.original_price}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* <TouchableOpacity style={styles.refreshButton}>
        <Ionicons name="refresh" size={s(20)} color="#003EF9" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity> */}
    </View>
  );
};

export default SuggestedBooksCart;

const createStyles = (width: number, height: number) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  return StyleSheet.create({
    section: {
      marginTop: vs(20),
    },

    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: s(16),
      marginBottom: vs(10),
    },

    sectionTitle: {
      fontSize: ms(16),
      fontWeight: "bold",
      color: "#000",
    },

    suggestedGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: s(16),
      justifyContent: "space-between",
    },

    suggestedCard: {
      width: (width - s(48)) / 3, // 3 columns with proper spacing
      marginBottom: vs(16),
      backgroundColor: "#FFFFFF",
      borderRadius: ms(12),
      padding: s(8),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: "#F0F0F0",
    },

    suggestedImageWrapper: {
      position: "relative",
      height: vs(120),
      borderRadius: ms(8),
      overflow: "hidden",
      marginBottom: vs(8),
    },

    suggestedBookImage: {
      width: "100%",
      height: "100%",
    },

    suggestedBookName: {
      fontSize: ms(11),
      fontWeight: "600",
      color: "#1A1A1A",
      lineHeight: ms(14),
      textAlign: "center",
      marginBottom: vs(4),
    },

    suggestedPriceText: {
      fontSize: ms(12),
      color: "#003EF9",
      fontWeight: "600",
      textAlign: "center",
    },

    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: vs(12),
      gap: s(8),
    },

    refreshText: {
      fontSize: ms(14),
      color: "#003EF9",
      fontWeight: "600",
    },
  });
};
