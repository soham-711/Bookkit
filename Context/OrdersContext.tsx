import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../Utils/supabase";

/* ---------------- TYPES ---------------- */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export interface Order {
  id: string;

  book_id: string;
  book_title: string;
  book_image: string | null;
  book_price: number;

  buyer_id: string;
  seller_id: string;

  buyer_address: string;
  buyer_lat: number;
  buyer_lng: number;

  seller_address: string;
  seller_lat: number;
  seller_lng: number;

  distance_km: number;

  status: OrderStatus;

  /* OTP */
  delivery_otp: number | null;
  

  /* Meta */
  created_at: string;
}

/* ---------------- CONTEXT TYPE ---------------- */

interface OrdersContextType {
  buyerOrders: Order[];
  sellerDeliverables: Order[];
  loading: boolean;

  refreshOrders: () => Promise<void>;
  acceptOrder: (orderId: string, otpHash: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  completeOrder: (orderId: string) => Promise<void>;
}

/* ---------------- CONTEXT ---------------- */

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within OrdersProvider");
  }
  return context;
};

/* ---------------- PROVIDER ---------------- */

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerDeliverables, setSellerDeliverables] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------- GET LOGGED IN USER -------- */

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  /* -------- FETCH ORDERS -------- */

  const refreshOrders = async () => {
    setLoading(true);

    const user = await getCurrentUser();

    if (!user) {
      setBuyerOrders([]);
      setSellerDeliverables([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch orders:", error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setLoading(false);
      return;
    }

    setBuyerOrders(data.filter(o => o.buyer_id === user.id));
    setSellerDeliverables(data.filter(o => o.seller_id === user.id));

    setLoading(false);
  };

  /* -------- SELLER ACCEPT ORDER -------- */

//   const acceptOrder = async (orderId: string, otpHash: string) => {
//     const { error } = await supabase
//       .from("orders")
//       .update({
//         status: "confirmed",
//         delivery_otp: otpHash,
//         seller_response_at: new Date().toISOString(),
//       })
//       .eq("id", orderId);

//     if (error) {
//       console.error("Accept order failed:", error.message);
//       return;
//     }

//     await refreshOrders();
//   };


const acceptOrder = async (orderId: string, otpHash: string) => {
  try {
    // 1️⃣ Get the order to know which book it belongs to
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("id, book_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !orderData) {
      console.error("Order fetch failed:", fetchError?.message);
      return;
    }

    const bookId = orderData.book_id;

    // 2️⃣ Update order status and delivery OTP
    const { error: orderError } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        delivery_otp: otpHash,
        seller_response_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (orderError) {
      console.error("Accept order failed:", orderError.message);
      return;
    }
console.log("Book ID to update:", bookId);

    // 3️⃣ Mark the book as inactive
    const { error: bookError } = await supabase
      .from("books")
      .update({
        is_active: false,
      })
      .eq("id", bookId);

    if (bookError) {
      console.error("Failed to deactivate book:", bookError.message);
      return;
    }

    // 4️⃣ Refresh orders
    await refreshOrders();

  } catch (err) {
    console.error("Unexpected error in acceptOrder:", err);
  }
};



  /* -------- SELLER CANCEL ORDER -------- */

  const cancelOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        seller_response_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Cancel order failed:", error.message);
      return;
    }

    await refreshOrders();
  };

  /* -------- COMPLETE DELIVERY -------- */

  const completeOrder = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({
        status: "completed",
        delivered_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      console.error("Complete order failed:", error.message);
      return;
    }

    await refreshOrders();
  };

  /* -------- INITIAL LOAD -------- */

  useEffect(() => {
    refreshOrders();
  }, []);

  /* -------- PROVIDER -------- */

  return (
    <OrdersContext.Provider
      value={{
        buyerOrders,
        sellerDeliverables,
        loading,
        refreshOrders,
        acceptOrder,
        cancelOrder,
        completeOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};
