import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../Utils/supabase";
import { getCurrentUserId } from "../Services/userIdProvider"; // your service

/* ================= TYPES ================= */

export type BookStatus = "approved" | "pending" | "rejected";

export type UploadedBook = {
  id: string;
  title: string;
  authorname: string | null;
  generated_price: number;
  approval_status: BookStatus;
  rejection_reason?: string | null;
  created_at: string;
};

type UploadHistoryContextType = {
  uploads: UploadedBook[];
  loading: boolean;
  error: string | null;
  refetchUploads: () => Promise<void>;
};

/* ================= CONTEXT ================= */

const UploadHistoryContext = createContext<UploadHistoryContextType | undefined>(
  undefined
);

/* ================= PROVIDER ================= */

export const UploadHistoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Prevent duplicate fetch in dev */
  const hasFetched = useRef(false);

  /* ================= FETCH UPLOADS ================= */
  const fetchUploads = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("books")
        .select(`
          id,
          title,
          authorname,
          generated_price,
          approval_status,
          rejection_reason,
          created_at
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUploads(data ?? []);
    } catch (err) {
      console.error("Upload history error:", err);
      setError("Failed to load uploads");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /* ================= FETCH USER ID & UPLOADS ================= */
  useEffect(() => {
    const init = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    init();
  }, []);

  useEffect(() => {
    if (!userId) {
      setUploads([]);
      setLoading(false);
      hasFetched.current = false;
      return;
    }

    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchUploads();
    }
  }, [userId, fetchUploads]);

  return (
    <UploadHistoryContext.Provider
      value={{
        uploads,
        loading,
        error,
        refetchUploads: fetchUploads,
      }}
    >
      {children}
    </UploadHistoryContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useUploadHistory = () => {
  const context = useContext(UploadHistoryContext);
  if (!context) {
    throw new Error(
      "useUploadHistory must be used inside UploadHistoryProvider"
    );
  }
  return context;
};
