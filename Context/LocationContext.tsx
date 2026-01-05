// // import React, { createContext, useContext, useState } from "react";

// // type LocationCoords = {
// //   latitude: number;
// //   longitude: number;
// // };

// // type LocationContextType = {
// //   location: LocationCoords | null;
// //   setLocation: (loc: LocationCoords) => void;

// //   nearBooks: any[];
// //   setNearBooks: (books: any[]) => void;

// //   lastFetchedAt: number | null;
// // };

// // const LocationContext = createContext<LocationContextType | null>(null);

// // export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
// //   const [location, setLocation] = useState<LocationCoords | null>(null);
// //   const [nearBooks, setNearBooksState] = useState<any[]>([]);
// //   const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

// //   const setNearBooks = (books: any[]) => {
// //     setNearBooksState(books);
// //     setLastFetchedAt(Date.now());
// //   };

// //   return (
// //     <LocationContext.Provider
// //       value={{
// //         location,
// //         setLocation,
// //         nearBooks,
// //         setNearBooks,
// //         lastFetchedAt,
// //       }}
// //     >
// //       {children}
// //     </LocationContext.Provider>
// //   );
// // };

// // export const useLocationStore = () => {
// //   const ctx = useContext(LocationContext);
// //   if (!ctx) {
// //     throw new Error("useLocationStore must be used inside LocationProvider");
// //   }
// //   return ctx;
// // };



// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
// } from "react";

// /* ---------- Types ---------- */

// export type LocationCoords = {
//   latitude: number;
//   longitude: number;
// };

// type LocationContextType = {
//   /* Location */
//   location: LocationCoords | null;
//   setLocation: (loc: LocationCoords | null) => void;
// formattedAddress: string ;
// setFormattedAddress: (address: string) => void;
//   /* Nearby Books */
//   nearBooks: any[];
//   setNearBooks: (books: any[]) => void;
//   clearNearBooks: () => void;

//   /* Cache */
//   lastFetchedAt: number | null;
//   isCacheValid: (ttlMs?: number) => boolean;

//   /* Reset (logout / cancel) */
//   resetLocationStore: () => void;
// };

// /* ---------- Context ---------- */

// const LocationContext = createContext<LocationContextType | undefined>(
//   undefined
// );

// /* ---------- Provider ---------- */

// export const LocationProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const [location, setLocation] = useState<LocationCoords | null>(null);
//   const [formattedAddress, setFormattedAddress] = useState<string>("Fetching location...");
//   const [nearBooks, setNearBooksState] = useState<any[]>([]);
//   const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

//   /* Set books + update cache time */
//   const setNearBooks = useCallback((books: any[]) => {
//     setNearBooksState(books);
//     setLastFetchedAt(Date.now());
//   }, []);

//   /* Clear only books */
//   const clearNearBooks = useCallback(() => {
//     setNearBooksState([]);
//     setLastFetchedAt(null);
//   }, []);

//   /* Cache validation (default 5 min) */
//   const isCacheValid = useCallback(
//     (ttlMs: number = 5 * 60 * 1000) => {
//       if (!lastFetchedAt) return false;
//       return Date.now() - lastFetchedAt < ttlMs;
//     },
//     [lastFetchedAt]
//   );

//   /* Full reset (logout / hard refresh) */
//   const resetLocationStore = useCallback(() => {
//     setLocation(null);
//     setNearBooksState([]);
//     setLastFetchedAt(null);
//   }, []);

//   return (
//     <LocationContext.Provider
//       value={{
//         location,
//         setLocation,
//         formattedAddress,
//         nearBooks,
//         setNearBooks,
//         clearNearBooks,
//         lastFetchedAt,
//         isCacheValid,
//         resetLocationStore,
//         setFormattedAddress
//       }}
//     >
//       {children}
//     </LocationContext.Provider>
//   );
// };

// /* ---------- Hook ---------- */

// export const useLocationStore = () => {
//   const ctx = useContext(LocationContext);
//   if (!ctx) {
//     throw new Error(
//       "useLocationStore must be used inside LocationProvider"
//     );
//   }
//   return ctx;
// };


import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { LocationCoords, UserAddress } from "../Services/locationService";

/* ---------- Types ---------- */

export type LocationSource = "gps" | "manual";

export type LocationContextType = {
  /** Active location used by dashboard */
  location: LocationCoords | null;

  /** Human readable address shown in header */
  formattedAddress: string;

  /** Where the location came from */
  source: LocationSource;

  /** User saved addresses */
  savedAddresses: UserAddress[];

  /** Location ready flag (used for smooth UI, no flicker) */
  isReady: boolean;

  /* ===== Primary API (your design) ===== */
  setGpsLocation: (loc: LocationCoords, address: string) => void;
  selectSavedAddress: (addr: UserAddress) => void;
  setSavedAddresses: (list: UserAddress[]) => void;
  resetLocation: () => void;

  /* ===== Compatibility API (DO NOT REMOVE) ===== */
  LocationFormated: string | null ;
  setLocationFormated:(add:string)=>void;
  setLocationState: (loc: LocationCoords, address: string) => void;
  setAddresses: (list: UserAddress[]) => void;
  isLocationReady: boolean;
  
};

/* ---------- Context ---------- */

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

/* ---------- Provider ---------- */

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [formattedAddress, setFormattedAddress] = useState(
    "Fetching location..."
  );
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [source, setSource] = useState<LocationSource>("gps");
  const [isReady, setIsReady] = useState(false);
   const [LocationFormated, setLocationFormated] = useState('');

  /* ===== Core setters ===== */

  const setGpsLocation = useCallback(
    (loc: LocationCoords, address: string) => {
      setLocation(loc);
      setFormattedAddress(address);
      setSource("gps");
      setIsReady(true);
    },
    []
  );

  const selectSavedAddress = useCallback((addr: UserAddress) => {
    setLocation({
      latitude: addr.latitude,
      longitude: addr.longitude,
    });
    setFormattedAddress(addr.address);
    setSource("manual");
    setIsReady(true);
  }, []);

  const resetLocation = useCallback(() => {
    setLocation(null);
    setFormattedAddress("Fetching location...");
    setSource("gps");
    setIsReady(false);
  }, []);

  /* ===== Compatibility aliases ===== */
  // Used by RootLayout / older code
  const setLocationState = setGpsLocation;
  const setAddresses = setSavedAddresses;

  return (
    <LocationContext.Provider
      value={{
        location,
        formattedAddress,
        source,
        savedAddresses,
        isReady,

        /* primary */
        setGpsLocation,
        selectSavedAddress,
        setSavedAddresses,
        resetLocation,

        /* compatibility */
        LocationFormated,
        setLocationFormated,
        setLocationState,
        setAddresses,
        isLocationReady: isReady,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

/* ---------- Hook ---------- */

export const useLocationStore = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error(
      "useLocationStore must be used inside LocationProvider"
    );
  }
  return ctx;
};
