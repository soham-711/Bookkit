import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// ---------- Responsive helpers ----------
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

// ---------- Mock data ----------
export interface Order {
  id: string;

  book_id: string;
  book_title: string;
  book_image: string | null;
  book_price: number;

  buyer_id: string;
  seller_id: string;

  buyer_address: string;
  buyer_lat: number;
  buyer_lng: number;

  seller_address: string;
  seller_lat: number;
  seller_lng: number;

  distance_km: number;

  status: "pending" | "confirmed" | "cancelled" | "completed";

  delivery_otp: number | null;
  seller_response_at: string | null;
  delivered_at: string | null;

  created_at: string;
}

const CancellScreen = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const styles = createStyles(width, height);

  const { order } = useLocalSearchParams<{ order?: string }>();

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Order not found</Text>
      </View>
    );
  }

  const parsedOrder: Order = JSON.parse(order);

  // State: Toggle updates section
  const [showUpdates, setShowUpdates] = useState(false);
  // State: Toggle Terms section
  const [showTerms, setShowTerms] = useState(false);

  const toggleUpdates = () => {
    setShowUpdates(!showUpdates);
  };

  const toggleTerms = () => {
    setShowTerms(!showTerms);
  };

  // Navigation handlers
  const handleBackPress = () => {
    router.back();
  };

  const handleHelpPress = () => {
    router.push("/(screen)/Support");
  };

  return (
    <View style={styles.container}>
      {/* ---------- Header with Linear Gradient ---------- */}
      <LinearGradient
        colors={["#ffffff", "#f2fbfbff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1.2 }}
        style={styles.headerContainer}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={scale(24, width)} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Order Details</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.iconButton}
            onPress={handleHelpPress}
          >
            {/* Custom Help Icon */}
            <Image
              source={require("../../assets/images/needhelp.png")}
              style={styles.helpIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ---------- Scrollable Content ---------- */}
      <LinearGradient
        colors={["#E0F7FA", "#E0F7FA"]}
        style={styles.bodyContainer}
      >
        {/* Background gradient for body */}
        <LinearGradient
          colors={["#ffffffff", "#f2fbfbff"]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.4 }}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {/* ---------- Book Info ---------- */}
          <View style={styles.bookRow}>
            <View style={styles.bookImageWrapper}>
              <Image
                source={{ uri: parsedOrder.book_image ?? "" }}
                style={styles.bookImage}
                contentFit="contain"
              />
            </View>

            <View style={styles.bookInfo}>
              <Text numberOfLines={3} style={styles.bookTitle}>
                {parsedOrder.book_title}
              </Text>

              <Text style={styles.orderIdLabel}>
                Order{" "}
                <Text style={styles.orderIdText}>{parsedOrder.book_id}</Text>{" "}
                <Ionicons
                  name="copy-outline"
                  size={scale(12, width)}
                  color="#000"
                />
              </Text>
            </View>
          </View>

          {/* ---------- Status Card ---------- */}
          <View style={styles.statusCard}>
            <View style={styles.statusContent}>
              <Text style={styles.statusTitle}>
                Sorry!! <Text style={styles.emoji}>🙁</Text> Your order is being
                cancelled by Seller.
              </Text>

              {/* Stepper */}
              <View style={styles.progressRow}>
                {/* Step 1: Order Placed (GIF) */}
                <View style={styles.stepContainer}>
                  <View style={styles.stepIconDone}>
                    <Image
                      source={require("../../assets/images/green-tick.gif")}
                      style={styles.gifIcon}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={styles.stepLabel}>Order Placed</Text>
                </View>

                {/* Connecting Line */}
                <View style={styles.progressLineWrapper}>
                  <View style={styles.progressLineFill} />
                </View>

                {/* Step 2: Confirmation (Dot PNG) */}
                <View style={styles.stepContainer}>
                  <View style={styles.stepIconActiveWrapper}>
                    <Image
                      source={require("../../assets/images/cross.gif")}
                      style={styles.dotIcon}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={styles.stepLabel}>Cancelled</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ---------- Address Card ---------- */}
          <View style={styles.addressCard}>
            <View style={styles.addressContent}>
              <Text style={styles.addressTitle}>Your Address</Text>

              <View style={styles.addressRow}>
                <Ionicons
                  name="location-sharp"
                  size={scale(20, width)}
                  color="#000"
                />
                <Text style={styles.addressText} numberOfLines={3}>
                  {parsedOrder.buyer_address}
                </Text>
              </View>
            </View>

            {/* Cyan Share Banner */}
            <View style={styles.shareStrip}>
              <Text style={styles.shareText}>
                The seller has cancelled this order, but there are many great
                books waiting for you. Try finding another one{" "}
                <Text style={styles.emoji}>😊📖</Text>
              </Text>
            </View>

            <Text style={styles.subStatusText}>Your order is cancelled.</Text>
          </View>

          {/* ---------- Terms & Conditions (Collapsible) ---------- */}
          <View style={styles.termsCard}>
            <TouchableOpacity
              style={styles.termsHeader}
              activeOpacity={0.7}
              onPress={toggleTerms}
            >
              <Text style={styles.termsTitle}>Terms &amp; Conditions</Text>
              <Ionicons
                name={showTerms ? "chevron-up" : "chevron-down"}
                size={scale(20, width)}
                color="#000"
              />
            </TouchableOpacity>

            {showTerms && (
              <View style={styles.termsBody}>
                <View style={styles.bulletDot} />
                <Text style={styles.termsText}>
                  {" "}
                  Payment will be made hand to hand there.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default CancellScreen;

// ---------- Styles ----------
const createStyles = (width: number, height: number) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    // Header styling applied to LinearGradient
    headerContainer: {
      paddingTop: vs(50),
      paddingBottom: vs(15),
      paddingHorizontal: s(16),
      elevation: 2,
      shadowOpacity: 0.05,
      shadowRadius: 3,
      zIndex: 10,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    headerTitle: {
      fontSize: ms(18),
      fontWeight: "600",
      color: "#000",
    },
    iconButton: {
      padding: s(4),
    },
    helpIcon: {
      width: s(24),
      height: s(24),
    },

    // Body
    bodyContainer: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingTop: vs(24),
      paddingHorizontal: s(16),
      paddingBottom: vs(30),
    },

    // Book Info
    bookRow: {
      flexDirection: "row",
      marginBottom: vs(20),
      alignItems: "flex-start",
    },
    bookImageWrapper: {
      width: s(60),
      height: s(75),
      borderRadius: ms(8),
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      padding: s(4),
      marginRight: s(12),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    bookImage: {
      width: "100%",
      height: "100%",
    },
    bookInfo: {
      flex: 1,
      justifyContent: "center",
    },
    bookTitle: {
      fontSize: ms(13),
      fontWeight: "400",
      color: "#000",
      lineHeight: ms(18),
      marginBottom: vs(4),
    },
    orderIdLabel: {
      fontSize: ms(11),
      color: "#666",
    },
    orderIdText: {
      color: "#666",
      fontWeight: "500",
    },

    // Status Card
    statusCard: {
      borderRadius: ms(12),
      borderWidth: 1,
      borderColor: "#003EF9",
      marginBottom: vs(16),
      overflow: "hidden",
    },
    statusContent: {
      padding: s(16),
      paddingBottom: vs(20),
    },
    statusTitle: {
      fontSize: ms(14),
      fontWeight: "500",
      color: "#000",
      marginBottom: vs(20),
      textAlign: "center",
    },
    emoji: {
      fontSize: ms(14),
    },

    // Stepper
    progressRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingHorizontal: s(20),
      gap: s(4),
    },
    stepContainer: {
      alignItems: "center",
      width: s(70),
    },

    // GIF Container
    stepIconDone: {
      width: s(40),
      height: s(40),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: vs(4),
      zIndex: 2,
    },
    gifIcon: {
      width: "100%",
      height: "100%",
    },

    // Dot PNG Container
    stepIconActiveWrapper: {
      width: s(22),
      height: s(22),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: vs(6),
      marginTop: vs(9),
      zIndex: 2,
    },
    dotIcon: {
      width: s(40),
      height: s(52),
    },

    stepLabel: {
      fontSize: ms(10),
      color: "#555",
      textAlign: "center",
      marginTop: vs(2),
    },

    // Line Connector
    progressLineWrapper: {
      flex: 1,
      height: s(40),
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: -s(10),
      zIndex: 1,
      paddingTop: vs(2),
    },
    progressLineFill: {
      width: "100%",
      height: vs(3),
      backgroundColor: "rgb(204, 101, 101)",
      borderRadius: vs(2),
    },

    expandedUpdates: {
      marginTop: vs(16),
      paddingTop: vs(10),
      borderTopWidth: 1,
      borderTopColor: "rgba(34, 85, 164, 0.1)",
    },
    updateItem: {
      fontSize: ms(11),
      color: "#078bd7ff",
      marginBottom: vs(4),
      paddingLeft: s(10),
    },
    // Footer
    statusFooter: {
      borderTopWidth: 0.2,
      borderTopColor: "#003ef959",
      paddingVertical: vs(10),
    },
    updateLink: {
      textAlign: "center",
      fontSize: ms(12),
      color: "#0277BD",
      fontWeight: "500",
    },

    // Address Card
    addressCard: {
      backgroundColor: "#D6F2F6",
      borderRadius: ms(12),
      borderColor: "#70F3FA",
      marginBottom: vs(16),
      overflow: "hidden",
      paddingTop: vs(12),

      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    addressContent: {
      paddingHorizontal: s(12),
      marginBottom: vs(12),
    },
    addressTitle: {
      fontSize: ms(14),
      fontWeight: "500",
      color: "#000",
      marginBottom: vs(8),
    },
    addressRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    addressText: {
      flex: 1,
      marginLeft: s(6),
      fontSize: ms(11),
      color: "#333",
      lineHeight: ms(16),
    },
    shareStrip: {
      backgroundColor: "#70F3FA",
      paddingHorizontal: s(12),
      paddingVertical: vs(10),
      justifyContent: "center",
      alignItems: "center",
    },
    shareText: {
      fontSize: ms(11),
      color: "#000",
      textAlign: "center",
      lineHeight: ms(16),
    },
    subStatusText: {
      textAlign: "center",
      fontSize: ms(11),
      color: "#0277BD",
      paddingVertical: vs(8),
      backgroundColor: "#B3E5FC",
    },

    // Terms Card
    termsCard: {
      backgroundColor: "#cfedf8ff",
      borderRadius: ms(12),
      paddingHorizontal: s(16),
      paddingVertical: vs(14),
      marginBottom: vs(20),
    },
    termsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    termsTitle: {
      fontSize: ms(14),
      fontWeight: "500",
      color: "#000",
    },
    termsBody: {
      marginTop: vs(8),
      flexDirection: "row",
      alignItems: "flex-start",
      gap: s(8),
      paddingLeft: s(4),
    },
    bulletDot: {
      width: s(4),
      height: s(4),
      borderRadius: s(2),
      backgroundColor: "#000",
      marginTop: vs(6),
    },
    termsText: {
      flex: 1,
      fontSize: ms(12),
      color: "#333",
      lineHeight: ms(18),
    },
  });
};
