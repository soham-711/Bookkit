// import * as NavigationBar from "expo-navigation-bar";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useEffect, useRef, useState } from "react";
// import { ActivityIndicator, Animated, StyleSheet } from "react-native";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { LocationProvider } from "../Context/LocationContext";
// import { ProfileProvider } from "../Context/ProfileContext";
// import { UploadProvider } from "../Context/UploadContext";
// import { supabase } from "../Utils/supabase";

// export default function RootLayout() {
//   const [loading, setLoading] = useState(true);
//   const fadeAnim = useRef(new Animated.Value(1)).current;

//   /* ===== NAV BAR SETUP ===== */
//   useEffect(() => {
//     NavigationBar.setButtonStyleAsync("dark");
//   }, []);

//   /* ===== AUTH + PROFILE CHECK ===== */
//   useEffect(() => {
//     const run = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (!session) {
//         router.replace("/(auth)/Login");
//         finishLoading();
//         return;
//       }

//       const userId = session.user.id;

//       const { data: profile } = await supabase
//         .from("profiles")
//         .select("id")
//         .eq("user_id", userId)
//         .single();

//       if (!profile) {
//         router.replace("/(screen)/CredencialForm");
//       } else {
//         router.replace("/(screen)/Dashboard");
//       }

//       finishLoading();
//     };

//     run();
//   }, []);

//   /* ===== SMOOTH FADE OUT ===== */
//   const finishLoading = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 400,
//       useNativeDriver: true,
//     }).start(() => setLoading(false));
//   };

//   return (
//     <SafeAreaProvider>
//       <StatusBar translucent backgroundColor="transparent" style="dark" />

//       {/* MAIN NAVIGATION */}
//       {/* <Stack screenOptions={{ headerShown: false }} /> */}
//       <ProfileProvider>
//         <LocationProvider>
//           <UploadProvider>
//             <Stack screenOptions={{ headerShown: false }} />
//           </UploadProvider>
//         </LocationProvider>
//       </ProfileProvider>

//       {/* LOADING OVERLAY */}
//       {loading && (
//         <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
//           <ActivityIndicator size="large" color="#2CB4B2" />
//         </Animated.View>
//       )}
//     </SafeAreaProvider>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 999,
//   },
// });

import * as NavigationBar from "expo-navigation-bar";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DashboardProvider } from "../Context/DashboardContext";
import { LocationProvider, useLocationStore } from "../Context/LocationContext";
import { ProfileProvider } from "../Context/ProfileContext";
import { UploadProvider } from "../Context/UploadContext";

import {
  fetchUserAddresses,
  getCurrentLocation,
  reverseGeocode,
} from "../Services/locationService";

import { OrdersProvider } from "@/Context/OrdersContext";
import { supabase } from "../Utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---------- LOCATION BOOTSTRAPPER ---------- */
function LocationBootstrapper() {
  const { setLocationState, setAddresses, setLocationFormated } =
    useLocationStore();

  useEffect(() => {
    const bootstrapLocation = async () => {
      // 1️⃣ Get GPS
      const coords = await getCurrentLocation();
      if (!coords) return;

      // 2️⃣ Reverse geocode
      const addressText = await reverseGeocode(coords);

      // 3️⃣ Store current location (dashboard default)
      setLocationState(coords, addressText);
      setLocationFormated(addressText);
      // 4️⃣ Fetch saved addresses (no UI dependency)
      const saved = await fetchUserAddresses();
      setAddresses(saved);
    };

    bootstrapLocation();
  }, []);

  return null;
}

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  /* ===== NAV BAR SETUP ===== */
  useEffect(() => {
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  /* ===== AUTH + PROFILE CHECK ===== */
  useEffect(() => {
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/(auth)/Login");
        finishLoading();
        return;
      }

      const userId = session.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!profile) {
        router.replace("/(screen)/CredencialForm");
      } else {
        router.replace("/(screen)/Dashboard");
      }

      finishLoading();
    };

    run();
  }, []);





  /* ===== SMOOTH FADE OUT ===== */
  const finishLoading = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setLoading(false));
  };



  return (
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" style="dark" />

      {/* ===== PROVIDERS ===== */}
      <ProfileProvider>
        <LocationProvider>
          <DashboardProvider>
            <OrdersProvider>
              <UploadProvider>
                {/* LOCATION INIT (runs once) */}
                <LocationBootstrapper />

                {/* NAVIGATION */}
                <Stack screenOptions={{ headerShown: false }} />
              </UploadProvider>
            </OrdersProvider>
          </DashboardProvider>
        </LocationProvider>
      </ProfileProvider>

      {/* ===== LOADING OVERLAY ===== */}
      {loading && (
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <ActivityIndicator size="large" color="#2CB4B2" />
        </Animated.View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
