import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocationStore } from "../../Context/LocationContext";
import { getBookById } from "../../Services/fetchedBookData";
import { supabase } from "../../Utils/supabase";
import { getCurrentUserId } from "../../Services/userIdProvider";
import { useOrders } from "../../Context/OrdersContext";

interface Book {
  id: string;
  title: string;
  user_id: string;
  subject: string;
  category: string;
  class: string;
  authorname: string;
  publisher: string;
  edition: string;
  condition: string;
  condition_description: string;
  writing_marking: string;
  pages_missing: string;
  original_price: number;
  generated_price: number;
  images: string[];
  pickup_address_text: string;
  pickup_latitude: number;
  pickup_longitude: number;
}

const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

const Disclosure = () => {
  const { bookId, distance } = useLocalSearchParams<{
    bookId: string;
    distance: string;
  }>();
  const { savedAddresses } = useLocationStore();
const { refreshOrders } = useOrders();

  const [book, setBook] = useState<Book | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  useEffect(() => {
    if (!savedAddresses || savedAddresses.length === 0) return;

    const defaultAddr =
      savedAddresses.find((addr) => addr.is_default) || savedAddresses[0];

    setSelectedAddress(defaultAddr);
    setLocation(defaultAddr.address);

    console.log("Default selected address:", defaultAddr);
  }, [savedAddresses]);

  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      try {
        setLoading(true);

        const data = await getBookById(bookId);

        setBook(data);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.35;

  const [location, setLocation] = useState<string>("Fetching location....");

  const [isLocationUpdateExpanded, setIsLocationUpdateExpanded] =
    useState<boolean>(false);

  const [isDisclosureOpen, setIsDisclosureOpen] = useState<boolean>(false);
  const [isBuyNowExpanded, setIsBuyNowExpanded] = useState<boolean>(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] =
    useState<boolean>(false);

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [isTitleExpanded, setIsTitleExpanded] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  const productImages = book?.images ?? [];

  const styles = createStyles(SCREEN_WIDTH, SCREEN_HEIGHT, insets);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentImageIndex(index);
  };

  const toggleSellerLocation = () => {
    setIsBuyNowExpanded(!isBuyNowExpanded);
  };

  const toggleTitle = () => {
    setIsTitleExpanded(!isTitleExpanded);
  };

  const handleOpenMap = async () => {
    if (!book?.pickup_latitude || !book?.pickup_longitude) {
      Alert.alert("Location not available");
      return;
    }

    const latitude = book.pickup_latitude;
    const longitude = book.pickup_longitude;
    const label = book.pickup_address_text || "Seller Location";

    // Google Maps URL (works on Android + iOS + Web)
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      const supported = await Linking.canOpenURL(googleMapsUrl);
      if (supported) {
        await Linking.openURL(googleMapsUrl);
      } else {
        Alert.alert("Error", "Unable to open map application");
      }
    } catch (error) {
      console.error("Map open error:", error);
      Alert.alert("Error", "Something went wrong while opening map");
    }
  };

  // --- FIXED: Close the update section when a location is selected ---
  const handleSelectLocation = (addressObj: any) => {
    setSelectedAddress(addressObj);
    setLocation(addressObj.address);
    setIsLocationUpdateExpanded(false);

    console.log("User selected address:", addressObj);
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case "home":
        return "home";
      case "work":
        return "briefcase";
      default:
        return "location";
    }
  };

  const renderImageItem = ({ item: imageUri }: { item: string }) => (
    <View
      style={[
        styles.imageContainer,
        { height: IMAGE_HEIGHT, width: SCREEN_WIDTH },
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.productImage}
        resizeMode="contain"
      />
    </View>
  );

  // const handleBuy = () => {
  //   setIsBuying(true);
  //   setTimeout(() => {
  //     setIsBuying(false);
  //     if (!book) return;

  //     router.push({
  //       pathname: "/(screen)/OrderDetailsScreen",
  //       params: {
  //         bookTitle: book.title,
  //         bookPrice: book.generated_price.toString(),
  //         bookImage: book.images?.[0],
  //         orderStatus: "Processing",
  //         orderDate: new Date().toISOString(),
  //       },
  //     });
  //   }, 2000);
  // };

  const handleBuy = async () => {
    if (!book || !selectedAddress) {
      Alert.alert("Error", "Book or address missing");
      return;
    }

    try {
      setIsBuying(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert("Login required");
        return;
      }

      const { error } = await supabase.from("orders").insert({
        book_id: book.id,
        seller_id: book.user_id, // MUST exist in book table
        buyer_id: user.id,

        book_title: book.title,
        book_image: book.images?.[0],
        book_price: book.generated_price,

        seller_address: book.pickup_address_text,
        seller_lat: book.pickup_latitude,
        seller_lng: book.pickup_longitude,

        buyer_address: selectedAddress.address,
        buyer_lat: selectedAddress.latitude,
        buyer_lng: selectedAddress.longitude,

        distance_km: Number(distance),
        status: "pending",
      });

      if (error) throw error;
    // ✅ IMPORTANT: refresh orders BEFORE navigation
    await refreshOrders();
      router.push("/(screen)/OrdersScreen");
    } catch (err: any) {
      Alert.alert("Order failed", err.message);
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <LinearGradient colors={["#feffffff", "#eafdfdff"]} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={scale(24, SCREEN_WIDTH)}
                color="#000"
              />
            </TouchableOpacity>

            <View style={styles.searchBar}>
              <Ionicons
                name="search-outline"
                size={scale(20, SCREEN_WIDTH)}
                color="#00000060"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search books, authors ...."
                onFocus={() => router.push("/(screen)/SearchScreen")}
                placeholderTextColor="#00000060"
              />
            </View>

            <TouchableOpacity style={styles.sellButton}>
              <Image
                source={require("../../assets/images/Sellbook.png")}
                style={styles.sellIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* ScrollView - Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Main Product Card */}
            <View>
              {/* Image Carousel Section */}
              <View style={styles.carouselContainer}>
                {/* Distance Badge */}
                <View style={styles.distanceBadge}>
                  <Ionicons
                    name="location-sharp"
                    size={scale(10, SCREEN_WIDTH)}
                    color="#fff"
                    style={{ marginRight: scale(4, SCREEN_WIDTH) }}
                  />
                  <Text style={styles.distanceBadgeText}>{distance} km</Text>
                </View>

                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {currentImageIndex + 1}/{productImages.length}
                  </Text>
                </View>

                <FlatList
                  ref={flatListRef}
                  data={productImages}
                  renderItem={renderImageItem}
                  keyExtractor={(item, index) => `image-${index}`}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  snapToInterval={SCREEN_WIDTH}
                  decelerationRate="fast"
                  style={{ height: IMAGE_HEIGHT }}
                />
              </View>

              {/* Product Details Section */}
              <View style={styles.productDetails}>
                <TouchableOpacity activeOpacity={0.7} onPress={toggleTitle}>
                  <Text style={styles.productTitle}>
                    {isTitleExpanded
                      ? book?.title
                      : book?.title.slice(0, 60) + "..."}
                    <Text style={styles.moreText}>
                      {isTitleExpanded ? " less" : " more"}
                    </Text>
                  </Text>
                </TouchableOpacity>

                <View style={styles.lowestPriceBadge}>
                  <Text style={styles.lowestPriceBadgeText}>
                    At Lowest Price
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.originalPrice}>
                    ₹{book?.original_price}
                  </Text>
                  <View style={styles.currentPriceContainer}>
                    <Text style={styles.nowAtText}>Now at</Text>
                    <Text style={styles.currentPrice}>
                      ₹{book?.generated_price}
                    </Text>
                  </View>
                </View>

                <LinearGradient
                  colors={["#1350d4", "#0633bbff"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buyNowGradient}
                >
                  <TouchableOpacity
                    onPress={toggleSellerLocation}
                    style={styles.buyNowButton}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.buyNowText}>
                      Buy Now at ₹{book?.generated_price}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={scale(22, SCREEN_WIDTH)}
                      color="#fff"
                      style={{
                        transform: [
                          { rotate: isBuyNowExpanded ? "180deg" : "0deg" },
                        ],
                      }}
                    />
                  </TouchableOpacity>

                  {isBuyNowExpanded && (
                    <View style={styles.expandedSection}>
                      <Text style={styles.sellerLocationTitle}>
                        Seller's Location
                      </Text>

                      <View style={styles.locationCard}>
                        <Ionicons
                          name="location"
                          size={scale(20, SCREEN_WIDTH)}
                          color="#3485ffff"
                          style={styles.locationIcon}
                        />
                        <View style={styles.locationTextContainer}>
                          <Text style={styles.locationSubtitle}>
                            {book?.pickup_address_text} - {distance} km away
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.mapButton}
                        activeOpacity={0.8}
                        onPress={handleOpenMap}
                      >
                        <Ionicons
                          name="map"
                          size={scale(18, SCREEN_WIDTH)}
                          color="#fff"
                        />
                        <Text style={styles.mapButtonText}>View on Map</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </LinearGradient>

                <LinearGradient
                  colors={["#d7eefc", "#d7eefc"]}
                  start={{ x: 1, y: 0 }}
                  end={{ x: 0, y: 0 }}
                  style={styles.viewLocationGradient}
                >
                  <TouchableOpacity
                    onPress={toggleSellerLocation}
                    style={styles.viewLocationButton}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="location"
                      size={scale(18, SCREEN_WIDTH)}
                      color="#FF5757"
                    />
                    <Text style={styles.viewLocationText}>
                      View seller's location
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>

            {/* Your Location Section */}
            <View style={styles.currentLocationSection}>
              <Text style={styles.currentLocationTitle}>Your Location</Text>

              {/* Current Location Display - Top Part */}
              <LinearGradient
                colors={["#ffffff", "#eefaffff"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[
                  styles.locationDisplayGradient,
                  isLocationUpdateExpanded && {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    borderBottomWidth: 0,
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={scale(20, SCREEN_WIDTH)}
                  color="#0066ff"
                />
                <Text style={styles.locationDisplayText} numberOfLines={1}>
                  {selectedAddress?.address || "Select your location"}
                </Text>
              </LinearGradient>

              {/* --- EXPANDABLE CONTENT IN BETWEEN --- */}
              {isLocationUpdateExpanded && (
                <View style={styles.savedLocationContainer}>
                  <View style={styles.savedLocationHeader}>
                    <Text style={styles.savedLocationTitle}>
                      Select Location
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsLocationUpdateExpanded(false)}
                    >
                      <Ionicons
                        name="close"
                        size={scale(24, SCREEN_WIDTH)}
                        color="#333"
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.chooseOnMapCard}
                    activeOpacity={0.8}
                    onPress={() => router.push("/(screen)/UserCurrentLocation")}
                  >
                    <View style={styles.mapIconCircle}>
                      <Ionicons
                        name="map"
                        size={scale(24, SCREEN_WIDTH)}
                        color="#0066ff"
                      />
                    </View>
                    <View style={styles.mapCardContent}>
                      <Text style={styles.mapCardTitle}>Choose on Map</Text>
                      <Text style={styles.mapCardSubtitle}>
                        Select your location by moving the map
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={scale(20, SCREEN_WIDTH)}
                      color="#999"
                    />
                  </TouchableOpacity>

                  <View style={styles.savedDividerContainer}>
                    <View style={styles.savedDividerLine} />
                    <Text style={styles.savedDividerText}>
                      OR SELECT FROM SAVED
                    </Text>
                    <View style={styles.savedDividerLine} />
                  </View>

                  <View style={styles.savedListContainer}>
                    {savedAddresses.map((loc, index) => (
                      <TouchableOpacity
                        key={loc.id}
                        style={[
                          styles.savedListItem,
                          index === savedAddresses.length - 1 && {
                            borderBottomWidth: 0,
                          },
                        ]}
                        onPress={() => handleSelectLocation(loc)}
                      >
                        <View style={styles.savedIconContainer}>
                          <Ionicons
                            name={getLocationIcon(loc.label) as any}
                            size={scale(20, SCREEN_WIDTH)}
                            color="#008080"
                          />
                        </View>
                        <View style={styles.savedTextContainer}>
                          <Text
                            style={styles.savedItemAddress}
                            numberOfLines={2}
                          >
                            {loc.address}
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={scale(20, SCREEN_WIDTH)}
                          color="#ccc"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Update Location Button - Bottom Part */}
              <LinearGradient
                colors={["#eefaffff", "#ffffffff"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[
                  styles.updateLocationGradient,
                  isLocationUpdateExpanded && {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderTopWidth: 0,
                    marginTop: 0,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.updateLocationButton}
                  activeOpacity={0.8}
                  onPress={() =>
                    setIsLocationUpdateExpanded(!isLocationUpdateExpanded)
                  }
                >
                  <Text style={styles.updateLocationText}>
                    {isLocationUpdateExpanded ? "Close" : "Update Location"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={scale(16, SCREEN_WIDTH)}
                    color="#000"
                    style={{
                      marginLeft: scale(5, SCREEN_WIDTH),
                      transform: [
                        {
                          rotate: isLocationUpdateExpanded ? "180deg" : "0deg",
                        },
                      ],
                    }}
                  />
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <View style={styles.productDetailsSection}>
              <TouchableOpacity
                onPress={() => setIsProductDetailsOpen(!isProductDetailsOpen)}
                style={styles.productDetailsHeader}
                activeOpacity={0.7}
              >
                <Text style={styles.productDetailsSectionTitle}>
                  Product Details
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={scale(18, SCREEN_WIDTH)}
                  color="#666"
                  style={{
                    transform: [
                      { rotate: isProductDetailsOpen ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </TouchableOpacity>

              {isProductDetailsOpen && (
                <View style={styles.productDetailsContent}>
                  <View style={styles.detailsGroup}>
                    <Text style={styles.detailsGroupTitle}>
                      Book Information
                    </Text>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Book Title:</Text>
                      <Text style={styles.detailValue} numberOfLines={2}>
                        {book?.title}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Category:</Text>
                      <Text style={styles.detailValue}>{book?.category}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Class:</Text>
                      <Text style={styles.detailValue}>{book?.class}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Subject:</Text>
                      <Text style={styles.detailValue}>{book?.subject}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Author Name:</Text>
                      <Text style={styles.detailValue}>{book?.authorname}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Publisher:</Text>
                      <Text style={styles.detailValue} numberOfLines={2}>
                        {book?.publisher}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Edition:</Text>
                      <Text style={styles.detailValue}>{book?.edition}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsDivider} />

                  <View style={[styles.detailsGroup, { marginBottom: 0 }]}>
                    <Text style={styles.detailsGroupTitle}>Book Condition</Text>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Condition:</Text>
                      <Text style={styles.detailValue}>{book?.condition}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>
                        Any writing/marked inside?
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          book?.writing_marking === "None"
                            ? styles.statusBadgeNo
                            : styles.statusBadgeYes,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            book?.writing_marking === "None"
                              ? { color: "#2e7d32" } // green
                              : { color: "#d32f2f" }, // red
                          ]}
                        >
                          {book?.writing_marking === "None" ? "No" : "Yes"}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.detailRow, { marginBottom: 0 }]}>
                      <Text style={styles.detailLabel}>
                        Any page missing or torn?
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          book?.pages_missing === "Yes"
                            ? styles.statusBadgeYes
                            : styles.statusBadgeNo,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            book?.pages_missing === "Yes"
                              ? { color: "#d32f2f" }
                              : { color: "#2e7d32" },
                          ]}
                        >
                          {book?.pages_missing === "None - All pages intact"
                            ? "No"
                            : "Yes"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity
                onPress={() => setIsDisclosureOpen(!isDisclosureOpen)}
                style={styles.termsHeader}
                activeOpacity={0.7}
              >
                <Text style={styles.termsTitle}>Terms & Conditions</Text>
                <Ionicons
                  name="chevron-down"
                  size={scale(18, SCREEN_WIDTH)}
                  color="#666"
                  style={{
                    transform: [
                      { rotate: isDisclosureOpen ? "180deg" : "0deg" },
                    ],
                  }}
                />
              </TouchableOpacity>

              {isDisclosureOpen && (
                <View style={styles.termsContent}>
                  <Text style={styles.termItem}>
                    • Payment will be made hand to hand there.
                  </Text>
                  <Text style={styles.termItem}>
                    • Buyer must inspect the book condition before purchase.
                  </Text>
                  <Text style={styles.termItem}>
                    • No returns or refunds after the transaction is complete.
                  </Text>
                  <Text style={styles.termItem}>
                    • Meet at a safe public location for the exchange.
                  </Text>
                  <Text style={styles.termItem}>
                    • Seller is responsible for the accuracy of book details.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />
            <Text style={styles.suggestedTitle}>suggested books</Text>

            {/* <SuggestedBooksCart/> */}
          </ScrollView>

          <View style={styles.fixedBottomContainer}>
            <LinearGradient
              colors={["#144fffff", "#144fffff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fixedBuyButton}
            >
              <TouchableOpacity
                onPress={handleBuy}
                activeOpacity={0.8}
                style={styles.fixedBuyButtonTouchable}
              >
                <Text style={styles.fixedBuyButtonText}>Buy at ₹{book?.generated_price}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {isBuying && (
            <View style={styles.loadingOverlay}>
              <View style={styles.loadingCard}>
                <Image
                  source={require("../../assets/images/loading.gif")}
                  style={styles.loadingGif}
                  resizeMode="contain"
                />
                <Text style={styles.loadingText}>Processing your order...</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const createStyles = (width: number, height: number, insets: EdgeInsets) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor || 0.5, width);

  const gutter = s(16);
  const cardGap = s(12);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
    },
    safeArea: {
      flex: 1,
    },
    header: {
      paddingVertical: vs(15),
      paddingTop: insets.top + vs(10),
      flexDirection: "row",
      alignItems: "center",
      gap: s(12),
      backgroundColor: "transparent",
      paddingHorizontal: gutter,
    },
    backButton: {
      padding: s(4),
      paddingBottom: s(8),
    },
    searchBar: {
      flex: 1,
      height: vs(50),
      borderRadius: ms(28),
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: gutter,
      borderWidth: 1.5,
      borderColor: "#003EF920",
      shadowColor: "#003EF9",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
    },
    searchInput: {
      flex: 1,
      marginLeft: s(10),
      fontSize: ms(15),
      color: "#000",
      fontWeight: "400",
    },
    sellButton: {
      width: s(48),
      height: s(48),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      borderRadius: s(24),
      borderWidth: 1.5,
      borderColor: "#003EF920",
      shadowColor: "#003EF9",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sellIcon: { width: s(24), height: s(24) },
    scrollView: { flex: 1 },
    scrollContent: {
      paddingBottom: vs(80) + insets.bottom + 20,
    },
    carouselContainer: { position: "relative" },
    distanceBadge: {
      position: "absolute",
      bottom: s(12),
      left: gutter,
      backgroundColor: "#f90000ff",
      paddingHorizontal: s(8),
      paddingVertical: s(5),
      borderRadius: ms(20),
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },
    distanceBadgeText: {
      color: "#fff",
      fontSize: ms(11),
      fontWeight: "700",
    },
    imageCounter: {
      position: "absolute",
      top: s(12),
      right: gutter,
      backgroundColor: "rgba(0,0,0,0.7)",
      paddingHorizontal: s(10),
      paddingVertical: s(6),
      borderRadius: ms(20),
      zIndex: 10,
    },
    imageCounterText: {
      color: "#fff",
      fontSize: ms(12),
      fontWeight: "500",
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      paddingVertical: vs(20),
      borderRadius: ms(15),
    },
    productImage: {
      width: "65%",
      height: "100%",
      borderRadius: ms(4),
    },
    productDetails: {
      paddingTop: vs(12),
      paddingHorizontal: gutter,
    },
    productTitle: {
      fontSize: ms(16),
      fontWeight: "400",
      color: "#000",
      lineHeight: ms(22),
      marginBottom: vs(8),
    },
    moreText: {
      color: "#0066ff",
      fontWeight: "400",
    },
    lowestPriceBadge: {
      alignSelf: "flex-start",
      backgroundColor: "#0066ff",
      paddingHorizontal: s(10),
      paddingVertical: s(5),
      borderRadius: ms(4),
      marginBottom: vs(12),
    },
    lowestPriceBadgeText: {
      color: "#fff",
      fontSize: ms(11),
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: vs(16),
    },
    originalPrice: {
      fontSize: ms(16),
      color: "#999",
      textDecorationLine: "line-through",
    },
    currentPriceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    nowAtText: {
      fontSize: ms(20),
      color: "#1d1d1dff",
      fontWeight: "400",
      marginRight: s(6),
    },
    currentPrice: {
      fontSize: ms(20),
      color: "#1a1a1aff",
      fontWeight: "700",
    },
    buyNowGradient: {
      borderRadius: ms(11),
      elevation: 3,
      shadowColor: "#003EF9",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      overflow: "hidden",
      marginBottom: vs(12),
    },
    buyNowButton: {
      height: vs(60),
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: s(24),
      paddingRight: s(16),
    },
    buyNowText: {
      color: "#fff",
      fontSize: ms(17),
      fontWeight: "700",
      flex: 1,
      textAlign: "center",
      marginLeft: s(16),
    },
    expandedSection: {
      backgroundColor: "#f4feffff",
      paddingHorizontal: gutter,
      paddingVertical: vs(16),
    },
    sellerLocationTitle: {
      fontSize: ms(14),
      fontWeight: "600",
      color: "#000",
      marginBottom: vs(12),
    },
    locationCard: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: vs(12),
      padding: s(12),
      borderWidth: 1,
      borderColor: "#ccc",
      elevation: 2,
      shadowColor: "#000",
      backgroundColor: "#fdfdfeff",
      borderRadius: ms(8),
    },
    locationIcon: { marginRight: s(10) },
    locationTextContainer: { flex: 1 },
    locationTitle: {
      fontSize: ms(13),
      color: "#000",
      fontWeight: "500",
      marginBottom: vs(2),
    },
    locationSubtitle: {
      fontSize: ms(11),
      color: "#666",
      fontWeight: "400",
    },
    mapButton: {
      backgroundColor: "#45b8ffff",
      height: vs(44),
      borderRadius: ms(8),
      elevation: 2,
      shadowColor: "#000",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: s(8),
      marginBottom: vs(10),
    },
    mapButtonText: {
      color: "#fff",
      fontSize: ms(14),
      fontWeight: "600",
    },
    viewLocationGradient: {
      height: vs(50),
      borderRadius: ms(11),
      marginBottom: vs(16),
      marginTop: vs(-25),
      overflow: "hidden",
    },
    viewLocationButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: s(6),
    },
    viewLocationText: {
      color: "#000",
      fontSize: ms(14),
      fontWeight: "500",
    },
    termsContainer: {
      backgroundColor: "#f5f9ff",
      borderWidth: 1,
      borderColor: "#63a2ef",
      paddingHorizontal: gutter,
      paddingVertical: vs(14),
      borderRadius: ms(11),
      marginHorizontal: gutter,
      marginTop: vs(16),
    },
    termsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    termsTitle: {
      fontSize: ms(14),
      fontWeight: "600",
      color: "#000",
    },
    termsContent: { marginTop: vs(10) },
    termItem: {
      fontSize: ms(13),
      color: "#555",
      lineHeight: ms(20),
      marginBottom: vs(6),
      fontWeight: "400",
    },
    currentLocationSection: {
      marginTop: vs(20),
      paddingHorizontal: gutter,
    },
    currentLocationTitle: {
      fontSize: ms(14),
      fontWeight: "600",
      color: "#000",
      marginBottom: vs(10),
    },
    locationDisplayGradient: {
      borderTopLeftRadius: ms(11),
      borderTopRightRadius: ms(11),
      padding: s(14),
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderBottomWidth: 0, // FIXED: Remove bottom border to merge with bottom part
      borderColor: "#63a2ef",
    },
    locationDisplayText: {
      flex: 1,
      fontSize: ms(13),
      color: "#000000ff",
      marginLeft: s(8),
      fontWeight: "400",
    },
    updateLocationGradient: {
      height: vs(44),
      borderBottomLeftRadius: ms(11),
      borderBottomRightRadius: ms(11),
      marginTop: 0,
      overflow: "hidden",
      borderWidth: 1,
      borderTopWidth: 0, // FIXED: Remove top border to merge with top part
      borderColor: "#63a2ef",
    },
    updateLocationButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    updateLocationText: {
      color: "#000",
      fontSize: ms(15),
      fontWeight: "600",
    },

    savedLocationContainer: {
      backgroundColor: "#fff",
      padding: s(16),
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: "#63a2ef",
    },
    savedLocationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: vs(20),
    },
    savedLocationTitle: {
      fontSize: ms(18),
      fontWeight: "700",
      color: "#222",
    },
    chooseOnMapCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#e0f7fa",
      padding: s(12),
      borderRadius: ms(10),
      borderWidth: 1,
      borderColor: "#b2ebf2",
      marginBottom: vs(20),
    },
    mapIconCircle: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      marginRight: s(12),
    },
    mapCardContent: {
      flex: 1,
    },
    mapCardTitle: {
      fontSize: ms(14),
      fontWeight: "700",
      color: "#006064",
      marginBottom: vs(2),
    },
    mapCardSubtitle: {
      fontSize: ms(11),
      color: "#555",
    },
    savedDividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: vs(20),
    },
    savedDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#ddd",
    },
    savedDividerText: {
      marginHorizontal: s(10),
      fontSize: ms(11),
      color: "#999",
      fontWeight: "600",
      textTransform: "uppercase",
    },
    savedListContainer: {
      backgroundColor: "#fff",
    },
    savedListItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: vs(12),
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    savedIconContainer: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      backgroundColor: "#e0f2f1",
      alignItems: "center",
      justifyContent: "center",
      marginRight: s(12),
    },
    savedTextContainer: {
      flex: 1,
    },
    savedItemTitle: {
      fontSize: ms(14),
      fontWeight: "600",
      color: "#222",
      marginBottom: vs(2),
    },
    savedItemAddress: {
      fontSize: ms(11),
      color: "#666",
      lineHeight: ms(16),
    },

    fixedBottomContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: gutter,
      paddingBottom: insets.bottom + vs(20),
      paddingTop: vs(12),
      backgroundColor: "#e9fbffff",
      zIndex: 100,
      borderTopWidth: 1,
      borderTopColor: "#ebf4f7ff",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 10,
    },
    fixedBuyButton: {
      height: vs(54),
      borderRadius: ms(12),
      shadowColor: "#003EF9",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      overflow: "hidden",
    },
    fixedBuyButtonTouchable: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    fixedBuyButtonText: {
      color: "#fff",
      fontSize: ms(18),
      fontWeight: "700",
    },
    divider: {
      height: 1,
      backgroundColor: "#d4d4d4ff",
      marginBottom: vs(12),
      marginTop: vs(20),
    },
    suggestedTitle: {
      fontSize: ms(20),
      color: "#040404ff",
      fontWeight: "600",
      marginRight: s(6),
      marginBottom: vs(12),
      paddingHorizontal: gutter,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: gutter,
    },
    gridCard: {
      width: (width - gutter * 2 - cardGap) / 2,
      backgroundColor: "#fff",
      borderRadius: ms(12),
      marginBottom: vs(16),
      overflow: "hidden",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    gridImageContainer: {
      height: vs(180),
      backgroundColor: "#fafafa",
      alignItems: "center",
      justifyContent: "center",
      padding: s(10),
      position: "relative",
    },
    gridDistanceBadge: {
      position: "absolute",
      top: s(8),
      left: s(8),
      backgroundColor: "#f90000ff",
      paddingHorizontal: s(6),
      paddingVertical: s(4),
      borderRadius: ms(12),
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    gridDistanceBadgeText: {
      color: "#fff",
      fontSize: ms(9),
      fontWeight: "700",
    },
    gridImage: {
      width: "80%",
      height: "90%",
    },
    gridDetails: {
      padding: s(10),
    },
    gridTitle: {
      fontSize: ms(11),
      color: "#000",
      lineHeight: ms(15),
      height: ms(30),
      marginBottom: vs(6),
      fontWeight: "400",
    },
    gridPriceRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    gridOriginalPrice: {
      fontSize: ms(10),
      color: "#999",
      textDecorationLine: "line-through",
      fontWeight: "400",
    },
    gridCurrentPriceContainer: {
      flexDirection: "row",
      alignItems: "baseline",
    },
    gridNowAtText: {
      fontSize: ms(9),
      color: "#0066ff",
      marginRight: s(3),
      fontWeight: "400",
    },
    gridCurrentPrice: {
      fontSize: ms(13),
      color: "#0066ff",
      fontWeight: "600",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 200,
    },
    loadingCard: {
      width: width * 0.65,
      padding: s(20),
      borderRadius: ms(16),
      backgroundColor: "#fff",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    loadingGif: {
      width: s(120),
      height: s(120),
      marginBottom: vs(10),
    },
    loadingText: {
      fontSize: ms(14),
      fontWeight: "500",
      color: "#374151",
      textAlign: "center",
    },
    productDetailsSection: {
      marginTop: vs(16),
      marginHorizontal: gutter,
      backgroundColor: "#f5f9ff",
      borderWidth: 1,
      borderColor: "#63a2ef",
      paddingHorizontal: gutter,
      paddingVertical: vs(14),
      borderRadius: ms(11),
    },
    productDetailsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    productDetailsSectionTitle: {
      fontSize: ms(14),
      fontWeight: "600",
      color: "#000",
    },
    productDetailsContent: {
      marginTop: vs(10),
    },
    detailsGroup: {
      marginBottom: vs(12),
    },
    detailsDivider: {
      height: 1,
      backgroundColor: "#63a2ef",
      opacity: 0.4,
      marginVertical: vs(12),
      marginHorizontal: -gutter,
    },
    detailsGroupTitle: {
      fontSize: ms(13),
      fontWeight: "600",
      color: "#0066ff",
      marginBottom: vs(8),
      marginTop: vs(4),
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: vs(6),
    },
    detailLabel: {
      fontSize: ms(13),
      color: "#555",
      fontWeight: "400",
      flex: 1.2,
      lineHeight: ms(20),
    },
    detailValue: {
      fontSize: ms(13),
      color: "#333",
      fontWeight: "500",
      flex: 1.5,
      textAlign: "right",
      lineHeight: ms(20),
    },
    statusBadge: {
      paddingHorizontal: s(10),
      paddingVertical: s(3),
      borderRadius: ms(6),
      minWidth: s(45),
      alignItems: "center",
      justifyContent: "center",
    },
    statusBadgeYes: {
      backgroundColor: "#ffebee",
    },
    statusBadgeNo: {
      backgroundColor: "#e8f5e9",
    },
    statusBadgeText: {
      fontSize: ms(11),
      fontWeight: "600",
    },
  });
};

export default Disclosure;
