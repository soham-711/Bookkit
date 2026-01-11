import React, { useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  FlatList,
  StatusBar,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Responsive scaling utilities
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, factor: number = 0.5, width: number) =>
  size + (scale(size, width) - size) * factor;

// Mock search results - Replace with your actual API call
const mockSearchResults = [
  { id: "1", title: "Navigation for Beginners", author: "John Doe", type: "Book" },
  { id: "2", title: "Web Development Basics", author: "Jane Smith", type: "Book" },
  { id: "3", title: "Story Writing Guide", author: "Bob Wilson", type: "Book" },
  { id: "4", title: "Stoicism Philosophy", author: "Marcus Aurelius", type: "Book" },
  { id: "5", title: "Advanced Navigation", author: "Sarah Connor", type: "Book" },
  { id: "6", title: "The Navigator's Handbook", author: "Tom Hardy", type: "Book" },
];

const SearchScreen = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(width, height, insets);
  const inputRef = useRef<TextInput>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState<string[]>(["nav", "w", "st", "sto"]);
  const [isRecording, setIsRecording] = useState(false);

  // New states for search functionality
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Auto-focus input on mount to open keyboard
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow',
      (e: KeyboardEvent) => {
        setKeyboardHeight(e.endCoordinates.height);
        setIsKeyboardVisible(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide',
      () => {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      setShowResults(true);
      
      // Debounce search by 300ms
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery.trim());
      }, 300);
    } else {
      setShowResults(false);
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Simulated search function - Replace with your actual API call
  const performSearch = (query: string) => {
    // Simulate API delay
    setTimeout(() => {
      const filtered = mockSearchResults.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.author.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 200);
  };

  const addHistory = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const updated = [trimmed, ...prev.filter((i) => i !== trimmed)];
      return updated.slice(0, 10);
    });
    setSearchQuery("");
  };

  const removeHistoryItem = (item: string) => {
    setHistory((prev) => prev.filter((i) => i !== item));
  };

  const clearAll = () => {
    Alert.alert(
      "Clear All",
      "Clear all recent searches?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => setHistory([]),
        },
      ],
      { cancelable: true }
    );
  };

  const handleResultPress = (item: any) => {
    // Add to history
    const trimmed = item.title.trim();
    setHistory((prev) => {
      const updated = [trimmed, ...prev.filter((i) => i !== trimmed)];
      return updated.slice(0, 10);
    });
    
    // Navigate to book details or perform action
    console.log("Selected:", item);
    // router.push(`/book/${item.id}`);
  };

  // Dismiss keyboard when tapping outside
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Render search result item
  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultRow}
      onPress={() => {
        handleResultPress(item);
        dismissKeyboard();
      }}
      activeOpacity={0.6}
    >
      <View style={styles.resultIconContainer}>
        <Ionicons
          name="book-outline"
          size={scale(24, width)}
          color="#003EF9"
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.resultAuthor} numberOfLines={1}>
          {item.author} • {item.type}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={scale(20, width)}
        color="#00000040"
      />
    </TouchableOpacity>
  );

  // Calculate bottom padding based on keyboard height
  const bottomPadding = Platform.OS === 'ios' 
    ? Math.max(insets.bottom, verticalScale(20, height))
    : isKeyboardVisible 
      ? keyboardHeight + verticalScale(50,height)
      : Math.max(insets.bottom, verticalScale(20,height));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#6FE9F0" />
      <LinearGradient
        colors={["#ffffffff", "#aff6f6ff"]}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
          <View style={styles.gradientContainer}>
            {/* TOP BAR */}
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-back"
                  size={scale(26, width)}
                  color="#000000ff"
                />
              </TouchableOpacity>
              <Text style={styles.topTitle}>
                {showResults ? "Search Results" : "Recent searches"}
              </Text>
              {!showResults && (
                <TouchableOpacity onPress={clearAll} activeOpacity={0.7}>
                  <Text style={styles.clearAll}>Clear all</Text>
                </TouchableOpacity>
              )}
              {showResults && <View style={{ width: scale(60, width) }} />}
            </View>

            {/* CONTENT CARD */}
            <View style={styles.card}>
              {/* SEARCH RESULTS */}
              {showResults ? (
                isSearching ? (
                  <View style={styles.loadingState}>
                    <ActivityIndicator size="large" color="#003EF9" />
                    <Text style={styles.loadingText}>Searching...</Text>
                  </View>
                ) : searchResults.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="search-outline"
                      size={scale(64, width)}
                      color="#003EF940"
                    />
                    <Text style={styles.emptyText}>No results found</Text>
                    <Text style={styles.emptySubtext}>
                      Try searching with different keywords
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSearchResult}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    bounces={true}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContent}
                  />
                )
              ) : (
                /* HISTORY LIST */
                history.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons
                      name="search-outline"
                      size={scale(64, width)}
                      color="#003EF940"
                    />
                    <Text style={styles.emptyText}>No recent searches yet</Text>
                    <Text style={styles.emptySubtext}>
                      Start typing to find books
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={history}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.row}
                        onPress={() => {
                          setSearchQuery(item);
                          inputRef.current?.focus();
                        }}
                        activeOpacity={0.6}
                      >
                        <View style={styles.rowLeft}>
                          <Ionicons
                            name="time-outline"
                            size={scale(20, width)}
                            color="#003EF9"
                            style={styles.historyIcon}
                          />
                          <Text style={styles.rowText}>{item}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeHistoryItem(item)}
                          style={styles.deleteBtn}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="close"
                            size={scale(20, width)}
                            color="#00000060"
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    bounces={true}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.listContent}
                  />
                )
              )}
            </View>

            {/* BOTTOM SEARCH BAR - Using manual keyboard handling for Android */}
            <View style={[styles.bottomWrapper, { paddingBottom: bottomPadding }]}>
              <View style={styles.searchBar}>
                <Ionicons
                  name="search-outline"
                  size={scale(20, width)}
                  color="#00000060"
                  style={styles.searchIcon}
                />
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  placeholder="Search books, authors, subjects"
                  placeholderTextColor="#00000060"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={addHistory}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="close-circle"
                      size={scale(18, width)}
                      color="#00000060"
                    />
                  </TouchableOpacity>
                )}
                <View style={styles.divider} />
                <TouchableOpacity
                  style={[
                    styles.micBtn,
                    isRecording && styles.micBtnRecording,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIsRecording(!isRecording)}
                >
                  <Ionicons
                    name={isRecording ? "stop-circle" : "mic"}
                    size={scale(22, width)}
                    color={isRecording ? "#FF3B30" : "#000000ff"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </>
  );
};

export default SearchScreen;

const createStyles = (width: number, height: number, insets: any) => {
  const s = (size: number) => scale(size, width);
  const vs = (size: number) => verticalScale(size, height);
  const ms = (size: number, factor?: number) =>
    moderateScale(size, factor, width);

  const isSmallDevice = width < 375;

  return StyleSheet.create({
    gradientContainer: {
      flex: 1,
    },
    
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: s(20),
      paddingTop: Math.max(insets.top, vs(10)) + vs(10),
      paddingBottom: vs(16),
    },
    backBtn: {
      paddingRight: s(12),
      paddingVertical: vs(8),
      paddingLeft: s(0),
      minWidth: s(40),
      minHeight: s(40),
      justifyContent: "center",
    },
    topTitle: {
      flex: 1,
      fontSize: isSmallDevice ? ms(18) : ms(22),
      fontWeight: "700",
      color: "#000000ff",
      letterSpacing: 0.3,
    },
    clearAll: {
      fontSize: isSmallDevice ? ms(13) : ms(15),
      color: "#003EF9",
      fontWeight: "600",
      minWidth: s(60),
      textAlign: "right",
    },

    card: {
      flex: 1,
      marginHorizontal: s(16),
      marginTop: vs(12),
      marginBottom: vs(8),
      backgroundColor: "#f8ffffff",
      borderRadius: ms(24),
      paddingHorizontal: s(0),
      paddingVertical: vs(0),
      shadowColor: "#003EF9",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },

    listContent: {
      paddingVertical: vs(12),
      flexGrow: 1,
    },

    // History styles
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: vs(16),
      paddingHorizontal: s(20),
      minHeight: vs(54),
    },

    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      paddingRight: s(10),
    },

    historyIcon: {
      marginRight: s(12),
    },

    rowText: {
      fontSize: isSmallDevice ? ms(14) : ms(16),
      color: "#1C1C1E",
      fontWeight: "500",
      flex: 1,
    },

    deleteBtn: {
      padding: s(8),
      marginLeft: s(4),
      minWidth: s(36),
      minHeight: s(36),
      justifyContent: "center",
      alignItems: "center",
    },

    // Search result styles
    resultRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: vs(14),
      paddingHorizontal: s(20),
      minHeight: vs(70),
    },

    resultIconContainer: {
      width: s(48),
      height: s(48),
      borderRadius: s(12),
      backgroundColor: "#003EF910",
      justifyContent: "center",
      alignItems: "center",
      marginRight: s(14),
    },

    resultContent: {
      flex: 1,
      paddingRight: s(10),
    },

    resultTitle: {
      fontSize: isSmallDevice ? ms(15) : ms(17),
      color: "#1C1C1E",
      fontWeight: "600",
      marginBottom: vs(4),
    },

    resultAuthor: {
      fontSize: isSmallDevice ? ms(12) : ms(14),
      color: "#00000070",
      fontWeight: "400",
    },

    separator: {
      height: 0.5,
      backgroundColor: "#00000010",
      marginLeft: s(52),
      marginRight: s(20),
    },

    // Loading and empty states
    loadingState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: vs(60),
    },

    loadingText: {
      fontSize: isSmallDevice ? ms(14) : ms(16),
      color: "#003EF9",
      marginTop: vs(16),
      fontWeight: "500",
    },

    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: vs(60),
      paddingHorizontal: s(20),
    },

    emptyText: {
      fontSize: isSmallDevice ? ms(16) : ms(18),
      fontWeight: "600",
      color: "#003EF9",
      marginTop: vs(16),
    },

    emptySubtext: {
      fontSize: isSmallDevice ? ms(12) : ms(14),
      color: "#00000060",
      marginTop: vs(8),
      textAlign: "center",
    },

    // Bottom search bar
    bottomWrapper: {
      paddingHorizontal: s(16),
      paddingTop: vs(16),
    },

    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ffffffe8",
      borderRadius: ms(28),
      paddingHorizontal: s(16),
      height: vs(56),
      minHeight: 50,
      shadowColor: "#003EF9",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1.5,
      borderColor: "#003EF920",
    },

    searchIcon: {
      marginRight: s(10),
    },

    searchInput: {
      flex: 1,
      fontSize: isSmallDevice ? ms(14) : ms(16),
      color: "#1C1C1E",
      fontWeight: "500",
      paddingVertical: vs(8),
    },

    clearBtn: {
      padding: s(4),
      marginRight: s(8),
      minWidth: s(30),
      minHeight: s(30),
      justifyContent: "center",
      alignItems: "center",
    },

    divider: {
      width: 1,
      height: "60%",
      backgroundColor: "#00000015",
      marginHorizontal: s(12),
    },

    micBtn: {
      padding: s(4),
      minWidth: s(36),
      minHeight: s(36),
      justifyContent: "center",
      alignItems: "center",
    },

    micBtnRecording: {
      backgroundColor: "#FF3B3020",
      borderRadius: s(18),
    },
  });
};