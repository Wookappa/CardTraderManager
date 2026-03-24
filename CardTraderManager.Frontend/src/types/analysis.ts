
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
  elapsedTime: string;
  analysisDate: string;
}

export interface CardTraderSettings {
  JWTToken: string;
}

export interface ApiSettings {
  CardTrader: CardTraderSettings;
}

export interface PriceProtectionSettings {
  UsePriceProtection: boolean;
  MaxPriceDropPercentage: number;
  MinimumMarketListings: number;
  MarketAverage: string;
  TrimPercentage: number;
  PriceDifferenceThreshold: number;
}

export interface StrategyConfig {
  MarketAverage: string;
  TrimFraction: number;
  LowestPriceIndex?: number;
  PercentageAdjustment?: number;
  FixedAdjustment?: number;
}

export interface CustomRule extends StrategyConfig {
  Condition?: string;
  ItemName?: string;
  MinPriceRange?: number;
  MaxPriceRange?: number;
  MinAllowedPrice?: number;
  PriceAdjustmentType: string;
}

export interface UpdateStrategiesConfig {
  DescriptionToSkip: string;
  AlwaysBelowCardTraderZero: boolean;
  UseCustomRules: boolean;
  PriceAdjustmentStrategy: string;
  PriceAdjustmentType: string;
  MarketAverage?: string;
  CustomRules: CustomRule[];
  Strategies: Record<string, StrategyConfig>;
}

export interface ApplicationSettings {
  ApiSettings: ApiSettings;
  PriceProtectionSettings: PriceProtectionSettings;
  UpdateStrategiesConfig: UpdateStrategiesConfig;
}

export interface StartPriceUpdateRequest {
  ApplicationSettings: ApplicationSettings;
}
