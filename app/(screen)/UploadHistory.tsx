import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  Clock,
  XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUploadHistory } from "../../Context/UploadHistoryContext"; // ✅ use context

type FilterType = "All" | "Pending" | "Approved" | "Rejected";

const STATUS_CONFIG = {
  approved: { color: "#10B981", icon: CheckCircle },
  pending: { color: "#F59E0B", icon: Clock },
  rejected: { color: "#EF4444", icon: XCircle },
};

export default function SellerHistoryScreen() {
  const [filter, setFilter] = useState<FilterType>("All");
  const filters: FilterType[] = ["All", "Pending", "Approved", "Rejected"];

  const { uploads, loading } = useUploadHistory();

  /* Filter uploads based on approval_status */
  const filteredData = uploads.filter((item) => {
    if (filter === "All") return true;
    return item.approval_status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => console.log("Go back")}>
          <ChevronLeft size={24} color="#1F2937" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Uploads</Text>
          <Text style={styles.headerCount}>
            {filteredData.length}/{uploads.length}
          </Text>
        </View>
      </View>

      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[styles.filterBtn, filter === item && styles.filterActive]}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 50 }}>Loading...</Text>
        ) : filteredData.length > 0 ? (
          filteredData.map((item) => {
            const statusKey = item.approval_status.toLowerCase() as keyof typeof STATUS_CONFIG;
            const { color, icon: Icon } = STATUS_CONFIG[statusKey];

            return (
              <View key={item.id} style={styles.card}>
                {/* Status & Order */}
                <View style={styles.cardTop}>
                  <Text style={styles.orderId}>#{item.id.slice(0, 8)}</Text>
                  <View style={styles.statusBadge}>
                    <Icon size={16} color={color} />
                    <Text style={[styles.statusText, { color }]}>
                      {item.approval_status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Book Info */}
                <View style={styles.bookRow}>
                  <View style={styles.bookIcon}>
                    <BookOpen size={22} color="#9CA3AF" />
                  </View>
                  <View style={styles.bookInfo}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>{item.authorname ?? "Unknown"}</Text>
                    <Text style={styles.bookPrice}>₹{item.generated_price}</Text>
                  </View>
                </View>

                {/* Rejection reason */}
                {item.rejection_reason && (
                  <View style={styles.cancelBox}>
                    <Text style={styles.cancelText}>{item.rejection_reason}</Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <BookOpen size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No uploads yet</Text>
            <Text style={styles.emptyText}>Upload books to see your history here</Text>
          </View>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#FFFFFF" },
  backButton: { padding: 4, marginRight: 12 },
  headerContent: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  headerCount: { fontSize: 14, fontWeight: "600", color: "#6B7280" },

  filtersContainer: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#F3F4F6", paddingVertical: 8 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 4 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 8, backgroundColor: "#F3F4F6", borderRadius: 20, marginRight: 10 },
  filterActive: { backgroundColor: "#79cbe7" },
  filterText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  filterTextActive: { color: "#FFFFFF" },

  contentScroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  bottomSpacer: { height: 20 },

  card: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginVertical: 8, padding: 16, borderRadius: 18, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  orderId: { color: "#6B7280", fontWeight: "600" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusText: { fontSize: 12, fontWeight: "700" },
  bookRow: { flexDirection: "row" },
  bookIcon: { width: 48, height: 48, backgroundColor: "#F3F4F6", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  bookInfo: { marginLeft: 12, flex: 1 },
  bookTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937" },
  bookAuthor: { fontSize: 13, color: "#6B7280", marginVertical: 2 },
  bookPrice: { fontSize: 16, fontWeight: "700", color: "#16A34A" },
  cancelBox: { marginTop: 10, padding: 10, backgroundColor: "#FEE2E2", borderRadius: 10 },
  cancelText: { color: "#DC2626", fontWeight: "600", fontSize: 13 },
  emptyState: { alignItems: "center", marginTop: 60, paddingHorizontal: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937", marginTop: 10 },
  emptyText: { fontSize: 14, color: "#6B7280", marginTop: 4, textAlign: "center" },
});
