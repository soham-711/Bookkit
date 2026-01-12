import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Lock,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  PixelRatio,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useOrders } from "../../Context/OrdersContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Enhanced responsive scaling
const scale = (size: number) => {
  const baseWidth = 375;
  const scaleFactor = SCREEN_WIDTH / baseWidth;
  const scaledSize = size * scaleFactor;

  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
  }
  return Math.round(scaledSize);
};

const verticalScale = (size: number) => {
  const baseHeight = 812;
  const scaleFactor = SCREEN_HEIGHT / baseHeight;
  const scaledSize = size * scaleFactor;

  // Cap scaling for very tall screens
  if (SCREEN_HEIGHT > 1000) {
    return Math.min(scaledSize, size * 1.3);
  }
  return Math.round(scaledSize);
};

const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

const DeliverablesScreen = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    sellerDeliverables,
    loading,
    acceptOrder,
    cancelOrder,
    completeOrder,
  } = useOrders();
  console.log(sellerDeliverables);

  const deliveries = sellerDeliverables.map((order) => ({
    id: order.id,
    title: order.book_title,
    orderId: order.id.slice(0, 8).toUpperCase(),
    customerName: "Buyer",
    customerPhone: order.buyer_phone,

    pickupLocation: order.seller_address,
    dropLocation: order.buyer_address,

    pickupLat: order.seller_lat,
    pickupLng: order.seller_lng,
    dropLat: order.buyer_lat,
    dropLng: order.buyer_lng,

    status:
      order.status === "pending"
        ? "pending"
        : order.status === "confirmed"
        ? "accepted"
        : order.status === "cancelled"
        ? "cancelled"
        : "delivered",

    price: `₹${order.book_price}`,
    distance: `${order.distance_km.toFixed(1)} km`,
    image: order.book_image ?? "https://via.placeholder.com/150",
    otp: order.delivery_otp?.toString(),
  }));
  const hasNoDeliveries = !loading && deliveries.length === 0;

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert(
      "Accept Delivery?",
      "Are you sure you want to accept this delivery task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            await acceptOrder(orderId, otp);
            Alert.alert("Order Accepted", `Delivery OTP: ${otp}`);
          },
        },
      ]
    );
  };

  // const handleCancelOrder = async (orderId: string) => {
  //   Alert.alert(
  //     "Cancel Delivery?",
  //     "This action cannot be undone.",
  //     [
  //       { text: "No", style: "cancel" },
  //       {
  //         text: "Yes, Cancel",
  //         style: "destructive",
  //         onPress: async () => {
  //           await cancelOrder(orderId);
  //         },
  //       },
  //     ]
  //   );
  // };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert("Cancel Delivery?", "This action cannot be undone.", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          await cancelOrder(orderId);
        },
      },
    ]);
  };

  const handleCallCustomer = async (phone?: string | null) => {
    if (!phone) {
      Alert.alert("Phone unavailable", "Customer phone number not found");
      return;
    }

    // Remove spaces, dashes, etc.
    const sanitizedPhone = phone.replace(/[^\d+]/g, "");

    if (sanitizedPhone.length < 8) {
      Alert.alert("Invalid phone number", "Unable to call this number");
      return;
    }

    const phoneUrl = `tel:+${sanitizedPhone}`;

    try {
      const canCall = await Linking.canOpenURL(phoneUrl);
      if (!canCall) {
        Alert.alert("Error", "Calling is not supported on this device");
        return;
      }

      await Linking.openURL(phoneUrl);
    } catch (error) {
      console.error("Call failed:", error);
      Alert.alert("Error", "Unable to place the call");
    }
  };

  const handleOpenMap = async (
    lat?: number,
    lng?: number,
    labelText = "Location"
  ) => {
    if (!lat || !lng) {
      Alert.alert("Location unavailable", "Coordinates not found");
      return;
    }

    const latLng = `${lat},${lng}`;
    const label = encodeURIComponent(labelText);

    const appleMapsUrl = `http://maps.apple.com/?q=${label}&ll=${latLng}`;
    const googleMapsAppUrl = `geo:${latLng}?q=${latLng}(${label})`;
    const googleMapsWebUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;

    try {
      if (Platform.OS === "ios") {
        await Linking.openURL(appleMapsUrl);
        return;
      }

      // Android → directly try Google Maps app
      await Linking.openURL(googleMapsAppUrl);
    } catch (error) {
      // 🌍 Fallback → browser
      await Linking.openURL(googleMapsWebUrl);
    }
  };

  const isSmallPhone = width < 375;
  const isTablet = width > 768;

  const styles = createStyles({
    s: scale,
    vs: verticalScale,
    ms: moderateScale,
    width,
    height,
    insetsTop: insets.top,
    insetsBottom: insets.bottom,
    isSmallPhone,
    isTablet,
  });

  return (
    <LinearGradient
      colors={["#ffffffff", "#f2fbfbff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Top Safe Area */}
      <SafeAreaView style={styles.topSafeArea} edges={["top"]}>
        <View style={styles.headerContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              hitSlop={{
                top: vs(10),
                bottom: vs(10),
                left: s(10),
                right: s(10),
              }}
              onPress={() => router.back()}
            >
              <ArrowLeft color="#000" size={ms(24)} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>My Deliveries</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Text style={styles.sectionLabel}>
            {deliveries.filter((d) => d.status === "pending").length} New
            Requests
          </Text>
          {hasNoDeliveries && (
            <View
              style={{
                flex: 1,
                height: 500,
                width: "100%",
                alignContent: "center",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../assets/images/OrderNodataFound.gif")}
                style={{ height: 200, width: 200 }}
              />
              <Text
                style={{
                  fontWeight: "600",
                }}
              >
                Sorry! No result found :(
              </Text>
            </View>
          )}
          {!hasNoDeliveries &&
            deliveries.map((item) => (
              <View key={item.id} style={styles.cardContainer}>
                <View style={styles.cardMain}>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.cardInfo}>
                    <View style={styles.statusRow}>
                      <Text style={styles.orderId}>{item.orderId}</Text>

                      <View
                        style={[
                          styles.statusBadge,

                          item.status === "pending" && styles.badgeNew,
                          item.status === "accepted" && styles.badgeInProgress,
                          item.status === "delivered" && styles.badgeDelivered,
                          item.status === "cancelled" && styles.badgeCancelled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,

                            item.status === "pending" && styles.textNew,
                            item.status === "accepted" && styles.textInProgress,
                            item.status === "delivered" && styles.textDelivered,
                            item.status === "cancelled" && styles.textCancelled,
                          ]}
                        >
                          {item.status === "pending"
                            ? "NEW ORDER"
                            : item.status === "accepted"
                            ? "IN PROGRESS"
                            : item.status === "delivered"
                            ? "DELIVERED"
                            : "CANCELLED"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Clock size={ms(12)} color="#6b7280" />
                        <Text style={styles.metaText}>{item.distance}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Text style={styles.priceText}>{item.price}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.actionArea}>
                  {/* PENDING */}
                  {item.status === "pending" && (
                    <View style={styles.pendingContainer}>
                      <View style={styles.locationPreview}>
                        <MapPin size={ms(16)} color="#6b7280" />
                        <Text
                          style={styles.locationTextPreview}
                          numberOfLines={1}
                        >
                          Pickup: {item.pickupLocation}
                        </Text>
                      </View>

                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleCancelOrder(item.id)}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() => handleAcceptOrder(item.id)}
                          activeOpacity={0.85}
                        >
                          <LinearGradient
                            colors={["#1f2937", "#374151"]}
                            style={styles.acceptButtonGradient}
                          >
                            <Text style={styles.acceptButtonText}>Accept</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* ACCEPTED */}
                  {item.status === "accepted" && (
                    <View style={styles.activeContainer}>
                      <View style={styles.addressBox}>
                        <View style={styles.addressRow}>
                          <View style={styles.dotStart} />
                          <Text style={styles.addressLabel}>Pickup</Text>
                          <Text style={styles.addressValue} numberOfLines={1}>
                            {item.pickupLocation}
                          </Text>
                        </View>

                        <View style={styles.verticalLine} />

                        <View style={styles.addressRow}>
                          <MapPin size={ms(14)} color="#ef4444" />
                          <Text style={styles.addressLabel}>Drop</Text>
                          <Text style={styles.addressValue} numberOfLines={1}>
                            {item.dropLocation}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={styles.callButton}
                          onPress={() => handleCallCustomer(item.customerPhone)}
                        >
                          <Phone size={ms(18)} color="#0e7490" />
                          <Text style={styles.callButtonText}>Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.navigateButton}
                          onPress={() =>
                            handleOpenMap(
                              item.dropLat,
                              item.dropLng,
                              "Drop Location"
                            )
                          }
                        >
                          <LinearGradient
                            colors={["#0e7490", "#0891b2"]}
                            style={styles.navigateButtonGradient}
                          >
                            <Navigation size={ms(18)} color="#fff" />
                            <Text style={styles.navigateButtonText}>
                              Navigate
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>

                      {item.otp && (
                        <View style={styles.otpSection}>
                          <Lock size={ms(20)} color="#059669" />
                          <Text style={styles.otpLabel}>Customer OTP</Text>
                          <Text style={styles.otpValue}>{item.otp}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* CANCELLED */}
                  {item.status === "cancelled" && (
                    <View style={styles.cancelledContainer}>
                      <Text style={styles.cancelledText}>
                        This order has been cancelled
                      </Text>
                    </View>
                  )}
                  {item.status === "delivered" && (
                    <View style={styles.cancelledContainer}>
                      <Text
                        style={[
                          styles.cancelledText,
                          { color: "#059669" }, // success green
                        ]}
                      >
                        Item is delivered successfully
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

          {/* Bottom padding with safe area */}
          <View style={{ height: vs(20) + insets.bottom }} />
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Safe Area - Transparent */}
      <SafeAreaView style={styles.bottomSafeArea} edges={["bottom"]} />
    </LinearGradient>
  );
};

// Responsive scaling functions for use in styles
const s = scale;
const vs = verticalScale;
const ms = moderateScale;

function createStyles({
  s,
  vs,
  ms,
  width,
  height,
  insetsTop,
  insetsBottom,
  isSmallPhone,
  isTablet,
}: {
  s: (n: number) => number;
  vs: (n: number) => number;
  ms: (n: number, f?: number) => number;
  width: number;
  height: number;
  insetsTop: number;
  insetsBottom: number;
  isSmallPhone: boolean;
  isTablet: boolean;
}) {
  const fontSize = (size: number) => {
    const scaled = ms(size) * (width < 375 ? 0.95 : width > 768 ? 1.1 : 1);
    return Math.round(PixelRatio.roundToNearestPixel(scaled));
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    topSafeArea: {
      flex: 1,
      backgroundColor: "transparent",
    },
    bottomSafeArea: {
      backgroundColor: "transparent",
    },

    headerContainer: {
      paddingHorizontal: s(isSmallPhone ? 16 : isTablet ? 32 : 20),
      paddingTop: Platform.OS === "android" ? vs(8) + insetsTop * 0.1 : vs(4),
      paddingBottom: 0,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: Platform.OS === "ios" ? vs(4) : 0,
    },
    backButton: {
      marginRight: s(15),
      padding: s(4),
    },
    screenTitle: {
      fontSize: fontSize(isTablet ? 24 : 20),
      fontWeight: "600",
      color: "#000",
      flex: 1,
    },

    scrollView: {
      flex: 1,
      backgroundColor: "transparent",
    },
    scrollContent: {
      paddingHorizontal: s(isSmallPhone ? 16 : isTablet ? 32 : 20),
      paddingTop: vs(16),
      paddingBottom: vs(8),
    },

    sectionLabel: {
      fontSize: fontSize(isTablet ? 16 : 14),
      fontWeight: "600",
      color: "#6b7280",
      marginBottom: vs(12),
      marginLeft: s(4),
    },

    cardContainer: {
      backgroundColor: "#ffffff",
      borderRadius: ms(16),
      marginBottom: vs(20),
      padding: s(isTablet ? 20 : 16),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: Platform.OS === "ios" ? 0.5 : 1,
      borderColor: "#f3f4f6",
    },

    cardMain: {
      flexDirection: "row",
      marginBottom: vs(12),
    },

    imageWrapper: {
      width: s(isTablet ? 80 : 65),
      height: s(isTablet ? 100 : 80),
      borderRadius: ms(8),
      backgroundColor: "#f3f4f6",
      marginRight: s(12),
      overflow: "hidden",
    },

    itemImage: {
      width: "100%",
      height: "100%",
    },

    cardInfo: {
      flex: 1,
      justifyContent: "space-between",
      minHeight: s(isTablet ? 100 : 80),
    },

    statusRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: vs(4),
    },

    orderId: {
      fontSize: fontSize(isTablet ? 13 : 11),
      color: "#9ca3af",
      fontWeight: "500",
      flexShrink: 1,
    },

    statusBadge: {
      paddingHorizontal: s(8),
      paddingVertical: vs(4),
      borderRadius: ms(6),
      marginLeft: s(8),
    },

    statusPending: {
      backgroundColor: "#fff7ed",
      borderWidth: Platform.OS === "ios" ? 0.5 : 1,
      borderColor: "#fed7aa",
    },

    statusActive: {
      backgroundColor: "#ecfeff",
      borderWidth: Platform.OS === "ios" ? 0.5 : 1,
      borderColor: "#a5f3fc",
    },
    statusPending2: {
      backgroundColor: "#eeffed",
      borderWidth: Platform.OS === "ios" ? 0.5 : 1,
      borderColor: "#aafec0",
    },
    statusText: {
      fontSize: fontSize(isTablet ? 12 : 10),
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    statusTextPending: { color: "#c2410c" },
    statusTextActive: { color: "#0e7490" },
    badgeNew: {
      backgroundColor: "#fff7ed",
      borderWidth: 1,
      borderColor: "#fed7aa",
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
    },

    textNew: {
      color: "#c2410c",
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    badgeInProgress: {
      backgroundColor: "#ecfeff",
      borderWidth: 1,
      borderColor: "#67e8f9",
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
    },

    textInProgress: {
      color: "#0e7490",
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    badgeDelivered: {
      backgroundColor: "#ecfdf5",
      borderWidth: 1,
      borderColor: "#86efac",
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
    },

    textDelivered: {
      color: "#059669",
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    badgeCancelled: {
      backgroundColor: "#fef2f2",
      borderWidth: 1,
      borderColor: "#fecaca",
      paddingHorizontal: s(10),
      paddingVertical: vs(4),
    },

    textCancelled: {
      color: "#b91c1c",
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    itemTitle: {
      fontSize: fontSize(isTablet ? 17 : 15),
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: vs(6),
      lineHeight: fontSize(isTablet ? 22 : 20),
    },

    metaRow: {
      flexDirection: "row",
      gap: s(12),
      alignItems: "center",
    },

    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(4),
    },

    metaText: {
      fontSize: fontSize(isTablet ? 14 : 12),
      color: "#6b7280",
    },

    priceText: {
      fontSize: fontSize(isTablet ? 16 : 14),
      fontWeight: "700",
      color: "#059669",
    },

    separator: {
      height: 1,
      backgroundColor: "#f3f4f6",
      marginVertical: vs(10),
    },

    actionArea: {
      marginTop: vs(4),
    },

    pendingContainer: {
      gap: vs(10),
    },

    locationPreview: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(6),
    },

    locationTextPreview: {
      fontSize: fontSize(isTablet ? 15 : 13),
      color: "#4b5563",
      flex: 1,
    },

    actionButtons: {
      flexDirection: "row",
      gap: s(12),
    },

    cancelButton: {
      flex: 1,
      backgroundColor: "#fff",
      paddingVertical: vs(12),
      borderRadius: ms(10),
      alignItems: "center",
      borderWidth: Platform.OS === "ios" ? 1 : 1.5,
      borderColor: "#ef4444",
    },

    cancelButtonText: {
      color: "#ef4444",
      fontWeight: "600",
      fontSize: fontSize(isTablet ? 15 : 13),
    },
    statusCancelled: {
      backgroundColor: "#fef2f2",
      borderWidth: Platform.OS === "ios" ? 0.5 : 1,
      borderColor: "#fecaca",
    },

    statusTextCancelled: {
      color: "#b91c1c", // strong red
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    cancelledContainer: {
      paddingVertical: vs(10),
      alignItems: "center",
    },

    cancelledText: {
      fontSize: fontSize(isTablet ? 14 : 12),
      fontWeight: "600",
      color: "#ef4444",
    },

    acceptButton: {
      flex: 1,
      borderRadius: ms(10),
      overflow: "hidden",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },

    acceptButtonGradient: {
      paddingVertical: vs(12),
      alignItems: "center",
    },

    acceptButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: fontSize(isTablet ? 15 : 13),
    },

    activeContainer: {
      gap: vs(12),
    },

    addressBox: {
      backgroundColor: "#f9fafb",
      padding: s(12),
      borderRadius: ms(8),
      borderWidth: Platform.OS === "ios" ? 0.5 : 1,
      borderColor: "#e5e7eb",
    },

    addressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(8),
      marginBottom: vs(8),
    },

    verticalLine: {
      position: "absolute",
      left: s(19.5),
      top: vs(20),
      bottom: vs(20),
      width: 1,
      backgroundColor: "#d1d5db",
      zIndex: -1,
    },

    dotStart: {
      width: ms(8),
      height: ms(8),
      borderRadius: ms(4),
      backgroundColor: "#10b981",
      marginLeft: s(3),
    },

    addressLabel: {
      fontSize: fontSize(isTablet ? 14 : 12),
      color: "#6b7280",
      width: s(50),
    },

    addressValue: {
      fontSize: fontSize(isTablet ? 15 : 13),
      color: "#1f2937",
      fontWeight: "500",
      flex: 1,
    },

    buttonRow: {
      flexDirection: "row",
      gap: s(12),
    },

    callButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: s(8),
      paddingVertical: vs(12),
      backgroundColor: "#ecfeff",
      borderRadius: ms(10),
      borderWidth: Platform.OS === "ios" ? 1 : 1.5,
      borderColor: "#67e8f9",
    },

    callButtonText: {
      color: "#0e7490",
      fontWeight: "600",
      fontSize: fontSize(isTablet ? 16 : 14),
    },

    navigateButton: {
      flex: 1,
      borderRadius: ms(10),
      overflow: "hidden",
      elevation: 4,
      shadowColor: "#0e7490",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },

    navigateButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: s(8),
      paddingVertical: vs(12),
    },

    navigateButtonText: {
      color: "#ffffff",
      fontWeight: "600",
      fontSize: fontSize(isTablet ? 16 : 14),
    },

    // Simple Customer OTP Display
    otpSection: {
      flexDirection: "row",
      alignItems: "center",
      gap: s(10),
      backgroundColor: "#ecfdf5",
      padding: s(14),
      borderRadius: ms(12),
      borderWidth: Platform.OS === "ios" ? 1 : 1.5,
      borderColor: "#d1fae5",
    },

    otpLabel: {
      fontSize: fontSize(isTablet ? 16 : 14),
      fontWeight: "600",
      color: "#059669",
      flex: 1,
    },

    otpValue: {
      fontSize: fontSize(isTablet ? 20 : 18),
      fontWeight: "800",
      color: "#059669",
      backgroundColor: "#fff",
      paddingHorizontal: s(12),
      paddingVertical: vs(2),
      borderRadius: ms(6),
      minWidth: s(50),
      textAlign: "center",
      borderWidth: 1,
      borderColor: "#86efac",
    },
  });
}

export default DeliverablesScreen;
