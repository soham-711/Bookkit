// import * as NavigationBar from "expo-navigation-bar";
// import { Stack } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useEffect } from "react";
// import { SafeAreaProvider } from "react-native-safe-area-context";

// export default function RootLayout() {
//   useEffect(() => {
//    // NavigationBar.setBackgroundColorAsync("transparent");
//     NavigationBar.setButtonStyleAsync("dark");
//   }, []);
//   return (
//     <SafeAreaProvider>
//       <StatusBar translucent backgroundColor="transparent" style="dark" />
//       <Stack screenOptions={{ headerShown: false }} />
//     </SafeAreaProvider>
//   );
// }



// import * as NavigationBar from "expo-navigation-bar";
// import { Stack, router } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { useEffect } from "react";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { supabase } from "../Utils/supabase";

// export default function RootLayout() {

//   /* ===== NAV BAR SETUP ===== */
//   useEffect(() => {
//     NavigationBar.setButtonStyleAsync("dark");
//     // NavigationBar.setBackgroundColorAsync("transparent");
//   }, []);

//   /* ===== AUTH LISTENER (GLOBAL) ===== */
//   useEffect(() => {
//     const { data: listener } = supabase.auth.onAuthStateChange(
//       (_event, session) => {
//         if (session) {
//           // User logged in
//           router.replace("/(screen)/CredencialForm");
//         } else {
//           // User logged out
//           router.replace("/(auth)/Login");
//         }
//       }
//     );

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   return (
//     <SafeAreaProvider>
//       <StatusBar translucent backgroundColor="transparent" style="dark" />
//       <Stack screenOptions={{ headerShown: false }} />
//     </SafeAreaProvider>
//   );
// }




import * as NavigationBar from "expo-navigation-bar";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { supabase } from "../Utils/supabase";

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

      {/* MAIN NAVIGATION */}
      <Stack screenOptions={{ headerShown: false }} />

      {/* LOADING OVERLAY */}
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
