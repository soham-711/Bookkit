import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
  Modal,
  Pressable,
  useWindowDimensions,
  PixelRatio,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  ArrowLeft,
  X,
  Calendar,
  CheckCircle2,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useOrders } from "../../Context/OrdersContext";


type OrderStatus = "pending" | "confirmed" | "cancelled" | "completed";

/**
 * 🔥 FULL ORDERS TABLE (Supabase)
 * MUST match your DB columns
 */
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

  status: OrderStatus;

  delivery_otp: number | null;
  seller_response_at: string | null;
  delivered_at: string | null;

  created_at: string;
}


type UIOrder = {
  id: string;

  // 🔥 keep full DB order
  order: Order;

  title: string;
  orderNumber: string;

  rawStatus: OrderStatus;
  statusText: string;
  statusColor: string;

  image: string;
  date: Date;
};




// Get actual device dimensions for better scaling
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling based on screen size and orientation
const scale = (size: number) => {
  const baseWidth = 375; // iPhone 12/13/14 standard
  const scaleFactor = SCREEN_WIDTH / baseWidth;
  const scaledSize = size * scaleFactor;
  
  // Ensure minimum sizes for readability
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
  }
  return Math.round(scaledSize);
};

const verticalScale = (size: number) => {
  const baseHeight = 812; // iPhone 12/13/14 height
  const scaleFactor = SCREEN_HEIGHT / baseHeight;
  const scaledSize = size * scaleFactor;
  
  // Cap scaling for tablets
  if (SCREEN_HEIGHT > 1000) {
    return Math.min(scaledSize, size * 1.3);
  }
  return Math.round(scaledSize);
};

const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

const OrdersScreen = () => {
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Responsive scaling functions
  const s = (size: number) => scale(size);
  const vs = (size: number) => verticalScale(size);
  const ms = (size: number, factor = 0.5) => moderateScale(size, factor);
  
  // Responsive font size with accessibility consideration
  const rf = (size: number) => {
    const scaledSize = scale(size);
    
    // Minimum font sizes for readability
    const minSize = Platform.OS === 'ios' ? 12 : 14;
    const maxSize = Platform.OS === 'ios' ? 24 : 26;
    
    // Ensure font stays within readable bounds
    let finalSize = Math.max(minSize, Math.min(scaledSize, maxSize));
    
    // Adjust for different screen sizes
    if (width < 375) {
      // Small phones
      finalSize *= 0.95;
    } else if (width > 768) {
      // Tablets
      finalSize *= 1.1;
    }
    
    return Math.round(PixelRatio.roundToNearestPixel(finalSize));
  };


const { buyerOrders, sellerDeliverables, loading, refreshOrders } = useOrders();

// Status mapping for UI display
const statusMap: Record<
  OrderStatus,
  { text: string; color: string }
> = {
  pending: {
    text: "Pending",
    color: "#f59e0b",
  },
  confirmed: {
    text: "Confirmed",
    color: "#059669",
  },
  cancelled: {
    text: "Cancelled",
    color: "#ef4444",
  },
  completed: {
    text: "Delivered",
    color: "#059669",
  },
};

// Map order to UI format with full order data
const mapOrderToUI = (order: any): UIOrder => {
   // Safely cast status to OrderStatus
  const status = order.status as OrderStatus;
  const meta = statusMap[status];

  return {
    id: order.id,
    order: order, // Store the full order object
    title: order.book_title,
    orderNumber: order.id,
    rawStatus: order.status,
    statusText: meta.text,
    statusColor: meta.color,
    image: order.book_image ?? "https://via.placeholder.com/150",
    date: new Date(order.created_at),
  };
};

// Get all orders (both buyer and seller) combined
const allOrders: UIOrder[] = useMemo(() => {
  // Combine buyer and seller orders
  const combined = [...buyerOrders as any[], ...sellerDeliverables as any[]];
  
  // Remove duplicates by id
  const uniqueOrders = combined.reduce((acc: any[], current) => {
    const exists = acc.find(item => item.id === current.id);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  return uniqueOrders.map(mapOrderToUI);
}, [buyerOrders, sellerDeliverables]);

const [orders, setOrders] = useState<UIOrder[]>([]);
const [refreshing, setRefreshing] = useState(false);


  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<UIOrder | null>(null);
  const [reviewText, setReviewText] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');


useEffect(() => {
  applyAllFilters();
}, [searchQuery, selectedStatus, selectedDateRange, allOrders]);


const applyAllFilters = () => {
    let filteredData: UIOrder[] = [...allOrders];

  // Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredData = filteredData.filter(order =>
      order.title.toLowerCase().includes(q) ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.statusText.toLowerCase().includes(q)
    );
  }

  // Status
  if (selectedStatus !== "All") {
    filteredData = filteredData.filter(order => {
      if (selectedStatus === "Conformed") {
        return order.rawStatus === "confirmed";
      }
      return order.statusText.toLowerCase() === selectedStatus.toLowerCase();
    });
  }

  // Date
  if (selectedDateRange !== "All Time") {
    const now = new Date();

    filteredData = filteredData.filter(order => {
      const d = order.date;

      if (selectedDateRange === "Last 30 Days") {
        return d >= new Date(now.setDate(now.getDate() - 30));
      }

      if (selectedDateRange === "Last 6 Months") {
        return d >= new Date(now.setMonth(now.getMonth() - 6));
      }

      if (selectedDateRange === "2024") {
        return d.getFullYear() === 2024;
      }

      return true;
    });
  }

  setOrders(filteredData);
};

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const handleFeedbackPress = (order: UIOrder) => {
    // Remove feedback logic since it's not in UIOrder
    setSelectedOrder(order);
    setFeedbackModalVisible(true);
  };

const handleFeedbackSubmit = () => {
  if (!selectedOrder) return;

  // Since feedbackSubmitted is not in UIOrder, we just close the modal
  setFeedbackModalVisible(false);
  setSelectedOrder(null);
  setReviewText('');
};


  const applyFilters = () => setFilterModalVisible(false);

  const resetFilters = () => {
    setSelectedStatus('All');
    setSelectedDateRange('All Time');
    setSearchQuery('');
  };

  const handleBack = () => {
    router.push('/(screen)/Profile');
  };

// Updated: Pass full order data as params
const handleOrderPress = (uiOrder: UIOrder) => {
  // Encode the full order object to pass as params
  const orderParam = encodeURIComponent(JSON.stringify(uiOrder.order));

  // Navigate based on status with full order data
  switch (uiOrder.rawStatus) {
    case "pending":
      router.push({
        pathname: '/(screen)/OrderDetailsScreen',
        params: { order: orderParam },
      });
      break;
    case "confirmed":
      router.push({
        pathname: '/(screen)/OrderDetailsScreen2',
        params: { order: orderParam },
      });
      break;
    case "cancelled":
      router.push({
        pathname: '/(screen)/CancellScreen',
        params: { order: orderParam },
      });
      break;
    case "completed":
      router.push({
        pathname: '/(screen)/DeliveredScreen',
        params: { order: orderParam },
      });
      break;
    default:
      // Default to order details screen
      router.push({
        pathname: '/(screen)/OrderDetailsScreen',
        params: { order: orderParam },
      });
  }
};


  const styles = useMemo(
    () => createStyles({ s, vs, ms, rf, width, height, insetsTop: insets.top, insetsBottom: insets.bottom, searchFocused }),
    [width, height, insets.top, insets.bottom, searchFocused]
  );

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={['#ffffffff', '#f2fbfbff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.topSafeArea} edges={['top']}>
          <View style={styles.headerContainer}>
            <View style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                accessibilityLabel="Go back to profile"
                accessibilityRole="button"
                hitSlop={{ top: vs(10), bottom: vs(10), left: s(10), right: s(10) }}
              >
                <ArrowLeft color="#000" size={ms(24)} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.screenTitle}>My Orders</Text>
            </View>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#003EF9" />
            <Text style={styles.loadingText}>Loading your orders...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffffff', '#f2fbfbff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top Safe Area */}
      <SafeAreaView style={styles.topSafeArea} edges={['top']}>
        <View style={styles.headerContainer}>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              accessibilityLabel="Go back to profile"
              accessibilityRole="button"
              hitSlop={{ top: vs(10), bottom: vs(10), left: s(10), right: s(10) }}
            >
              <ArrowLeft color="#000" size={ms(24)} strokeWidth={2.5} />
            </TouchableOpacity>

            <Text style={styles.screenTitle}>My Orders</Text>
            

          </View>

          <View style={styles.bannerContainer}>
            <Image
              source={require('../../assets/images/order.png')}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>

          {/* Search + Filter */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}>
              <Search color={searchFocused ? '#003EF9' : '#00000060'} size={ms(20)} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search orders, books, status"
                placeholderTextColor="#00000060"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                accessibilityLabel="Search orders"
                returnKeyType="search"
              />

              {searchQuery !== '' ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearIconButton}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                >
                  <X color="#00000060" size={ms(18)} />
                </TouchableOpacity>
              ) : (
                <View style={styles.micDivider} />
              )}
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
              accessibilityLabel="Open filters"
              accessibilityRole="button"
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F0FDFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.filterButtonGradient}
              >
                <SlidersHorizontal color="#003EF9" size={ms(22)} strokeWidth={2.5} />
                {(selectedStatus !== 'All' || selectedDateRange !== 'All Time') && (
                  <View style={styles.filterBadge} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Active Filters */}
          {(selectedStatus !== 'All' || selectedDateRange !== 'All Time') && (
            <View style={styles.activeFiltersContainer}>
              <View style={styles.activeFiltersHeader}>
                <Text style={styles.activeFiltersLabel}>Active Filters</Text>
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.activeFiltersChips}>
                {selectedStatus !== 'All' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedStatus}</Text>
                    <TouchableOpacity onPress={() => setSelectedStatus('All')}>
                      <X color="#0e7490" size={ms(14)} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                )}

                {selectedDateRange !== 'All Time' && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterChipText}>{selectedDateRange}</Text>
                    <TouchableOpacity onPress={() => setSelectedDateRange('All Time')}>
                      <X color="#0e7490" size={ms(14)} strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={styles.separator} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#003EF9']}
              tintColor="#003EF9"
            />
          }
        >
          {/* Results Count */}
          <View style={styles.resultsHeader}>
            <View style={styles.resultsCountContainer}>
              <Text style={styles.resultsCount}>
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </Text>
              
            </View>

            {!!searchQuery && (
              <View style={styles.searchingForContainer}>
                <Text style={styles.searchingForText}>
                  for "{searchQuery.length > 15 ? searchQuery.substring(0, 15) + '...' : searchQuery}"
                </Text>
              </View>
            )}
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconContainer}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
              </View>
              <Text style={styles.emptyStateText}>No orders found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
              </Text>

              <TouchableOpacity style={styles.resetButton} onPress={resetFilters} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#67e8f9', '#22d3ee']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.resetButtonGradient}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.cardContainer}
                onPress={() => handleOrderPress(order)}
                activeOpacity={0.85}
                accessibilityLabel={`View order ${order.orderNumber}`}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={['#ffffff', '#fafafa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardMain}>
                    <View style={styles.bookCoverWrapper}>
                      <Image source={{ uri: order.image }} style={styles.bookImage} resizeMode="cover" />
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={styles.bookTitle} numberOfLines={2}>
                        {order.title}
                      </Text>

                      <View style={styles.orderNumberRow}>
                        <Text style={styles.orderNumberLabel}>Order ID:</Text>
                        <Text style={styles.orderNumber}>#{order.orderNumber.substring(0, 12)}...</Text>
                      </View>

                      <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: order.statusColor }]} />
                        <Text style={[styles.statusText, { color: order.statusColor }]}>{order.statusText}</Text>
                      </View>
                    </View>

                    <View style={styles.detailsArrow}>
                      <ChevronRight color="#003EF9" size={ms(22)} strokeWidth={2.5} />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}

          {/* Bottom padding that accounts for safe area */}
          <View style={{ height: vs(20) + insets.bottom }} />
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={isFilterModalVisible}
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Orders</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                  <X color="#333" size={ms(24)} />
                </TouchableOpacity>
              </View>

              <ScrollView 
                showsVerticalScrollIndicator={false}
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalBody}>
                  <View style={styles.filterSection}>
                    <View style={styles.sectionHeader}>
                      <CheckCircle2 size={ms(18)} color="#0e7490" style={styles.sectionIcon} />
                      <Text style={styles.sectionTitle}>Order Status</Text>
                    </View>

                    <View style={styles.chipContainer}>
                      {['All', 'Conformed', 'Delivered', 'Pending', 'Cancelled'].map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.filterChip,
                            selectedStatus === status && styles.filterChipSelected,
                          ]}
                          onPress={() => setSelectedStatus(status)}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              selectedStatus === status && styles.filterChipTextSelected,
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.filterSection}>
                    <View style={styles.sectionHeader}>
                      <Calendar size={ms(18)} color="#0e7490" style={styles.sectionIcon} />
                      <Text style={styles.sectionTitle}>Date Range</Text>
                    </View>

                    <View style={styles.chipContainer}>
                      {['All Time', 'Last 30 Days', 'Last 6 Months', '2024'].map((date) => (
                        <TouchableOpacity
                          key={date}
                          style={[
                            styles.filterChip,
                            selectedDateRange === date && styles.filterChipSelected,
                          ]}
                          onPress={() => setSelectedDateRange(date)}
                          activeOpacity={0.85}
                        >
                          <Text
                            style={[
                              styles.filterChipText,
                              selectedDateRange === date && styles.filterChipTextSelected,
                            ]}
                          >
                            {date}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity style={styles.resetFiltersButton} onPress={resetFilters} activeOpacity={0.85}>
                      <Text style={styles.resetFiltersButtonText}>Reset All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.applyButton} onPress={applyFilters} activeOpacity={0.85}>
                      <LinearGradient
                        colors={['#feffffff', '#ffffffff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.applyButtonGradient}
                      >
                        <Text style={styles.applyButtonText}>Apply Filters</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Feedback Modal - Removed since feedbackSubmitted is not in UIOrder */}
      </SafeAreaView>

      {/* Bottom Safe Area - Transparent */}
      <SafeAreaView style={styles.bottomSafeArea} edges={['bottom']} />
    </LinearGradient>
  );
};

function createStyles({
  s,
  vs,
  ms,
  rf,
  width,
  height,
  insetsTop,
  insetsBottom,
  searchFocused,
}: {
  s: (n: number) => number;
  vs: (n: number) => number;
  ms: (n: number, f?: number) => number;
  rf: (n: number) => number;
  width: number;
  height: number;
  insetsTop: number;
  insetsBottom: number;
  searchFocused: boolean;
}) {
  const isSmallPhone = width < 375;
  const isTablet = width > 768;
  const isLargePhone = width > 400 && width <= 768;

  return StyleSheet.create({
    container: { 
      flex: 1,
      backgroundColor: 'transparent',
    },
    topSafeArea: { 
      flex: 1,
      backgroundColor: 'transparent',
    },
    bottomSafeArea: {
      backgroundColor: 'transparent',
    },

    // Loading styles
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: vs(100),
    },
    loadingText: {
      marginTop: vs(20),
      fontSize: rf(16),
      color: '#003EF9',
      fontWeight: '600',
    },

    headerContainer: {
      paddingHorizontal: s(isSmallPhone ? 16 : isTablet ? 32 : 20),
      paddingTop: Platform.OS === 'android' ? vs(8) + insetsTop * 0.1 : vs(4),
      paddingBottom: 0,
    },

    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(16),
      paddingTop: Platform.OS === 'ios' ? vs(4) : 0,
    },

    backButton: {
      marginRight: s(12),
      padding: s(4),
    },

    refreshButton: {
      marginLeft: 'auto',
      padding: s(8),
      backgroundColor: '#f0fdff',
      borderRadius: ms(8),
      borderWidth: 1,
      borderColor: '#003EF920',
    },
    refreshButtonText: {
      fontSize: rf(18),
      color: '#003EF9',
      fontWeight: 'bold',
    },

    screenTitle: {
      fontSize: rf(isTablet ? 24 : 20),
      fontWeight: '700',
      color: '#000',
      letterSpacing: 0.5,
      flex: 1,
    },

    bannerContainer: {
      width: '100%',
      height: vs(isSmallPhone ? 110 : isTablet ? 180 : 140),
      borderRadius: ms(16),
      overflow: 'hidden',
      marginBottom: vs(16),
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      backgroundColor: '#fff',
    },

    bannerImage: { 
      width: '100%', 
      height: '100%',
      borderRadius: ms(16),
    },

    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(12),
    },

    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: ms(28),
      paddingHorizontal: s(16),
      height: vs(isTablet ? 58 : 50),
      shadowColor: '#003EF9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: Platform.OS === 'ios' ? 1 : 1.5,
      borderColor: searchFocused ? '#5d85ffff' : '#003EF920',
    },

    searchBoxFocused: {
      shadowOpacity: 0.2,
      elevation: 8,
    },

    searchInput: {
      flex: 1,
      marginLeft: s(10),
      fontSize: rf(isTablet ? 16 : 15),
      color: '#000',
      fontWeight: '500',
      paddingVertical: 0,
      includeFontPadding: false,
      textAlignVertical: 'center',
    },

    clearIconButton: {
      padding: s(4),
      marginLeft: s(4),
    },

    micDivider: {
      width: 1,
      height: '60%',
      backgroundColor: '#ffffff0d',
      marginLeft: s(12),
    },

    filterButton: {
      width: ms(isTablet ? 64 : 54),
      height: vs(isTablet ? 58 : 50),
      borderRadius: ms(16),
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#8daaffff',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginLeft: s(12),
    },

    filterButtonGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: Platform.OS === 'ios' ? 1 : 1.5,
      borderColor: '#003EF920',
      borderRadius: ms(16),
      position: 'relative',
    },

    filterBadge: {
      position: 'absolute',
      top: ms(10),
      right: ms(10),
      width: ms(10),
      height: ms(10),
      borderRadius: ms(5),
      backgroundColor: '#ef4444',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },

    activeFiltersContainer: {
      marginBottom: vs(12),
      paddingHorizontal: s(2),
    },

    activeFiltersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vs(8),
    },

    activeFiltersLabel: {
      fontSize: rf(12),
      fontWeight: '700',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    activeFiltersChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      paddingVertical: vs(6),
      borderRadius: ms(20),
      backgroundColor: '#ecfeff',
      borderWidth: Platform.OS === 'ios' ? 1 : 1.5,
      borderColor: '#67e8f9',
      marginRight: s(8),
      marginBottom: vs(8),
    },

    activeFilterChipText: {
      fontSize: rf(12),
      color: '#0e7490',
      fontWeight: '600',
      marginRight: s(6),
    },

    clearAllText: {
      fontSize: rf(12),
      color: '#ef4444',
      fontWeight: '700',
      textDecorationLine: 'underline',
    },

    separator: {
      height: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      width: '100%',
      marginTop: vs(4),
    },

    scrollView: { 
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollContent: { 
      paddingHorizontal: s(isSmallPhone ? 16 : isTablet ? 32 : 20), 
      paddingTop: vs(16),
      paddingBottom: vs(8),
    },

    resultsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vs(16),
      flexWrap: 'wrap',
    },

    resultsCountContainer: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },

    resultsCount: {
      fontSize: rf(isTablet ? 18 : 15),
      fontWeight: '700',
      color: '#0e7490',
    },

    totalOrdersText: {
      fontSize: rf(12),
      color: '#6b7280',
      marginTop: vs(2),
      fontStyle: 'italic',
    },

    searchingForContainer: {
      paddingHorizontal: s(12),
      paddingVertical: vs(4),
      backgroundColor: '#f0fdff',
      borderRadius: ms(12),
      marginTop: vs(8),
      alignSelf: 'flex-start',
    },

    searchingForText: {
      fontSize: rf(12),
      color: '#0e7490',
      fontStyle: 'italic',
    },

    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: vs(80),
      paddingHorizontal: s(12),
      minHeight: height * 0.5,
    },

    emptyStateIconContainer: {
      width: ms(isTablet ? 120 : 100),
      height: ms(isTablet ? 120 : 100),
      borderRadius: ms(isTablet ? 60 : 50),
      backgroundColor: '#f0fdff',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: vs(20),
    },

    emptyStateIcon: {
      fontSize: rf(isTablet ? 60 : 50),
    },

    emptyStateText: {
      fontSize: rf(isTablet ? 24 : 20),
      fontWeight: '700',
      color: '#374151',
      marginBottom: vs(8),
      textAlign: 'center',
    },

    emptyStateSubtext: {
      fontSize: rf(isTablet ? 16 : 14),
      color: '#6b7280',
      marginBottom: vs(24),
      textAlign: 'center',
      paddingHorizontal: s(20),
    },

    resetButton: {
      borderRadius: ms(12),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#67e8f9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },

    resetButtonGradient: {
      paddingHorizontal: s(isTablet ? 40 : 32),
      paddingVertical: vs(isTablet ? 18 : 14),
    },

    resetButtonText: {
      fontSize: rf(isTablet ? 16 : 15),
      fontWeight: '700',
      color: '#0e7490',
    },

    cardContainer: {
      marginBottom: vs(16),
      borderRadius: ms(16),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
    },

    cardGradient: {
      padding: s(isTablet ? 20 : 16),
      borderWidth: Platform.OS === 'ios' ? 0.5 : 1,
      borderColor: '#f3f4f6',
      borderRadius: ms(16),
    },

    cardMain: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    bookCoverWrapper: {
      width: s(isTablet ? 90 : 75),
      height: vs(isTablet ? 115 : 95),
      borderRadius: ms(10),
      overflow: 'hidden',
      marginRight: s(14),
      backgroundColor: '#f0f0f0',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },

    bookImage: { 
      width: '100%', 
      height: '100%',
    },

    cardInfo: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: s(8),
    },

    bookTitle: {
      fontSize: rf(isTablet ? 16 : 14),
      fontWeight: '600',
      color: '#1f2937',
      lineHeight: rf(isTablet ? 22 : 20),
      marginBottom: vs(6),
    },

    orderNumberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(6),
      flexWrap: 'wrap',
    },

    orderNumberLabel: {
      fontSize: rf(isTablet ? 13 : 11),
      color: '#6b7280',
      fontWeight: '500',
      marginRight: s(4),
    },

    orderNumber: {
      fontSize: rf(isTablet ? 13 : 11),
      color: '#9ca3af',
      fontWeight: '600',
    },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: vs(2),
    },

    statusDot: {
      width: ms(8),
      height: ms(8),
      borderRadius: ms(4),
      marginRight: s(6),
    },

    statusText: {
      fontSize: rf(isTablet ? 14 : 12),
      fontWeight: '700',
    },

    detailsArrow: {
      padding: s(8),
      alignSelf: 'center',
      backgroundColor: '#f0fdff',
      borderRadius: ms(8),
      marginLeft: 'auto',
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'flex-end',
    },

    modalContent: {
      width: '100%',
      backgroundColor: 'white',
      borderTopLeftRadius: ms(24),
      borderTopRightRadius: ms(24),
      padding: s(20),
      paddingBottom: s(20) + insetsBottom,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      maxHeight: height * 0.85,
    },

    modalScrollView: {
      flexGrow: 0,
    },

    modalScrollContent: {
      flexGrow: 1,
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: vs(20),
      paddingBottom: vs(14),
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },

    modalTitle: {
      fontSize: rf(isTablet ? 22 : 20),
      fontWeight: '700',
      color: '#1f2937',
      flex: 1,
    },

    modalBody: {
      flex: 1,
    },

    filterSection: {
      marginBottom: vs(20),
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: vs(12),
    },

    sectionIcon: { 
      opacity: 0.8, 
      marginRight: s(10) 
    },

    sectionTitle: {
      fontSize: rf(isTablet ? 18 : 16),
      fontWeight: '700',
      color: '#374151',
    },

    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    filterChip: {
      paddingHorizontal: s(isTablet ? 22 : 18),
      paddingVertical: vs(isTablet ? 12 : 10),
      borderRadius: ms(24),
      backgroundColor: '#f9fafb',
      borderWidth: Platform.OS === 'ios' ? 1 : 1.5,
      borderColor: '#e5e7eb',
      marginRight: s(10),
      marginBottom: vs(10),
    },

    filterChipSelected: {
      backgroundColor: '#ecfeff',
      borderColor: '#67e8f9',
    },

    filterChipText: {
      fontSize: rf(isTablet ? 16 : 14),
      color: '#6b7280',
      fontWeight: '500',
    },

    filterChipTextSelected: {
      color: '#0e7490',
      fontWeight: '700',
    },

    modalFooter: {
      flexDirection: 'row',
      marginTop: vs(20),
      gap: s(12),
    },

    resetFiltersButton: {
      flex: 1,
      backgroundColor: '#f9fafb',
      padding: s(16),
      borderRadius: ms(14),
      alignItems: 'center',
      borderWidth: Platform.OS === 'ios' ? 1 : 1.5,
      borderColor: '#e5e7eb',
    },

    resetFiltersButtonText: {
      fontSize: rf(isTablet ? 18 : 16),
      fontWeight: '700',
      color: '#6b7280',
    },

    applyButton: {
      flex: 1,
      borderRadius: ms(14),
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#67e8f9',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },

    applyButtonGradient: {
      padding: s(16),
      alignItems: 'center',
    },

    applyButtonText: {
      fontSize: rf(isTablet ? 18 : 16),
      fontWeight: '700',
      color: '#0e7490',
    },
  });
}

export default OrdersScreen;