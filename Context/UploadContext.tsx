// import React, { createContext, useContext, useReducer } from "react";

// /* ===================== TYPES ===================== */

// export type BookCondition =
//   | "Brand New"
//   | "Like New"
//   | "Very Good"
//   | "Good"
//   | "Fair"
//   | "Poor";

// export interface UploadState {
//   /* -------- Screen 1 (Basic Details) -------- */
//   bookTitle: string;
//   category: string;
//   className: string;
//   subject: string;
//   authorName: string;
//   publisherName: string;
//   edition: string;

//   /* -------- Screen 2 (Condition & Price Input) -------- */
//   bookCondition: BookCondition | "";
//   conditionDescription: string;
//   writingMarking: string;
//   pagesMissing: string;
//   originalPrice: number | null;

//   /* -------- Screen 3 (Images & Location) -------- */
//   images: string[];
//   pickupLocation: string;

//   /* -------- System Generated -------- */
//   generatedPrice: number | null; // AI generated later
// }

// /* ===================== ACTIONS ===================== */

// type UploadAction =
//   | { type: "SET_FIELD"; field: keyof UploadState; value: any }
//   | { type: "ADD_IMAGES"; images: string[] }
//   | { type: "REMOVE_IMAGE"; uri: string }
//   | { type: "RESET_UPLOAD" }
//   | { type: "SET_GENERATED_PRICE"; price: number };

// /* ===================== INITIAL STATE ===================== */

// const initialState: UploadState = {
//   /* Screen 1 */
//   bookTitle: "",
//   category: "",
//   className: "",
//   subject: "",
//   authorName: "",
//   publisherName: "",
//   edition: "",

//   /* Screen 2 */
//   bookCondition: "",
//   conditionDescription: "",
//   writingMarking: "",
//   pagesMissing: "",
//   originalPrice: null,

//   /* Screen 3 */
//   images: [],
//   pickupLocation: "",

//   /* System */
//   generatedPrice: null,
// };

// /* ===================== REDUCER ===================== */

// function uploadReducer(
//   state: UploadState,
//   action: UploadAction
// ): UploadState {
//   switch (action.type) {
//     case "SET_FIELD":
//       return {
//         ...state,
//         [action.field]: action.value,
//       };

//     case "ADD_IMAGES":
//       return {
//         ...state,
//         images: [...state.images, ...action.images].slice(0, 10),
//       };

//     case "REMOVE_IMAGE":
//       return {
//         ...state,
//         images: state.images.filter((img) => img !== action.uri),
//       };

//     case "SET_GENERATED_PRICE":
//       return {
//         ...state,
//         generatedPrice: action.price,
//       };

//     case "RESET_UPLOAD":
//       return initialState;

//     default:
//       return state;
//   }
// }

// /* ===================== CONTEXT ===================== */

// const UploadContext = createContext<{
//   state: UploadState;
//   dispatch: React.Dispatch<UploadAction>;
// } | null>(null);

// /* ===================== PROVIDER ===================== */

// export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [state, dispatch] = useReducer(uploadReducer, initialState);

//   return (
//     <UploadContext.Provider value={{ state, dispatch }}>
//       {children}
//     </UploadContext.Provider>
//   );
// };

// /* ===================== HOOK ===================== */

// export const useUpload = () => {
//   const context = useContext(UploadContext);
//   if (!context) {
//     throw new Error("useUpload must be used within UploadProvider");
//   }
//   return context;
// };



import React, {
  createContext,
  useContext,
  useReducer,
  Dispatch,
} from "react";

/* ===================== TYPES ===================== */

export type BookCondition =
  | "Brand New"
  | "Like New"
  | "Very Good"
  | "Good"
  | "Fair"
  | "Poor";

export interface UploadState {
  /* -------- Screen 1 : Basic Details -------- */
  bookTitle: string;
  category: string;
  className: string;
  subject: string;
  authorName: string;
  publisherName: string;
  edition: string;

  /* -------- Screen 2 : Condition & Pricing -------- */
  bookCondition: BookCondition | "";
  conditionDescription: string;
  writingMarking: string;
  pagesMissing: string;
  originalPrice: number | null;

  /* -------- Screen 3 : Images & Location -------- */
  images: string[]; // local URIs
   // 📍 Pickup Address (VERY IMPORTANT)
  pickupAddressId: string | null; // addresses.id
  pickupAddressText: string; // full_address (display only)
  pickupLatitude: number | null;
  pickupLongitude: number | null;


  /* -------- System Generated -------- */
  generatedPrice: number | null; // AI generated
}

/* ===================== ACTION TYPES ===================== */

type SetFieldAction = {
  type: "SET_FIELD";
  field: keyof UploadState;
  value: UploadState[keyof UploadState];
};

type AddImagesAction = {
  type: "ADD_IMAGES";
  images: string[];
};

type RemoveImageAction = {
  type: "REMOVE_IMAGE";
  uri: string;
};

type SetGeneratedPriceAction = {
  type: "SET_GENERATED_PRICE";
  price: number;
};

type ResetUploadAction = {
  type: "RESET_UPLOAD";
};

export type UploadAction =
  | SetFieldAction
  | AddImagesAction
  | RemoveImageAction
  | SetGeneratedPriceAction
  | ResetUploadAction;

/* ===================== INITIAL STATE ===================== */

const initialState: UploadState = {
  /* Screen 1 */
  bookTitle: "",
  category: "",
  className: "",
  subject: "",
  authorName: "",
  publisherName: "",
  edition: "",

  /* Screen 2 */
  bookCondition: "",
  conditionDescription: "",
  writingMarking: "",
  pagesMissing: "",
  originalPrice: null,

  /* Screen 3 */
  images: [],
   pickupAddressId: null,
  pickupAddressText: "",
  pickupLatitude: null,
  pickupLongitude: null,
  /* System */
  generatedPrice: null,
};

/* ===================== REDUCER ===================== */

function uploadReducer(
  state: UploadState,
  action: UploadAction
): UploadState {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };

    case "ADD_IMAGES":
      return {
        ...state,
        images: [...state.images, ...action.images].slice(0, 10), // max 10
      };

    case "REMOVE_IMAGE":
      return {
        ...state,
        images: state.images.filter((img) => img !== action.uri),
      };

    case "SET_GENERATED_PRICE":
      return {
        ...state,
        generatedPrice: action.price,
      };

    case "RESET_UPLOAD":
      return initialState;

    default:
      return state;
  }
}

/* ===================== CONTEXT ===================== */

interface UploadContextType {
  state: UploadState;
  dispatch: Dispatch<UploadAction>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(uploadReducer, initialState);

  return (
    <UploadContext.Provider value={{ state, dispatch }}>
      {children}
    </UploadContext.Provider>
  );
};

/* ===================== HOOK ===================== */

export const useUpload = (): UploadContextType => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within UploadProvider");
  }
  return context;
};
