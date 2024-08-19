declare const lat_lons: {
  [latCommaLng: string]: {
    /** unknown date count */
    '': number;
    /** per-year count */
    [year: string]: number;
  };
};

/** Last-updated dates for static JSON files */
declare const timestamps: {
  ocr_ms: number;
  ocr_time: string;
  rotation_time: string;
  timestamp: string;
};
