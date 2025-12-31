import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../Utils/supabase";
import {
  Dimensions,
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
} from "react-native";

const OTP_LENGTH = 6;

const Login = () => {
  const { width, height } = useWindowDimensions();
  const [mobile, setMobile] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(null);
  const [isMobileFocused, setIsMobileFocused] = useState(false);

  const otpRefs = useRef<Array<React.RefObject<TextInput | null>>>(
    Array.from({ length: OTP_LENGTH }, () => React.createRef<TextInput>())
  );

  const isMobileValid = mobile.length === 10;
  const isOtpValid = otp.join("").length === OTP_LENGTH;

  /* ===== TIMER ===== */
  useEffect(() => {
    if (!showOtp) return;

    setTimer(60);
    setCanResend(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showOtp]);

  /* ===== OTP HANDLERS ===== */
  const handleOtpChange = (value: any, index: any) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      const nextRef = otpRefs.current[index + 1].current;
      if (nextRef && typeof nextRef.focus === "function") {
        nextRef.focus();
      }
    }
  };

  interface OtpKeyPressEvent {
    nativeEvent: {
      key: string;
    };
  }

  const handleOtpKeyPress = (e: OtpKeyPressEvent, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      const prevRef = otpRefs.current[index - 1].current;
      if (prevRef && typeof prevRef.focus === "function") {
        prevRef.focus();
      }
    }
  };

  // Responsive scaling functions
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;


  const sendOtp = async () => {
    Keyboard.dismiss();

    const phoneWithCountryCode = `+91${mobile}`;

    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneWithCountryCode,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setShowOtp(true);
    setTimeout(() => otpRefs.current[0].current?.focus(), 300);
  };

  const verifyOtp = async () => {
  const phoneWithCountryCode = `+91${mobile}`;
  const otpCode = otp.join("");

  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneWithCountryCode,
    token: otpCode,
    type: "sms",
  });

  if (error) {
    alert(error.message);
    return;
  }

  // ✅ USER IS LOGGED IN
  console.log("User:", data.user);

  router.replace("/(screen)/CredencialForm");
};


  return (
    <LinearGradient colors={["#70F3FA", "#FFFFFF"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView

        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles(width, height).scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ===== LOGO + SLOGAN (CENTER) ===== */}
            <View style={styles(width, height).centerSection}>
              <Image
                source={require("../../assets/images/ExBookLogo.png")}
                style={styles(width, height).logo}
                resizeMode="contain"
              />
              <Text style={styles(width, height).slogan} allowFontScaling={false}>
                "Old Books, New Opportunities."
              </Text>
            </View>

            {/* ===== CARD STACK ===== */}
            <View style={styles(width, height).cardStack}>
              {/* Character */}
              <Image
                source={require("../../assets/images/character.gif")}
                style={styles(width, height).character}
                resizeMode="contain"
              />

              {/* CARD */}
              <BlurView
                intensity={Platform.OS === "android" ? 25 : 36}
                tint="light"
                style={styles(width, height).card}
              >
                {/* MOBILE */}
                <Text style={styles(width, height).label}>Mobile Number</Text>
                <TextInput
                  placeholder="Enter your Mobile Number"
                  placeholderTextColor="#000000e0"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobile}
                  onChangeText={setMobile}
                  style={[
                    styles(width, height).input,
                    isMobileFocused && styles(width, height).inputFocused,
                  ]}
                  onFocus={() => setIsMobileFocused(true)}
                  onBlur={() => setIsMobileFocused(false)}
                />

                <TouchableOpacity
                  disabled={!isMobileValid}
                  activeOpacity={0.85}
                  onPress={sendOtp}
                >
                  <View
                    style={[
                      styles(width, height).button,
                      isMobileValid && styles(width, height).buttonActive,
                    ]}
                  >
                    <Text style={styles(width, height).buttonText}>
                      Get verification code
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* OTP SECTION */}
                {showOtp && (
                  <>
                    <View style={styles(width, height).otpHeader}>
                      <Text style={styles(width, height).label}>Enter OTP</Text>

                      {!canResend ? (
                        <Text style={styles(width, height).timer}>
                          00:{timer < 10 ? `0${timer}` : timer}
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={() => setShowOtp(true)}>
                          <Text style={styles(width, height).resend}>Resend</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles(width, height).otpRow}>
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={otpRefs.current[index]}
                          value={digit}
                          keyboardType="number-pad"
                          maxLength={1}
                          style={[
                            styles(width, height).otpBox,
                            (focusedOtpIndex === index || digit !== "") && 
                            styles(width, height).otpBoxFocused,
                          ]}
                          onChangeText={(v) => handleOtpChange(v, index)}
                          onKeyPress={(e) => handleOtpKeyPress(e, index)}
                          onFocus={() => setFocusedOtpIndex(index)}
                          onBlur={() => setFocusedOtpIndex(null)}
                        />
                      ))}
                    </View>

                    <TouchableOpacity
                      disabled={!isOtpValid}
                      activeOpacity={0.85}
                      onPress={verifyOtp}
                    >
                      <View
                        style={[
                          styles(width, height).button,
                          isOtpValid && styles(width, height).buttonActive,
                        ]}
                      >
                        <Text style={styles(width, height).buttonText}>Verify</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
              </BlurView>
            </View>

            {/* PAPER */}
            <Image
              source={require("../../assets/images/LoginPagePaperImage.png")}
              style={styles(width, height).paper}
              resizeMode="contain"
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Login;

/* ================= RESPONSIVE STYLES ================= */

const styles = (width: number, height: number) => {
  // Scaling functions for responsive design
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;

  return StyleSheet.create({
    scroll: {
      flexGrow: 1,
      alignItems: "center",
      paddingBottom: verticalScale(30),
    },

    centerSection: {
      height: height * 0.28,
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

    cardStack: {
      width: "100%",
      alignItems: "center",
      marginTop: verticalScale(50),
    },

    character: {
      width: width * 0.28,
      height: verticalScale(85),
      position: "absolute",
      top: verticalScale(-78),
      right: "18%",
      zIndex: 10,
      transform: [{ scaleX: -1 }],
    },

    card: {
      width: "88%",
      maxWidth: 450,
      paddingTop: verticalScale(45),
      paddingHorizontal: scale(18),
      paddingBottom: verticalScale(45),
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

    button: {
      backgroundColor: "#58cce664",
      borderRadius: moderateScale(8),
      paddingVertical: verticalScale(14),
      alignItems: "center",
      minHeight: verticalScale(48),
      justifyContent: "center",
      
    },

    buttonActive: {
      backgroundColor: "#3DB9D4",
  
      
    },

    buttonText: {
      fontSize: moderateScale(15),
      fontWeight: "600",
      color: "#000000ff",
      letterSpacing: 0.5,
    },

    otpHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: verticalScale(12),
    },

    timer: {
      fontSize: moderateScale(14),
      fontWeight: "500",
      color: "#000",
      letterSpacing: 0.5,
    },

    resend: {
      fontSize: moderateScale(14),
      fontWeight: "600",
      color: "#FF4E4E",
      textDecorationLine: "underline",
      textDecorationColor: "#FF4E4E",
    },

    otpRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: verticalScale(14),
      paddingHorizontal: scale(2),
    },

    otpBox: {
      width: moderateScale(44),
      height: moderateScale(52),
      backgroundColor: "transparent",
      borderRadius: moderateScale(10),
      textAlign: "center",
      fontSize: moderateScale(20),
      fontWeight: "600",
      color: "#000",
      borderWidth: 2,
      borderColor: "#3DB9D4",
    },

    otpBoxFocused: {
      borderColor: "#003ef9a2",
      borderWidth: 2,
      backgroundColor: "transparent",
      
    },

    paper: {
      width: "100%",
      height: verticalScale(190),
      marginTop: verticalScale(20),
    },
  });
};