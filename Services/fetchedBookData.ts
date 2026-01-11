import { supabase } from "../Utils/supabase";

export const getBookById = async (bookId: string) => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .single();

  if (error) throw error;
  return data;
};
