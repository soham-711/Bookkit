// import { supabase } from "../Utils/supabase";

// export const fetchAllAddresses = async (userId: string) => {
//   const { data, error } = await supabase
//     .from("addresses")
//     .select("*")
//     .eq("user_id", userId)
//     .order("created_at", { ascending: false });

//   if (error) {
//     console.error("Error fetching all addresses:", error);
//     throw error;
//   }

//   return data; // Address[]
// };

// export const fetchDefaultAddress = async (userId: string) => {
//   const { data, error } = await supabase
//     .from("addresses")
//     .select("*")
//     .eq("user_id", userId)
//     .eq("is_default", true)
//     .maybeSingle(); // safer than single()

//   if (error) {
//     console.error("Error fetching default address:", error);
//     throw error;
//   }

//   return data; // Address | null
// };



import * as Location from "expo-location";
import { supabase } from "../Utils/supabase";
import { getCurrentUserId } from "./userIdProvider";

/* ---------- TYPES (SINGLE SOURCE OF TRUTH) ---------- */

export type LocationCoords = {
  latitude: number;
  longitude: number;
};

export type AddressLabel = "Home" | "Work" | "Other";

export type UserAddress = {
  id: string;
  label: AddressLabel;
  address: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
};

/* ---------- GPS LOCATION ---------- */

export async function getCurrentLocation(): Promise<LocationCoords | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return null;

  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  };
}

/* ---------- REVERSE GEOCODE ---------- */

export async function reverseGeocode(
  coords: LocationCoords
): Promise<string> {
  const res = await Location.reverseGeocodeAsync(coords);

  if (!res.length) return "Unknown location";

  const a = res[0];

  return [
    a.name,
    a.street,
    a.city || a.district,
    a.region,
  ]
    .filter(Boolean)
    .join(", ");
}

/* ---------- USER SAVED ADDRESSES ---------- */

export async function fetchUserAddresses(): Promise<UserAddress[]> {
  const uid = await getCurrentUserId();
  if (!uid) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select(
      `
      id,
      address_type,
      full_address,
      latitude,
      longitude,
      is_default
    `
    )
    .eq("user_id", uid)
    .order("created_at", { ascending: true });

  if (error) {
    console.log("❌ fetchUserAddresses error:", error);
    return [];
  }

  return (
    data?.map((item) => ({
      id: item.id,
      label: item.address_type as AddressLabel,
      address: item.full_address,
      latitude: item.latitude,
      longitude: item.longitude,
      is_default: item.is_default,
    })) ?? []
  );
}

/* ---------- DEFAULT ADDRESS HELPER ---------- */

export function getDefaultAddress(
  addresses: UserAddress[]
): UserAddress | null {
  if (!addresses.length) return null;

  return addresses.find((a) => a.is_default) ?? addresses[0];
}
