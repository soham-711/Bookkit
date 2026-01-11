import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  title?: string;
  subtitle?: string;
};

export default function LocationEmptyState({
  title = "No books available here",
  subtitle = "Try changing the location to explore nearby books",
}: Props) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/Nodata.gif")}
        style={styles.gif}
        resizeMode="contain"
      />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  gif: {
    width: 340,
    height: 340,
    marginBottom: 4,
  },
  title: {
    marginTop: -90,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});