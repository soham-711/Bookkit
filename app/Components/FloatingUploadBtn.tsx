import React, { useRef, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

// --- Types ---
type FloatingChipProps = {
  name: string;
  time: string;
  imageSource: ImageSourcePropType;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  width?: number;
};

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ==========================================================
// 1. THE PRESENTATION COMPONENT
// ==========================================================
const FloatingUploadBtn: React.FC<FloatingChipProps> = ({
  name,
  time,
  imageSource,
  onPress,
  style,
  width: customWidth,
}) => {
  const { width } = useWindowDimensions();

  const s = useCallback(
    (v: number) => {
      const scaled = (width / 390) * v;
      return scaled;
    },
    [width]
  );

  const shimmerX = useRef(new Animated.Value(-120)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runGlitterOnce = useCallback(() => {
    shimmerX.stopAnimation();
    shimmerOpacity.stopAnimation();
    shimmerX.setValue(-120);
    shimmerOpacity.setValue(0);

    Animated.sequence([
      Animated.timing(shimmerOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.parallel([
        Animated.timing(shimmerX, {
          toValue: 220,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ]),
    ]).start();
  }, [shimmerOpacity, shimmerX]);

  const scheduleRandomGlitter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const delay = 2500 + Math.floor(Math.random() * 4500);
    timeoutRef.current = setTimeout(() => {
      runGlitterOnce();
      scheduleRandomGlitter();
    }, delay);
  }, [runGlitterOnce]);

  useEffect(() => {
    scheduleRandomGlitter();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scheduleRandomGlitter]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          elevation: 10,
          shadowColor: "#1e88ff",
          shadowOpacity: 0.35,
          shadowRadius: s(14),
          shadowOffset: { width: 0, height: s(8) },
        },
        pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
        pill: {
          flexDirection: "row",
          alignItems: "center",
          gap: s(10),
          paddingHorizontal: s(12),
          paddingVertical: s(8),
          borderRadius: 999,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(203, 203, 203, 0.61)",
          height: s(56),
          width: customWidth,
          minWidth: customWidth ? undefined : s(200),
        },
        gloss: { position: "absolute", left: 0, right: 0, top: 0, height: "55%" },
        glitterWrap: {
          position: "absolute",
          left: 0,
          top: s(-20),
          width: s(90),
          height: s(120),
        },
        glitter: { flex: 1, borderRadius: 999 },
        avatar: {
          width: s(34),
          height: s(34),
          borderRadius: s(17),
          backgroundColor: "#1e88ff",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        },
        avatarImage: { width: "75%", height: "80%", transform: [{ translateY: s(2) }] },
        textBlock: { flex: 1, justifyContent: "center" },
        name: {
          color: "#FFFFFF",
          fontSize: s(14),
          fontWeight: "700",
          lineHeight: s(17),
        },
        subLine: {
          marginTop: s(1),
          color: "rgba(255,255,255,0.85)",
          fontSize: s(11),
          fontWeight: "600",
        },
      }),
    [s, customWidth]
  );

  return (
    <Pressable
      onPress={() => {
        runGlitterOnce();
        onPress?.();
      }}
      hitSlop={s(10)}
      style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}
    >
      <View style={styles.pill}>
        <LinearGradient
          colors={["#0000008a", "#00000083", "#00000095"]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(0, 155, 251, 1)", "rgba(33, 149, 243, 0.27)", "rgba(33, 149, 243, 0.00)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0.00)"]}
          style={styles.gloss}
        />

        <Animated.View
          style={[
            styles.glitterWrap,
            {
              opacity: shimmerOpacity,
              transform: [{ translateX: shimmerX }, { rotate: "-15deg" }],
            },
          ]}
        >
          <AnimatedLinearGradient
            colors={[
              "rgba(0, 160, 255, 0.00)",
              "rgba(0, 160, 255, 0.18)",
              "rgba(120, 220, 255, 0.45)",
              "rgba(0, 160, 255, 0.18)",
              "rgba(0, 160, 255, 0.00)",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.glitter}
          />
        </Animated.View>

        <View style={styles.avatar}>
          <Image source={imageSource} style={styles.avatarImage} resizeMode="cover" />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.subLine} numberOfLines={1}>
            {time}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
export default FloatingUploadBtn;
// ==========================================================
// 2. SIMPLIFIED FLOATING ACTION DOCK (No Orders)
// ==========================================================

export const FloatingActionDock: React.FC = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const s = (v: number) => (width / 390) * v;
  const CARD_WIDTH = width * 0.45; // Reduced from 0.82 to 0.70

  const FIXED_ITEM = {
    name: "Sell Books",
    time: "Tap to list books",
    image: require("../../assets/images/Sellbook.png"),
  };

  return (
    <View
      style={[styles.dockContainer, { transform: [{ translateY: s(35) }] }]}
      pointerEvents="box-none"
    >
      <View style={{ alignItems: "center" }}>
        {/* 🎯 SELL BOOKS - SINGLE FLOATING BUTTON */}
        <FloatingUploadBtn
          name={FIXED_ITEM.name}
          time={FIXED_ITEM.time}
          imageSource={FIXED_ITEM.image}
          width={CARD_WIDTH}
          onPress={() => router.push("/(screen)/UploadScreen1")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: "absolute",
    bottom: 70,
    left: 0,
    right: 0,
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
});