import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "../../Utils/supabase";




const CredencialForm = () => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [nameError, setNameError] = useState(""); // 🎯 Error state
 const [userId, setUserId] = useState<string | null>(null);
const [phone, setPhone] = useState("");



  // Responsive scaling functions
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;


  const styles = createStyles(width, height, insets);
  const iconSize = moderateScale(20);

  // 🎯 Validation function
  const validateName = () => {
    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      setNameError("Please enter your name");
      return false;
    }
    
    if (trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setNameError("Name can only contain letters");
      return false;
    }
    
    setNameError("");
    return true;
  };

// const saveProfile = async () => {
//   if (!validateName()) return;
//   if (!userId) return;

//   const { error } = await supabase
//     .from("profiles")
//     .update({
//       full_name: name.trim(),
//       phone: phone,
//       onboarding_completed: true,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("user_id", userId);

//   if (error) {
//     Alert.alert("Error", error.message);
//     return;
//   }

//   // ✅ Onboarding done forever
//   router.replace("/(screen)/UserCurrentLocation");
// };

    const saveProfile = async () => {
  if (!validateName()) return;
  if (!userId) return;

  const { error } = await supabase.from("profiles").insert({
    user_id: userId,
    full_name: name.trim(),
    phone: phone,
    created_at: new Date().toISOString(),
  });

  if (error) {
    Alert.alert("Error", error.message);
    return;
  }

  // ✅ Profile created → go to address screen
  router.replace("/(screen)/UserCurrentLocation");
};


  // 🎯 Handle address navigation
const handleAddressNavigation = async (route: string) => {
  if (!validateName()) {
    Alert.alert(
      "Name Required",
      "Please enter your name before adding an address."
    );
    return;
  }

  await saveProfile();
};


useEffect(() => {
  const loadUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      Alert.alert("Session expired", "Please login again");
      return;
    }

    setUserId(session.user.id);
    setPhone(session.user.phone || "");
  };

  loadUser();
}, []);

  return (
    <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView

        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
          >
            {/* ===== LOGO ===== */}
            <View style={styles.centerSection}>
              <Image
                source={require("../../assets/images/ExBookLogo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.slogan}>Find's Books Near You</Text>
            </View>


            {/* ===== PAPER (Behind Card) ===== */}
            <Image
              source={require("../../assets/images/LoginPagePaperImage.png")}
              style={styles.paper}
              resizeMode="contain"
            />


            {/* ===== CARD STACK ===== */}
            <View style={styles.cardStack}>
              {/* Character */}
              <Image
                source={require("../../assets/images/CredencialFormGif.gif")}
                style={styles.character}
                resizeMode="contain"
              />


              {/* CARD */}
              <BlurView
                intensity={Platform.OS === "android" ? 25 : 36}
                tint="light"
                style={styles.card}
              >
                {/* NAME */}
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor="#000000e0"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    // Clear error when user starts typing
                    if (nameError) setNameError("");
                  }}
                  style={[
                    styles.input,
                    isNameFocused && styles.inputFocused,
                    nameError && styles.inputError, // 🎯 Error styling
                  ]}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => {
                    setIsNameFocused(false);
                    // Validate on blur
                    if (name.trim().length > 0) {
                      validateName();
                    }
                  }}
                />
                
                {/* 🎯 Error message */}
                {nameError ? (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle"
                      size={moderateScale(16)}
                      color="#FF3B30"
                    />
                    <Text style={styles.errorText}>{nameError}</Text>
                  </View>
                ) : null}


                {/* MOBILE */}
                <Text style={styles.label}>Mobile Number</Text>
                <TextInput
                  value={phone}
                  editable={false}
                  style={[styles.input, styles.disabledInput]}
                />


                {/* ADDRESS */}
                <Text style={styles.label}>Address</Text>


                {/* USE LOCATION */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleAddressNavigation("/(screen)/UserCurrentLocation")}
                >
                  <View style={[styles.actionRow, styles.locationRow]}>
                    <View style={styles.rowLeft}>
                      <Ionicons
                        name="locate-outline"
                        size={iconSize}
                        color="#003EF9"
                      />
                      <Text style={styles.locationText}>
                        Use current Location
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={iconSize}
                      color="#003EF9"
                    />
                  </View>
                </TouchableOpacity>


                {/* ADD ADDRESS */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleAddressNavigation("/(screen)/UserManualLocation")}
                >
                  <View style={[styles.actionRow, styles.addRow]}>
                    <View style={styles.rowLeft}>
                      <MaterialIcons
                        name="add"
                        size={iconSize}
                        color="#1E88E5"
                      />
                      <Text style={styles.addText}>Add Address</Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={iconSize}
                      color="#1E88E5"
                    />
                  </View>
                </TouchableOpacity>
              </BlurView>
            </View>


            {/* Spacer for bottom padding */}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};


export default CredencialForm;


/* ================= RESPONSIVE STYLES ================= */


const createStyles = (width: number, height: number, insets: any) => {
  // Scaling functions
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;


  return StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: "center",
      paddingTop: Math.max(insets.top, verticalScale(10)),
      paddingBottom: Math.max(insets.bottom, verticalScale(30)),
      minHeight: height,
    },


    centerSection: {
      height: height * 0.25,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: verticalScale(20),
    },


    logo: {
      width: width * 0.65,
      height: verticalScale(140),
      maxWidth: 280,
    },


    slogan: {
      fontSize: moderateScale(18),
      fontWeight: "700",
      marginTop: verticalScale(-8),
      color: "#000",
      fontFamily: "Potta One",
      textAlign: "center",
      paddingHorizontal: scale(20),
    },


    paper: {
      width: "100%",
      opacity: 0.5,
      height: verticalScale(280),
      position: "absolute",
      bottom: 0,
      zIndex: 0,
    },


    cardStack: {
      width: "100%",
      alignItems: "center",
      marginTop: verticalScale(70),
      zIndex: 10,
    },


    character: {
      width: width * 0.28,
      height: verticalScale(85),
      position: "absolute",
      top: verticalScale(-85),
      zIndex: 20,
    },


    card: {
      width: "88%",
      maxWidth: 450,
      paddingTop: verticalScale(35),
      paddingHorizontal: scale(18),
      paddingBottom: verticalScale(35),
      borderWidth: 1,
      borderColor: "#3DB9D4",
      borderTopLeftRadius: moderateScale(27),
      borderTopRightRadius: moderateScale(10),
      borderBottomRightRadius: moderateScale(27),
      borderBottomLeftRadius: moderateScale(10),
      shadowColor: "#3DB9D4",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
   
      overflow: "hidden",
    },


    label: {
      fontSize: moderateScale(15),
      fontWeight: "600",
      marginBottom: verticalScale(8),
      color: "#000",
      letterSpacing: 0.3,
    },


    input: {
      borderRadius: moderateScale(8),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(14),
      fontSize: moderateScale(16),
      color: "#000",
      marginBottom: verticalScale(14),
      minHeight: verticalScale(48),
      borderColor: "#3DB9D4",
      borderWidth: 2,
      backgroundColor: "transparent",
    },


    inputFocused: {
      borderColor: "#003ef9a2",
      borderWidth: 2,
      backgroundColor: "transparent",
    },

    // 🎯 Error state styling
    inputError: {
      borderColor: "#FF3B30",
      borderWidth: 2,
      marginBottom: verticalScale(8),
    },

    // 🎯 Error message container
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(12),
      marginTop: verticalScale(-4),
      gap: scale(6),
    },

    // 🎯 Error text
    errorText: {
      fontSize: moderateScale(13),
      color: "#FF3B30",
      fontWeight: "500",
      letterSpacing: 0.2,
    },


    disabledInput: {
      backgroundColor: "#3DB9D440",
      borderColor: "#3DB9D4",
      color: "#000000B3",
    },


    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderRadius: moderateScale(8),
      paddingVertical: verticalScale(12),
      paddingHorizontal: scale(14),
      marginBottom: verticalScale(12),
      minHeight: verticalScale(48),
    },


    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8),
    },


    locationRow: {
      borderWidth: 2,
      borderColor: "#003EF9",
      backgroundColor: "transparent",
    },


    locationText: {
      fontSize: moderateScale(16),
      fontWeight: "500",
      color: "#003EF9",
      letterSpacing: 0.3,
    },


    addRow: {
      borderWidth: 2,
      borderColor: "#1E88E5",
      backgroundColor: "transparent",
    },


    addText: {
      fontSize: moderateScale(16),
      fontWeight: "500",
      color: "#1E88E5",
      letterSpacing: 0.3,
    },


    bottomSpacer: {
      height: verticalScale(50),
    },
  });
};