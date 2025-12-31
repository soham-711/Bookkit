import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

const VerifiedPopUp = () => {
  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={["#FFFFFF", "#99F6FB"]}
        start={{ x: 0, y: 0 }} // top-left
        end={{ x: 1, y: 1 }} // bottom-right
        style={styles.popupContainer}
      >
        {/* Check Icon */}
        <View style={styles.iconWrapper}>
          <Image source={require('../../assets/images/Right.gif')} style={{height:58,width:58}}></Image>
        </View>

        <View style={{marginLeft:5}}>
          {/* Title */}
          <Text style={styles.title}>Verified</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Exchange Books, Build Futures.</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default VerifiedPopUp;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  popupContainer: {
    width: width * 0.85,
    height: 160,
    borderRadius: 18,
    paddingVertical: 30,
    paddingHorizontal: 22,
    alignItems: "center",

    // Shadow
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    flexDirection:'row'
  },
  iconWrapper: {
    marginLeft:20
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#397CFA",
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 15,
    color: "#000000",
    textAlign: "center",
  },
});
