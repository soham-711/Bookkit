import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// Scaling utilities (defined once, outside component)
const scale = (size: number, width: number) =>
  (width / 375) * size;

const verticalScale = (size: number, height: number) =>
  (height / 812) * size;

const moderateScale = (size: number, factor = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

// Sample data
const SUGGESTED_BOOKS = [
  {
    id: "s1",
    name: "NCERT Mathematics Class XII",
    image: "https://ncert.nic.in/textbook/pdf/lemh1cc.jpg",
    price: 1200,
  },
  {
    id: "s2",
    name: "NCERT Chemistry Class XI",
    image: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg",
    price: 1899,
  },
  {
    id: "s3",
    name: "NCERT Science Class X",
    image: "https://ncert.nic.in/textbook/pdf/jesc1cc.jpg",
    price: 2899,
  },
  {
    id: "s4",
    name: "General English Class X",
    image: "https://ncert.nic.in/textbook/pdf/jehe1cc.jpg",
    price: 1299,
  },
  {
    id: "s5",
    name: "Flamingo English Class XII",
    image: "https://ncert.nic.in/textbook/pdf/lefl1cc.jpg",
    price: 899,
  },
  {
    id: "s6",
    name: "Vistas English Class XII",
    image: "https://ncert.nic.in/textbook/pdf/levt1cc.jpg",
    price: 899,
  },
  {
    id: "s7",
    name: "Mathematics Class IX",
    image: "https://ncert.nic.in/textbook/pdf/iemh1cc.jpg",
    price: 1200,
  },
  {
    id: "s8",
    name: "NCERT Mathematics Class XI",
    image: "https://ncert.nic.in/textbook/pdf/kemh1cc.jpg",
    price: 1899,
  },
  {
    id: "s9",
    name: "Allinone Mathematics Class X",
    image: "https://ncert.nic.in/textbook/pdf/jemh1cc.jpg",
    price: 2899,
  },
];

const SuggestedBooksCart = () => {
  const { width, height } = useWindowDimensions();
  const styles = createStyles(width, height);

  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Books Suggested For You</Text>
      </View>

      <View style={styles.suggestedGrid}>
        {SUGGESTED_BOOKS.map((book) => (
          <View key={book.id} style={styles.suggestedCard}>
            <View style={styles.suggestedImageWrapper}>
              <Image
                source={{ uri: book.image }}
                style={styles.suggestedBookImage}
                contentFit="cover"
              />
            </View>

            <Text style={styles.suggestedBookName} numberOfLines={1}>
              {book.name}
            </Text>

            <Text style={styles.suggestedPriceText}>Now at ₹{book.price}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.refreshButton}>
        <Ionicons name="refresh" size={s(20)} color="#003EF9" />
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
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