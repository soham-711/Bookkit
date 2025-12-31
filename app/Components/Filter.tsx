import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

type Params = {
  currentMaxDistanceKm?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentBrands?: string; // comma-separated
};

type FilterCategory = {
  id: string;
  label: string;
};

const BRANDS = [
  "Flipkart SmartBuy",
  "LA VERNE",
  "Signature",
  "CARLTON LONDON",
  "Flipkart Perfect Homes",
  "Divine Casa",
  "MONTE CARLO",
  "Raymond Home",
  "Story@home",
  "Wakefit",
  "Dream Care",
  "Solimo",
];

const CATEGORIES: FilterCategory[] = [
  { id: "brand", label: "Brand" },
  { id: "old", label: "old" },
  { id: "new", label: "new" },
  { id: "type", label: "Type" },
  { id: "Distance", label: "Distance" },
  { id: "ratings", label: "Customer Ratings" },
  { id: "price", label: "Price" },
  { id: "pack", label: "Pack of" },
];

export default function Filter() {
  const params = useLocalSearchParams<Params>();
  const { width, height } = useWindowDimensions();

  // Responsive Sidebar Width (30% of screen, max 140px)
  const SIDEBAR_WIDTH = Math.min(width * 0.35, 140);

  const [activeCategory, setActiveCategory] = useState<string>("brand");
  const [searchBrand, setSearchBrand] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    params.currentBrands ? params.currentBrands.split(",") : []
  );

  const [minPrice, setMinPrice] = useState(params.currentMinPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(params.currentMaxPrice ?? "");
  const [maxDistance, setMaxDistance] = useState(params.currentMaxDistanceKm ?? "");

  const filteredBrands = BRANDS.filter((b) =>
    b.toLowerCase().includes(searchBrand.toLowerCase())
  );

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setMinPrice("");
    setMaxPrice("");
    setMaxDistance("");
    setSearchBrand("");
  };

  const apply = () => {
    const params = new URLSearchParams({
      selectedBrands: selectedBrands.join(","),
      selectedMinPrice: minPrice,
      selectedMaxPrice: maxPrice,
      selectedMaxDistanceKm: maxDistance,
    }).toString();

    ;
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "brand":
        return (
          <View style={styles.contentContainer}>
            <TextInput
              value={searchBrand}
              onChangeText={setSearchBrand}
              placeholder="Search Brand"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />

            <ScrollView
              style={styles.optionsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {filteredBrands.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                return (
                  <Pressable
                    key={brand}
                    style={styles.optionRow}
                    onPress={() => toggleBrand(brand)}
                    android_ripple={{ color: "#E2E8F0" }}
                  >
                    <View
                      style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </View>
                    <Text style={styles.optionText}>{brand}</Text>
                  </Pressable>
                );
              })}

              <Pressable style={styles.viewMoreBtn}>
                <Text style={styles.viewMoreText}>View More</Text>
              </Pressable>
            </ScrollView>
          </View>
        );

      case "price":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionLabel}>Price Range</Text>
            <View style={styles.priceRow}>
              <TextInput
                value={minPrice}
                onChangeText={setMinPrice}
                placeholder="Min"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
                style={styles.priceInput}
              />
              <Text style={styles.priceSeparator}>to</Text>
              <TextInput
                value={maxPrice}
                onChangeText={setMaxPrice}
                placeholder="Max"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
                style={styles.priceInput}
              />
            </View>
          </View>
        );

      case "Distance":
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionLabel}>Max Distance (km)</Text>
            <TextInput
              value={maxDistance}
              onChangeText={setMaxDistance}
              placeholder="e.g., 5"
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>
        );

      default:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.emptyText}>No filters available</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Filters</Text>
          <Pressable onPress={clearAll} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear Filters</Text>
          </Pressable>
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Left Sidebar */}
          <View style={[styles.sidebar, { width: SIDEBAR_WIDTH }]}>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isActive = activeCategory === item.id;
                return (
                  <Pressable
                    style={[
                      styles.categoryItem,
                      isActive && styles.categoryItemActive,
                    ]}
                    onPress={() => setActiveCategory(item.id)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isActive && styles.categoryTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                    {isActive && <View style={styles.activeBadge} />}
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Right Content Panel */}
          <View style={styles.rightPanel}>{renderCategoryContent()}</View>
        </View>

        {/* Bottom Apply Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.productCount}>40,856</Text>
            <Text style={styles.productLabel}>products found</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.applyBtn,
              pressed && { opacity: 0.9 },
            ]}
            onPress={apply}
          >
            <Text style={styles.applyText}>Apply</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },
  safe: { flex: 1 },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  clearBtn: {
    padding: 8,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },

  mainContent: {
    flex: 1,
    flexDirection: "row",
  },

  // Sidebar
  sidebar: {
    backgroundColor: "#F1F5F9",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
  },
  categoryItem: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    position: "relative",
    justifyContent: "center",
    minHeight: 54,
  },
  categoryItemActive: {
    backgroundColor: "white",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },
  categoryTextActive: {
    fontWeight: "700",
    color: "#0F172A",
  },
  activeBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: "#3B82F6",
  },

  // Right Panel
  rightPanel: {
    flex: 1,
    backgroundColor: "white",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  searchInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },
  optionsList: {
    flex: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  optionText: {
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
    flexShrink: 1,
  },
  viewMoreBtn: {
    paddingVertical: 16,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  priceSeparator: {
    fontSize: 14,
    color: "#64748B",
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 40,
  },

  // Bottom Bar
  bottomBar: {
    height: Platform.OS === "ios" ? 80 : 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "ios" ? 10 : 0,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
  },
  productCount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  productLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  applyBtn: {
    backgroundColor: "rgba(20, 218, 232, 0.9)",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  applyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});