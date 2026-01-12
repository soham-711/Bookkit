// import React, { createContext, useContext, useState, useCallback } from "react";
// import { LocationCoords } from "../Services/locationService";
// import {
//   fetchBooksNearYou,
//   fetchBooksAroundYou,
//   fetchExploreBooks,
// } from "../Services/dashboardService";

// /* ---------- TYPES ---------- */

// type DashboardData = {
//   nearYou: any[];
//   aroundYou: any[];
//   explore: any[];
// };

// type DashboardContextType = {
//   data: DashboardData | null;
//   loading: boolean;
//   fetchDashboard: (location: LocationCoords) => Promise<void>;
//   clearDashboard: () => void;
//   allBooks: any[]; // ✅ ADD THIS
// };

// const DashboardContext = createContext<DashboardContextType | undefined>(
//   undefined
// );
// const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// /* ---------- PROVIDER ---------- */

// export const DashboardProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(false);
// const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
// const [lastLocationKey, setLastLocationKey] = useState<string | null>(null);
// const getLocationKey = (location: LocationCoords) =>
//   `${location.latitude.toFixed(4)}-${location.longitude.toFixed(4)}`;


// const allBooks = data
//   ? [
//       ...data.nearYou,
//       ...data.aroundYou,
//       ...data.explore,
//     ]
//   : [];


//   const fetchDashboard = useCallback(
//     async (location: LocationCoords) => {

//       const now = Date.now();
//     const locationKey = getLocationKey(location);

//     const isSameLocation = lastLocationKey === locationKey;
//     const isFresh =
//       lastFetchedAt && now - lastFetchedAt < REFRESH_INTERVAL;
//       if (data && isSameLocation && isFresh) {
//           return
//       }; // 🚀 CACHE HIT (VERY IMPORTANT)

//       setLoading(true);
      
//       const [nearYou, aroundYou, explore] = await Promise.all([
//         fetchBooksNearYou(location),
//         fetchBooksAroundYou(location),
//         fetchExploreBooks(location),
//       ]);

//       setData({
//         nearYou,
//         aroundYou,
//         explore,
//       });
//       setLastFetchedAt(now);
//     setLastLocationKey(locationKey);
//       setLoading(false);
//     },
//     [data,lastFetchedAt, lastLocationKey]
//   );

//   const clearDashboard = () => {
//     setData(null);
//   };

//   return (
//     <DashboardContext.Provider
//       value={{
//         data,
//         loading,
//         fetchDashboard,
//         clearDashboard,
//         allBooks, // ✅ EXPOSE
//       }}
//     >
//       {children}
//     </DashboardContext.Provider>
//   );
// };

// /* ---------- HOOK ---------- */

// export const useDashboardStore = () => {
//   const ctx = useContext(DashboardContext);
//   if (!ctx) {
//     throw new Error("useDashboardStore must be used inside DashboardProvider");
//   }
//   return ctx;
// };


import React, { createContext, useContext, useState, useCallback } from "react";
import { LocationCoords } from "../Services/locationService";
import {
  fetchBooksNearYou,
  fetchBooksAroundYou,
  fetchExploreBooks,
} from "../Services/dashboardService";

/* ---------- TYPES ---------- */

type DashboardData = {
  nearYou: any[];
  aroundYou: any[];
  explore: any[];
};

type DashboardContextType = {
  data: DashboardData | null;
  loading: boolean;
  fetchDashboard: (location: LocationCoords) => Promise<void>;
  clearDashboard: () => void;
  allBooks: any[];
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/* ---------- HELPERS ---------- */

// 🔢 ROUND DISTANCE TO 1 DECIMAL
const formatDistance = (distance?: number) => {
  if (distance == null) return "";
  return (Math.round(distance * 10) / 10).toFixed(1);
};


// 🔄 NORMALIZE API RESPONSE
const normalizeBooks = (items: any[]) =>
  items.map((item) => ({
    ...item,
    distance_km: formatDistance(item.distance_km),
  }));

/* ---------- PROVIDER ---------- */

export const DashboardProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [lastLocationKey, setLastLocationKey] = useState<string | null>(null);

  const getLocationKey = (location: LocationCoords) =>
    `${location.latitude.toFixed(4)}-${location.longitude.toFixed(4)}`;

  // ✅ MERGED + ALREADY ROUNDED
  const allBooks = data
    ? [...data.nearYou, ...data.aroundYou, ...data.explore]
    : [];

  const fetchDashboard = useCallback(
    async (location: LocationCoords) => {
      const now = Date.now();
      const locationKey = getLocationKey(location);

      const isSameLocation = lastLocationKey === locationKey;
      const isFresh = lastFetchedAt && now - lastFetchedAt < REFRESH_INTERVAL;

      // 🚀 CACHE HIT
      if (data && isSameLocation && isFresh) {
        return;
      }

      setLoading(true);

      const [nearYou, aroundYou, explore] = await Promise.all([
        fetchBooksNearYou(location),
        fetchBooksAroundYou(location),
        fetchExploreBooks(location),
      ]);

      // ✅ APPLY ROUNDING HERE
      setData({
        nearYou: normalizeBooks(nearYou),
        aroundYou: normalizeBooks(aroundYou),
        explore: normalizeBooks(explore),
      });

      setLastFetchedAt(now);
      setLastLocationKey(locationKey);
      setLoading(false);
    },
    [data, lastFetchedAt, lastLocationKey]
  );

  const clearDashboard = () => {
    setData(null);
  };

  return (
    <DashboardContext.Provider
      value={{
        data,
        loading,
        fetchDashboard,
        clearDashboard,
        allBooks,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

/* ---------- HOOK ---------- */

export const useDashboardStore = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardStore must be used inside DashboardProvider");
  }
  return ctx;
};
