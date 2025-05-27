import { useState } from "react";
import FileUploadSection from "@/components/FileUploadSection";
import JsonEditor from "@/components/JsonEditor";

const defaultSettings = {
  ApiSettings: {
    CardTrader: {
      JWTToken: ""
    }
  },
  PriceProtectionSettings: {
    UsePriceProtection: true,
    MaxPriceDropPercentage: 30,
    MinimumMarketListings: 3,
    MarketAverage: "Mean",
    TrimPercentage: 20,
    PriceDifferenceThreshold: 1
  },
  UpdateStrategiesConfig: {
    DescriptionToSkip: "*",
    AlwaysBelowCardTraderZero: false,
    UseCustomRules: true,
    PriceAdjustmentStrategy: "Moderate",
    PriceAdjustmentType: "LowestPriceIndex",
    MarketAverage: "TrimmedMean",
    CustomRules: [
      {
        MinPriceRange: 0,
        MaxPriceRange: 10,
        PriceAdjustmentType: "LowestPriceIndex",
        LowestPriceIndex: 0,
        MinAllowedPrice: 0.1
      }
    ],
    Strategies: {
      Aggressive: {
        TrimFraction: 0.05,
        LowestPriceIndex: 1,
        MarketAverage: "Median",
        PercentageAdjustment: -0.1,
        FixedAdjustment: 0
      },
      Moderate: {
        TrimFraction: 0.1,
        LowestPriceIndex: 5,
        MarketAverage: "Median",
        PercentageAdjustment: 0,
        FixedAdjustment: 0
      },
      Conservative: {
        TrimFraction: 0.2,
        MarketAverage: "Median",
        PercentageAdjustment: 0,
        FixedAdjustment: -0.5
      }
    }
  }
};

const Index = () => {
  const [editorActive, setEditorActive] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  const handleJsonLoaded = (jsonData: any) => {
    // Check if the JSON has ApplicationSettings as root
    if (jsonData.ApplicationSettings) {
      setSettings(jsonData.ApplicationSettings);
    } else {
      // Otherwise use the JSON as is (for backward compatibility)
      setSettings(jsonData);
    }
    setEditorActive(true);
  };

  const handleCreateNew = () => {
    setSettings(defaultSettings);
    setEditorActive(true);
  };

  const handleBackToMain = () => {
    setEditorActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {!editorActive ? (
        <FileUploadSection onJsonLoaded={handleJsonLoaded} onCreateNew={handleCreateNew} />
      ) : (
        <JsonEditor initialData={settings} onBack={handleBackToMain} />
      )}
    </div>
  );
};

export default Index;
