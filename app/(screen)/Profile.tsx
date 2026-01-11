import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Clock,
  Edit,
  Info,
  LogOut,
  Settings,
  Star,
  ThumbsUp,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../Utils/supabase"; // adjust path
const ProfileScreen = () => {
  const { width, height } = useWindowDimensions();
  const styles = createStyles(width, height);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);

      // 1️⃣ Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setPhone(user.phone ?? "");

      // 2️⃣ Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle(); // ✅ SAFE

      setFullName(profile?.full_name ?? "");
      // ✅ APPLY CACHE BUSTING HERE
      if (profile?.avatar_url) {
        setAvatarUri(`${profile.avatar_url}?t=${Date.now()}`);
      } else {
        setAvatarUri(null);
      }
  
      // 3️⃣ Get default address (SAFE)
      let { data: addressData } = await supabase
        .from("addresses")
        .select("full_address")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // ✅ SAFE

      // 4️⃣ Fallback → latest address if no default exists
      if (!addressData) {
        const { data: latestAddress } = await supabase
          .from("addresses")
          .select("full_address")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        addressData = latestAddress;
      }

      setAddress(addressData?.full_address ?? "");

      setLoading(false);
    };

    fetchProfileData();
  }, []);

  return (
    <LinearGradient
      colors={["#70F3FA", "#FFFFFF"]}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button - Moved down and navigates to Dashboard */}
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.push('/(screen)/Dashboard')}
          >
            <ArrowLeft color="#000" size={scale(24, width)} />
          </TouchableOpacity>

          {/* Profile Card with Background Image - Clickable to Edit Profile */}
          <TouchableWithoutFeedback
          
            
          >
            <View style={styles.profileCardWrapper}>
              <LinearGradient
                colors={["#67E8F9", "#E0E7FF"]}
                start={{ x: 1, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={styles.profileCard}
              >
                {/* Background Decorative Image */}
                <Image
                  source={require("../../assets/images/page.png")}
                  style={styles.backgroundDecoration}
                  resizeMode="contain"
                />

                {/* Profile Header */}
                <TouchableWithoutFeedback style={styles.profileHeader} onPress={() => router.push("/(screen)/EditProfile")}>
                  <View style={styles.profileInfo}>
                    <View style={styles.avatarContainer}>
                      <LinearGradient
                        colors={["#6634C9", "#4e46e5"]}
                        style={styles.avatarBorder}
                      >
                        <View style={styles.avatar}>
                          <Image
                            source={
                              avatarUri
                                ? { uri: avatarUri }
                                : require("../../assets/images/profile.png")
                            }
                            style={styles.profileImage}
                            resizeMode="cover"
                          />
                        </View>
                      </LinearGradient>
                    </View>

                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{fullName || "User"}</Text>
                      <Text style={styles.userPhone}> {phone}</Text>
                      <Text
                        style={styles.userAddress}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {address || "Add your address"}
                      </Text>
                      <Text style={styles.editProfile}>Edit profile</Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>

              </LinearGradient>

              {/* Gold Coins Section - Connected to Profile Card */}
              <View style={styles.coinsCard} >
                <View style={styles.coinsContainer}>
                  <View style={styles.coinsLeft}>
                    <View style={styles.coinIcon}>
                      <Text style={styles.coinCurrency}>₹</Text>
                    </View>
                    <Text style={styles.goldCoinsText}>Gold Coins</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.savedBadge}
                    activeOpacity={0.7}
                    onPress={()=>router.push("/(screen)/GoldSection")}
                  >
                    <Text style={styles.savedText}>Saved ₹0</Text>
                    <ChevronRight
                      color="#D97706"
                      size={scale(20, width)}
                      strokeWidth={3}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* Action Buttons */}
          <View style={styles.actionGrid}>
            {/* My Orders - With custom icon and navigates to Orders */}
            <TouchableOpacity
              style={styles.actionButtonWrapper}
              activeOpacity={0.7}
              onPress={() => router.push("/(screen)/OrdersScreen")}
            >
              <LinearGradient
                colors={["#22D3EE", "#06B6D4"]}
                style={styles.actionButton}
              >
                <Image
                  source={require("../../assets/images/Orders_Icon.png")}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
                <Text style={styles.actionText}>My Orders</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sell books */}
            <TouchableOpacity
              style={styles.actionButtonWrapper}
              activeOpacity={0.7}
              onPress={() => router.push("/(screen)/UploadScreen1")}
            >
              <LinearGradient
                colors={["#22D3EE", "#06B6D4"]}
                style={styles.actionButton}
              >
                <Image
                  source={require("../../assets/images/Sellbook.png")}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
                <Text style={styles.actionText}>Sell books</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Deliverables - With custom icon and navigates to Deliverables */}
            <TouchableOpacity
              style={styles.actionButtonWrapper}
              activeOpacity={0.8}
              onPress={()=>router.push("/(screen)/DeliverablesScreen")}
            >
              <LinearGradient
                colors={["#22D3EE", "#06B6D4"]}
                style={styles.actionButton}
              >
                <Image
                  source={require("../../assets/images/Deliverables_Icon.png")}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
                <Text style={styles.actionText}>Deliverables</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Need help */}
            <TouchableOpacity
              style={styles.actionButtonWrapper}
              activeOpacity={0.7}
              onPress={() => router.push("/(screen)/Support")}
            >
              <LinearGradient
                colors={["#22D3EE", "#06B6D4"]}
                style={styles.actionButton}
              >
                <Image
                  source={require("../../assets/images/needhelp.png")}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
                <Text style={styles.actionText}>Need help?</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Menu List */}
          <View style={styles.menuContainer}>
            <MenuItem
              icon={<Star color="#fff" size={scale(24, width)} />}
              label="Your rating"
              badge="⭐"
              width={width}
              onPress={()=>router.push('/Components/CommingSoon')}
            />
            <MenuItem
              icon={<ThumbsUp color="#fff" size={scale(24, width)} />}
              label="Your feedback"
              width={width}
              onPress={()=>router.push('/Components/CommingSoon')}
            />
              <MenuItem
              icon={<Clock color="#fff" size={scale(24, width)} />}
              label="Sell History"
              width={width}
              onPress={()=>router.push('/Components/CommingSoon')}
            />
            <MenuItem
              icon={<Info color="#fff" size={scale(24, width)} />}
              label="About"
              width={width}
              onPress={()=>router.push('/Components/CommingSoon')}
            />
            <MenuItem
              icon={<Edit color="#fff" size={scale(24, width)} />}
              label="Send feedback"
              width={width}
              onPress={()=>router.push('/Components/CommingSoon')}
            />
            <MenuItem
              icon={<AlertCircle color="#fff" size={scale(24, width)} />}
              label="Report"
              width={width}
              onPress={()=>router.push('/Components/CommingSoon')}
            />
            <MenuItem
              icon={<Settings color="#fff" size={scale(24, width)} />}
              label="Settings"
              width={width}
              onPress={()=>router.push('/Components/CommingSoon')}
            />
            <MenuItem
              icon={<LogOut color="#fff" size={scale(24, width)} />}
              label="Logout"
              isLast
              width={width}
              onPress={() => {
                // Add logout logic here
              }}
            />
          </View>

          {/* Extra bottom padding for better scrolling */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isLast?: boolean;
  width: number;
  onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  badge,
  isLast,
  width,
  onPress,
}) => {
  const styles = createMenuStyles(width);

  return (
    <TouchableOpacity
      style={[styles.menuItem, !isLast && styles.menuItemBorder]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <ChevronRight color="#fff" size={scale(20, width)} />
      </View>
    </TouchableOpacity>
  );
};

// Responsive scaling functions
const scale = (size: number, width: number) => (width / 375) * size;
const verticalScale = (size: number, height: number) => (height / 812) * size;
const moderateScale = (size: number, width: number, factor = 0.5) =>
  size + (scale(size, width) - size) * factor;

const createStyles = (width: number, height: number) => {
  const CARD_PADDING = scale(16, width);
  const CARD_WIDTH = width - CARD_PADDING * 2;

  return StyleSheet.create({
    gradientContainer: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    contentContainer: {
      padding: CARD_PADDING,
      paddingTop: verticalScale(8, height),
      paddingBottom: verticalScale(20, height),
    },
    backButton: {
      marginBottom: verticalScale(20, height),
      padding: scale(8, width),
      alignSelf: "flex-start",
      zIndex: 10,
    },
    profileCardWrapper: {
      marginBottom: verticalScale(16, height),
      width: CARD_WIDTH,
      alignSelf: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: verticalScale(4, height) },
      shadowOpacity: 0.1,
      shadowRadius: scale(8, width),
      elevation: 4,
    },
    profileCard: {
      width: "100%",
      minHeight: verticalScale(180, height),
      borderTopLeftRadius: moderateScale(24, width),
      borderTopRightRadius: moderateScale(24, width),
      padding: scale(20, width),
      overflow: "hidden",
      position: "relative",
    },
    backgroundDecoration: {
      position: "absolute",
      right: scale(-15, width),
      top: 0,
      bottom: verticalScale(10, height),
      width: width,
      height: "100%",
      opacity: 1,
    },
    profileHeader: {
      zIndex: 1,
    },
    profileInfo: {
      flexDirection: "row",
      gap: scale(16, width),
      alignItems: "flex-start",
      flexWrap: "wrap",
    },
    avatarContainer: {
      marginTop: verticalScale(4, height),
    },
    avatarBorder: {
      width: scale(90, width),
      height: scale(90, width),
      borderRadius: scale(45, width),
      justifyContent: "center",
      alignItems: "center",
      padding: scale(3, width),
    },
    avatar: {
      width: scale(84, width),
      height: scale(84, width),
      borderRadius: scale(42, width),
      backgroundColor: "#E0E7FF",
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    profileImage: {
      width: "100%",
      height: "100%",
    },
    userDetails: {
      flex: 1,
      justifyContent: "center",
      minWidth: scale(150, width),
    },
    userName: {
      fontSize: moderateScale(22, width, 0.3),
      fontWeight: "bold",
      color: "#000",
      marginBottom: verticalScale(4, height),
    },
    userPhone: {
      fontSize: moderateScale(13, width, 0.3),
      color: "#4B5563",
      marginBottom: verticalScale(2, height),
    },
    userAddress: {
      fontSize: moderateScale(12, width, 0.3),
      color: "#6B7280",
      marginBottom: verticalScale(4, height),
    },
    editProfile: {
      fontSize: moderateScale(12, width, 0.3),
      color: "#2563EB",
      fontWeight: "600",
    },
    coinsCard: {
      width: "100%",
      backgroundColor: "#9EF5F7",
      borderBottomLeftRadius: moderateScale(15, width),
      borderBottomRightRadius: moderateScale(15, width),
      paddingHorizontal: scale(10, width),
      paddingVertical: verticalScale(12, height),
      borderWidth: scale(2, width),
      borderTopWidth: scale(1, width),
      borderColor: "#9ED3C9",
      marginTop: verticalScale(-49, height),
    },
    coinsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: scale(8, width),
    },
    coinsLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(10, width),
    },
    coinIcon: {
      width: scale(36, width),
      height: scale(36, width),
      borderRadius: scale(18, width),
      backgroundColor: "#FCD34D",
      justifyContent: "center",
      alignItems: "center",
    },
    coinCurrency: {
      fontSize: moderateScale(22, width, 0.3),
      fontWeight: "bold",
      color: "#fff",
    },
    goldCoinsText: {
      fontSize: moderateScale(16, width, 0.3),
      fontWeight: "600",
      color: "#D97706",
    },
    savedBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#FEF3C7",
      paddingHorizontal: scale(16, width),
      paddingVertical: verticalScale(8, height),
      borderRadius: moderateScale(20, width),
      gap: scale(6, width),
      borderWidth: scale(2, width),
      borderColor: "#F59E0B",
    },
    savedText: {
      fontSize: moderateScale(14, width, 0.3),
      fontWeight: "700",
      color: "#D97706",
    },
    actionGrid: {
      flexDirection: "row",
      gap: scale(12, width),
      marginBottom: verticalScale(16, height),
      width: CARD_WIDTH,
      alignSelf: "center",
      flexWrap: "wrap",
    },
    actionButtonWrapper: {
      flex: 1,
      minWidth: scale(70, width),
      minHeight: verticalScale(100, height),
    },
    actionButton: {
      borderRadius: moderateScale(16, width),
      padding: scale(16, width),
      alignItems: "center",
      gap: verticalScale(8, height),
      minHeight: verticalScale(100, height),
      justifyContent: "center",
      flex: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: verticalScale(2, height) },
      shadowOpacity: 0.1,
      shadowRadius: scale(4, width),
      elevation: 3,
    },
    actionIcon: {
      width: scale(32, width),
      height: scale(32, width),
    },
    actionText: {
      fontSize: moderateScale(11, width, 0.3),
      fontWeight: "600",
      color: "#fff",
      textAlign: "center",
    },
    menuContainer: {
      backgroundColor: "#3DB9D4",
      borderRadius: moderateScale(24, width),
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: verticalScale(4, height) },
      shadowOpacity: 0.1,
      shadowRadius: scale(12, width),
      elevation: 5,
      width: CARD_WIDTH,
      alignSelf: "center",
      marginTop: verticalScale(8, height),
    },
    bottomPadding: {
      height: verticalScale(20, height),
    },
  });
};

const createMenuStyles = (width: number) => {
  return StyleSheet.create({
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: scale(24, width),
      paddingVertical: scale(16, width),
      minHeight: scale(56, width),
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.2)",
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(12, width),
      flex: 1,
    },
    menuIcon: {
      width: scale(24, width),
      height: scale(24, width),
      justifyContent: "center",
      alignItems: "center",
    },
    menuLabel: {
      fontSize: moderateScale(16, width, 0.3),
      fontWeight: "600",
      color: "#fff",
      flexShrink: 1,
    },
    menuItemRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: scale(8, width),
    },
    badge: {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      paddingHorizontal: scale(12, width),
      paddingVertical: scale(4, width),
      borderRadius: moderateScale(12, width),
    },
    badgeText: {
      fontSize: moderateScale(14, width, 0.3),
      fontWeight: "600",
      color: "#fff",
    },
  });
};

export default ProfileScreen;
