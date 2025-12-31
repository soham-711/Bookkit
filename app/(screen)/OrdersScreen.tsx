import React, { useState, useEffect } from 'react';
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
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  ArrowLeft,
  X,
  Calendar,
  CheckCircle2
} from 'lucide-react-native';

// Responsive scaling utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const baseWidth = 375; // iPhone SE/8 width as base
const baseHeight = 667; // iPhone SE/8 height as base

const scale = (size: number) => (SCREEN_WIDTH / baseWidth) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / baseHeight) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Define the Order type interface
interface Order {
  id: string;
  title: string;
  orderNumber: string;
  status: string;
  statusColor: string;
  image: string;
  showFeedback: boolean;
  feedbackSubmitted: boolean;
  feedbackText?: string;
  date: Date;
}

const OrdersScreen = () => {
  const windowDimensions = useWindowDimensions();
  const { fontScale } = windowDimensions;
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Modals
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isFeedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewText, setReviewText] = useState('');

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All Time');

  // Original orders data (never modified)
  const [allOrders] = useState<Order[]>([
    {
      id: '1',
      title: 'NCERT Mathematics Textbook for Class XI Edition 2024 (English...',
      orderNumber: '1023456788213465',
      status: 'Conformed by seller',
      statusColor: '#059669',
      image: "https://ncert.nic.in/textbook/pdf/kech1cc.jpg", 
      showFeedback: false,
      feedbackSubmitted: false,
      date: new Date('2024-12-15'),
    },
    {
      id: '2',
      title: 'NCERT Chemistry Textbook for Class XI Edition 2024 (English...',
      orderNumber: '1023456788213465',
      status: 'Delivered',
      statusColor: '#059669',
      image: "https://ncert.nic.in/textbook/pdf/jehe1cc.jpg",
      showFeedback: true,
      feedbackSubmitted: false,
      feedbackText: 'Share your experience about the book',
      date: new Date('2024-11-20'),
    },
    {
      id: '3',
      title: 'NCERT Science Textbook for Class XI Edition 2024 (English...',
      orderNumber: '1023456788213465',
      status: 'Delivered',
      statusColor: '#059669',
      image: "https://ncert.nic.in/textbook/pdf/jesc1cc.jpg",
      showFeedback: true,
      feedbackSubmitted: false,
      feedbackText: 'Share your experience about the book',
      date: new Date('2024-06-10'),
    },
    {
      id: '4',
      title: 'NCERT Physics Textbook for Class XII Edition 2024 (English...',
      orderNumber: '1023456788213466',
      status: 'Pending',
      statusColor: '#f59e0b',
      image: "https://ncert.nic.in/textbook/pdf/leph1cc.jpg",
      showFeedback: false,
      feedbackSubmitted: false,
      date: new Date('2024-12-18'),
    },
    {
      id: '5',
      title: 'NCERT Biology Textbook for Class XII Edition 2024 (English...',
      orderNumber: '1023456788213467',
      status: 'Cancelled',
      statusColor: '#ef4444',
      image: "https://ncert.nic.in/textbook/pdf/lebo1cc.jpg",
      showFeedback: false,
      feedbackSubmitted: false,
      date: new Date('2024-10-05'),
    }
  ]);

  // Filtered orders (displayed to user)
  const [orders, setOrders] = useState<Order[]>(allOrders);

  // Apply filters whenever search, status, or date range changes
  useEffect(() => {
    applyAllFilters();
  }, [searchQuery, selectedStatus, selectedDateRange]);

  const applyAllFilters = () => {
    let filteredData: Order[] = [...allOrders];

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filteredData = filteredData.filter((order: Order) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          order.title.toLowerCase().includes(searchLower) ||
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.status.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      filteredData = filteredData.filter((order: Order) => {
        // Handle "Conformed" status matching
        if (selectedStatus === 'Conformed') {
          return order.status.toLowerCase().includes('conformed');
        }
        return order.status.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    // Filter by date range
    if (selectedDateRange !== 'All Time') {
      const now = new Date();
      filteredData = filteredData.filter((order: Order) => {
        const orderDate = order.date;
        
        switch (selectedDateRange) {
          case 'Last 30 Days':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return orderDate >= thirtyDaysAgo;
            
          case 'Last 6 Months':
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            return orderDate >= sixMonthsAgo;
            
          case '2024':
            return orderDate.getFullYear() === 2024;
            
          default:
            return true;
        }
      });
    }

    setOrders(filteredData);
  };

  const handleFeedbackPress = (order: Order) => {
    if (!order.feedbackSubmitted) {
      setSelectedOrder(order);
      setFeedbackModalVisible(true);
    }
  };

  const handleFeedbackSubmit = () => {
    if (!selectedOrder) return;

    const updatedOrders = orders.map((order: Order) => 
      order.id === selectedOrder.id 
        ? { ...order, feedbackSubmitted: true, feedbackText: 'Thank you for your feedback 😊' }
        : order
    );
    setOrders(updatedOrders);
    
    setFeedbackModalVisible(false);
    setSelectedOrder(null);
    setReviewText('');
  };

  const applyFilters = () => {
    // Filters are already applied via useEffect
    // Just close the modal
    setFilterModalVisible(false);
  };

  const resetFilters = () => {
    setSelectedStatus('All');
    setSelectedDateRange('All Time');
    setSearchQuery('');
  };

  // Create responsive styles
  const styles = createStyles(fontScale);

  return (
    <LinearGradient
      colors={["#67E8F9", "#FFFFFF"]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      
      <View style={styles.headerContainer}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft color="#000" size={moderateScale(24)} strokeWidth={2.5} />
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

        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search color="#6b7280" size={moderateScale(20)} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Your Order here"
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X color="#6b7280" size={moderateScale(18)} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
            <SlidersHorizontal color="#000" size={moderateScale(20)} strokeWidth={2} />
            <Text style={styles.filterText}>Filters</Text>
            {(selectedStatus !== 'All' || selectedDateRange !== 'All Time') && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filters Display */}
        {(selectedStatus !== 'All' || selectedDateRange !== 'All Time' || searchQuery !== '') && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
            <View style={styles.activeFiltersChips}>
              {selectedStatus !== 'All' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>{selectedStatus}</Text>
                  <TouchableOpacity onPress={() => setSelectedStatus('All')}>
                    <X color="#0e7490" size={moderateScale(14)} />
                  </TouchableOpacity>
                </View>
              )}
              {selectedDateRange !== 'All Time' && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterChipText}>{selectedDateRange}</Text>
                  <TouchableOpacity onPress={() => setSelectedDateRange('All Time')}>
                    <X color="#0e7490" size={moderateScale(14)} />
                  </TouchableOpacity>
                </View>
              )}
              {(selectedStatus !== 'All' || selectedDateRange !== 'All Time') && (
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Line Separator */}
        <View style={styles.separator} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Results Count */}
        <Text style={styles.resultsCount}>
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Found
        </Text>

        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No orders found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order: Order) => (
            <View key={order.id} style={styles.cardContainer}>
              <View style={styles.cardMain}>
                <View style={styles.bookCoverWrapper}>
                  <Image 
                    source={{ uri: order.image }} 
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {order.title}
                  </Text>
                  <Text style={styles.orderNumber}>
                    Order #{order.orderNumber}
                  </Text>
                  <Text style={[styles.statusText, { color: order.statusColor }]}>
                    Status: {order.status}
                  </Text>
                </View>

                <TouchableOpacity style={styles.detailsArrow}>
                  <ChevronRight color="#000" size={moderateScale(20)} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              {order.showFeedback && (
                <View style={styles.feedbackContainer}>
                  <TouchableOpacity 
                    style={[styles.feedbackBtn, order.feedbackSubmitted && styles.feedbackBtnDisabled]}
                    onPress={() => handleFeedbackPress(order)}
                    disabled={order.feedbackSubmitted}
                  >
                    <Text style={styles.feedbackIcon}>👤</Text>
                    <Text style={styles.feedbackBtnText}>{order.feedbackText}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
        <View style={{ height: verticalScale(40) }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFilterModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <X color="#333" size={moderateScale(24)} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalBody}>
                {/* Status Section */}
                <View style={styles.filterSection}>
                  <View style={styles.sectionHeader}>
                    <CheckCircle2 size={moderateScale(18)} color="#0e7490" style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Order Status</Text>
                  </View>
                  <View style={styles.chipContainer}>
                    {['All','Conformed', 'Delivered', 'Pending', 'Cancelled'].map((status) => (
                      <TouchableOpacity 
                        key={status}
                        style={[
                          styles.filterChip, 
                          selectedStatus === status && styles.filterChipSelected
                        ]}
                        onPress={() => setSelectedStatus(status)}
                      >
                        <Text style={[
                          styles.filterChipText,
                          selectedStatus === status && styles.filterChipTextSelected
                        ]}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Date Section */}
                <View style={styles.filterSection}>
                  <View style={styles.sectionHeader}>
                    <Calendar size={moderateScale(18)} color="#0e7490" style={styles.sectionIcon} />
                    <Text style={styles.sectionTitle}>Date Range</Text>
                  </View>
                  <View style={styles.chipContainer}>
                    {['All Time', 'Last 30 Days', 'Last 6 Months', '2024'].map((date) => (
                      <TouchableOpacity 
                        key={date}
                        style={[
                          styles.filterChip, 
                          selectedDateRange === date && styles.filterChipSelected
                        ]}
                        onPress={() => setSelectedDateRange(date)}
                      >
                        <Text style={[
                          styles.filterChipText,
                          selectedDateRange === date && styles.filterChipTextSelected
                        ]}>{date}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.resetFiltersButton} 
                    onPress={resetFilters}
                  >
                    <Text style={styles.resetFiltersButtonText}>Reset All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.applyButton} 
                    onPress={applyFilters}
                  >
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFeedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setFeedbackModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share your experience</Text>
              <TouchableOpacity onPress={() => setFeedbackModalVisible(false)}>
                <X color="#333" size={moderateScale(24)} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.feedbackBookTitle}>{selectedOrder?.title}</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Write your review here..."
                multiline
                value={reviewText}
                onChangeText={setReviewText}
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleFeedbackSubmit}>
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
};

// Create responsive styles function
const createStyles = (fontScale: number) => StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(60),
    paddingBottom: 0,
  },
  topBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: verticalScale(20) 
  },
  backButton: { marginRight: scale(15) },
  screenTitle: { 
    fontSize: moderateScale(20) / fontScale, 
    fontWeight: '600', 
    color: '#000', 
    letterSpacing: 0.3 
  },
  bannerContainer: {
    width: '100%',
    height: verticalScale(140),
    borderRadius: moderateScale(12),
    overflow: 'hidden',
    marginBottom: verticalScale(20),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
  },
  bannerImage: { width: '100%', height: '100%' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scale(12),
    marginBottom: verticalScale(12),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', 
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(12),
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: { marginRight: scale(8) },
  searchInput: { 
    flex: 1, 
    fontSize: moderateScale(14) / fontScale, 
    color: '#000' 
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    paddingHorizontal: scale(12),
    height: verticalScale(48),
    position: 'relative',
  },
  filterText: { 
    fontSize: moderateScale(14) / fontScale, 
    fontWeight: '500', 
    color: '#000' 
  },
  filterBadge: {
    position: 'absolute',
    top: verticalScale(8),
    right: scale(8),
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#ef4444',
  },
  activeFiltersContainer: {
    marginBottom: verticalScale(12),
  },
  activeFiltersLabel: {
    fontSize: moderateScale(12) / fontScale,
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(6),
  },
  activeFiltersChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
    alignItems: 'center',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(16),
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#67e8f9',
  },
  activeFilterChipText: {
    fontSize: moderateScale(12) / fontScale,
    color: '#0e7490',
    fontWeight: '500',
  },
  clearAllText: {
    fontSize: moderateScale(12) / fontScale,
    color: '#ef4444',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: scale(20) },
  resultsCount: {
    fontSize: moderateScale(14) / fontScale,
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(12),
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyStateText: {
    fontSize: moderateScale(18) / fontScale,
    fontWeight: '600',
    color: '#374151',
    marginBottom: verticalScale(8),
  },
  emptyStateSubtext: {
    fontSize: moderateScale(14) / fontScale,
    color: '#6b7280',
    marginBottom: verticalScale(20),
  },
  resetButton: {
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(12),
    backgroundColor: '#67e8f9',
    borderRadius: moderateScale(8),
  },
  resetButtonText: {
    fontSize: moderateScale(14) / fontScale,
    fontWeight: '600',
    color: '#0e7490',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
    padding: scale(12),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardMain: { flexDirection: 'row', alignItems: 'flex-start' },
  bookCoverWrapper: {
    width: scale(70),
    height: verticalScale(90),
    borderRadius: moderateScale(6),
    overflow: 'hidden',
    marginRight: scale(12),
    backgroundColor: '#f0f0f0',
  },
  bookImage: { width: '100%', height: '100%' },
  cardInfo: { 
    flex: 1, 
    justifyContent: 'center', 
    paddingVertical: verticalScale(2) 
  },
  bookTitle: { 
    fontSize: moderateScale(14) / fontScale, 
    fontWeight: '600', 
    color: '#1f2937', 
    marginBottom: verticalScale(4), 
    lineHeight: moderateScale(20) 
  },
  orderNumber: { 
    fontSize: moderateScale(12) / fontScale, 
    color: '#9ca3af', 
    marginBottom: verticalScale(6) 
  },
  statusText: { 
    fontSize: moderateScale(12) / fontScale, 
    fontWeight: '500' 
  },
  detailsArrow: { 
    padding: scale(4), 
    alignSelf: 'center' 
  },
  feedbackContainer: { 
    marginTop: verticalScale(12), 
    borderTopWidth: 1, 
    borderTopColor: '#f3f4f6', 
    paddingTop: verticalScale(12) 
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#67e8f9',
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  feedbackBtnDisabled: { backgroundColor: '#d1d5db' },
  feedbackIcon: { 
    marginRight: scale(8), 
    fontSize: moderateScale(14) 
  },
  feedbackBtnText: { 
    fontSize: moderateScale(13) / fontScale, 
    fontWeight: '600', 
    color: '#0e7490' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: scale(20),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    paddingBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: { 
    fontSize: moderateScale(18) / fontScale, 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  modalBody: { gap: verticalScale(24) },
  filterSection: { gap: verticalScale(12) },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: scale(8), 
    marginBottom: verticalScale(4) 
  },
  sectionIcon: { opacity: 0.8 },
  sectionTitle: { 
    fontSize: moderateScale(16) / fontScale, 
    fontWeight: '600', 
    color: '#374151' 
  },
  chipContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: scale(8) 
  },
  filterChip: {
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipSelected: {
    backgroundColor: '#ecfeff',
    borderColor: '#67e8f9',
  },
  filterChipText: { 
    fontSize: moderateScale(14) / fontScale, 
    color: '#4b5563' 
  },
  filterChipTextSelected: { 
    color: '#0e7490', 
    fontWeight: '500' 
  },
  modalFooter: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(10),
  },
  resetFiltersButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: scale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resetFiltersButtonText: {
    fontSize: moderateScale(16) / fontScale,
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: { 
    flex: 1,
    backgroundColor: '#67e8f9', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    alignItems: 'center',
    shadowColor: '#67e8f9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  applyButtonText: { 
    fontSize: moderateScale(16) / fontScale, 
    fontWeight: '700', 
    color: '#0e7490' 
  },
  feedbackBookTitle: { 
    fontSize: moderateScale(16) / fontScale, 
    fontWeight: '500', 
    marginBottom: verticalScale(10), 
    textAlign: 'center' 
  },
  feedbackInput: {
    height: verticalScale(120),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: moderateScale(12),
    padding: scale(12),
    textAlignVertical: 'top',
    backgroundColor: '#f9fafb',
    marginBottom: verticalScale(16),
    fontSize: moderateScale(14) / fontScale,
  },
  submitButton: { 
    backgroundColor: '#67e8f9', 
    padding: scale(16), 
    borderRadius: moderateScale(12), 
    alignItems: 'center',
  },
  submitButtonText: { 
    fontSize: moderateScale(16) / fontScale, 
    fontWeight: '700', 
    color: '#0e7490' 
  },
});

export default OrdersScreen;