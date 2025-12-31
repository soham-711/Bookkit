/* ===================== TYPES ===================== */

export type BookCondition =
  | "Brand New"
  | "Like New"
  | "Very Good"
  | "Good"
  | "Fair"
  | "Poor";

export type WritingMarking =
  | "None"
  | "Light Writing"
  | "Highlighted Text"
  | "Heavy Writing";

export type PagesMissing =
  | "None"
  | "Few"
  | "Many";

export interface PriceInput {
  originalPrice: number;
  bookCondition: BookCondition;
  writingOption: string; // RAW UI value
  pagesOption: string;  // RAW UI value
  subject: string;
}

/* ===================== MULTIPLIERS ===================== */

const conditionMultiplier: Record<BookCondition, number> = {
  "Brand New": 1.0,
  "Like New": 0.9,
  "Very Good": 0.85,
  Good: 0.8,
  Fair: 0.65,
  Poor: 0.45,
};

const writingMultiplier: Record<WritingMarking, number> = {
  None: 1,
  "Light Writing": 0.9,
  "Highlighted Text": 0.8,
  "Heavy Writing": 0.65,
};

const pagesMultiplier: Record<PagesMissing, number> = {
  None: 1,
  Few: 0.85,
  Many: 0.6,
};

/* ===================== NORMALIZERS ===================== */

const normalizeWriting = (value: string): WritingMarking => {
  if (value.includes("Minimal")) return "Light Writing";
  if (value.includes("Moderate")) return "Heavy Writing";
  if (value.includes("Heavy")) return "Heavy Writing";
  if (value.includes("Highlighted")) return "Highlighted Text";
  return "None";
};

const normalizePages = (value: string): PagesMissing => {
  if (value.includes("Few")) return "Few";
  if (value.includes("Some")) return "Few";
  if (value.includes("Many")) return "Many";
  if (value.includes("Cover")) return "Many";
  return "None";
};

/* ===================== PRICE ENGINE ===================== */

export const generateBookPrice = (input: PriceInput): number => {
  const {
    originalPrice,
    bookCondition,
    writingOption,
    pagesOption,
    subject,
  } = input;

  const writingMarking = normalizeWriting(writingOption);
  const pagesMissing = normalizePages(pagesOption);

  /* -------- Base price (35% of MRP) -------- */
  let price = originalPrice * 0.35;

  /* -------- Apply multipliers -------- */
  price *= conditionMultiplier[bookCondition];
  price *= writingMultiplier[writingMarking];
  price *= pagesMultiplier[pagesMissing];

  /* -------- Subject demand boost -------- */
  const highDemandSubjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Science",
  ];

  if (highDemandSubjects.includes(subject)) {
    price *= 1.1;
  }

  /* -------- Safety limits -------- */
  const MIN_PRICE = 30;
  const MAX_PRICE = originalPrice * 0.6;

  price = Math.max(MIN_PRICE, Math.min(price, MAX_PRICE));

  return Math.round(price);
};
