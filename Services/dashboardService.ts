import { supabase } from "../Utils/supabase";
import { LocationCoords } from "./locationService";

/* ---------- BASE FUNCTION ---------- */
export async function fetchBooksByDistance(
  location: LocationCoords,
  minKm: number,
  maxKm: number,
  limit?: number
) {
  const { data, error } = await supabase.rpc("get_books_by_distance", {
    user_lat: location.latitude,
    user_lng: location.longitude,
    min_km: minKm,
    max_km: maxKm,
    limit_count: limit,
  });

  if (error) {
    console.log("❌ fetchBooksByDistance", error);
    return [];
  }

  return data ?? [];
}

/* ---------- DASHBOARD SECTIONS ---------- */

// 📍 0–5 km
export const fetchBooksNearYou = (location: LocationCoords) =>
  fetchBooksByDistance(location, 0, 5, 6);

// 📍 6–10 km
export const fetchBooksAroundYou = (location: LocationCoords) =>
  fetchBooksByDistance(location, 6, 10, 6);

// 📍 11–30 km
export const fetchExploreBooks = (location: LocationCoords) =>
  fetchBooksByDistance(location, 11, 30);
