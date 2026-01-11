import { supabase } from "../Utils/supabase";

/**
 * Returns current authenticated user's UID
 * @returns string | null
 */
export const getCurrentUserId = async (): Promise<any | null> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
};
