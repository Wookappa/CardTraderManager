
export interface PriceChangeDetail {
  itemId: number;
  cardName: string;
  minPrice: number;
  maxPrice: number;
  median: number;
  oldPrice: number;
  newPrice: number;
  priceChange?: number;
  updated: boolean;
  warning?: string;
}

export interface PriceAnalysisResult {
  priceChanges: PriceChangeDetail[];
  isSuccess: boolean;
  errorMessage?: string | null;
  elapsedTime: string; // TimeSpan format as string
  analysisDate: string;
}

export interface StartPriceUpdateRequest {
  ApplicationSettings: any;
}
