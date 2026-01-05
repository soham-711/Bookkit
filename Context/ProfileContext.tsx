import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../Utils/supabase";

type ProfileContextType = {
  profileImage: string | null;
  isProfileLoaded: boolean;
  refreshProfileSilently: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  /* 🔹 Load profile ONCE */
  const loadProfile = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();
      
       
        
      if (data?.avatar_url) {
        setProfileImage(data.avatar_url);
        
      }
    } catch (err) {
      console.log("Profile load failed", err);
    } finally {
      setIsProfileLoaded(true);
    }
  }, []);

  /* 🔹 Silent refresh (no UI reset) */
  const refreshProfileSilently = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();
      console.log(data);
      
      if (data?.avatar_url && data.avatar_url !== profileImage) {
        setProfileImage(data.avatar_url);
      }
    } catch (err) {
      console.log("Silent refresh failed", err);
    }
  }, [profileImage]);

  /* 🔹 Run once when app loads */
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profileImage,
        isProfileLoaded,
        refreshProfileSilently,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileStore = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error(
      "useProfileStore must be used inside ProfileProvider"
    );
  }
  return ctx;
};
