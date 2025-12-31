import { supabase } from "../Utils/supabase";

export const fetchAllAddresses = async (userId: string) => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all addresses:", error);
    throw error;
  }

  return data; // Address[]
};

export const fetchDefaultAddress = async (userId: string) => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("is_default", true)
    .maybeSingle(); // safer than single()

  if (error) {
    console.error("Error fetching default address:", error);
    throw error;
  }

  return data; // Address | null
};
