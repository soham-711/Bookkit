import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";

type SortKey = "distanceAsc" | "priceAsc" | "priceDesc" | "titleAsc" | "newest";

type Params = {
  currentSort?: SortKey;
};

export default function SortList() {
  const params = useLocalSearchParams<Params>();
  const initialSort: SortKey = (params.currentSort as SortKey) || "distanceAsc";
  const [local, setLocal] = useState<SortKey>(initialSort);

  const { height } = useWindowDimensions();

  const options: { key: SortKey; label: string }[] = useMemo(
    () => [
      { key: "distanceAsc", label: "Relevance" },
      { key: "priceAsc", label: "Popularity" },
      { key: "priceDesc", label: "Price -- Low to High" },
      { key: "titleAsc", label: "Price -- High to Low" },
      { key: "newest", label: "Newest First" },
    ],
    []
  );

  return (
    <View style={styles.root}>
      {/* Blurred background overlay */}
      <Pressable
        style={styles.backdrop}
        onPress={() => router.back()}
        accessible={false}
      >
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>

      {/* Bottom sheet */}
      <View style={[styles.sheet, { maxHeight: height * 0.6 }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>SORT BY</Text>
        </View>

        <View style={styles.optionsContainer}>
          {options.map((o, idx) => {
            const selected = o.key === local;
            const isLast = idx === options.length - 1;
            return (
              <Pressable
                key={o.key}
                style={[styles.row, isLast && styles.rowLast]}
                onPress={() => {
                  setLocal(o.key);
                  // Auto-apply on selection (like the image)
                }}
                android_ripple={{ color: "#00000010" }}
              >
                <Text style={styles.rowText}>{o.label}</Text>
                <View
                  style={[
                    styles.radio,
                    selected && styles.radioSelected,
                  ]}
                >
                  {selected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 34,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    alignSelf: "center",
    marginBottom: 16,
  },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
  },

  optionsContainer: {
    paddingHorizontal: 20,
  },

  row: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  rowLast: {
    borderBottomWidth: 0,
  },

  rowText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  radioSelected: {
    borderColor: "#3B82F6",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },
});