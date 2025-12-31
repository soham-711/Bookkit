
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kahmgdkgrkdxvvvlfswt.supabase.co";
const supabasePublishableKey = "sb_publishable_TK7N9PvzqKnzRNy4B6o8VA_l9uV5q-y";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
