
# CardTraderPriceUpdateService

## Overview
CardTraderPriceUpdateService is responsible for updating card prices on CardTrader based on current market data and user-defined strategies. It supports rule-based logic and customizable configuration to fine-tune pricing behavior.

The service can be executed as a Console Application or as an Azure Function.

## Features
-   Automatically updates card prices based on strategies and rules.
    
-   Fully configurable via `appsettings.json`.
    
-   Modular structure with services such as:
    
    -   `MarketDataService`: collects market prices.
        
    -   `PriceAnalysisService`: determines pricing decisions.
        
    -   `PriceCalculationService`: applies business rules.
        
    -   `CardPriceUpdateService`: coordinates updates.
        
-   Custom rules and pricing strategies supported.
    
-   Deployed as either a console app or Azure Function.

---

## WebApp
🚀 This guide explains how to deploy and run the application using Docker.  

## **Prerequisites**  
Before starting, ensure you have:  
✔ **Docker** installed ([Download Docker](https://www.docker.com/get-started))  
✔ **Docker Compose** (if using `docker-compose.yml`)  
✔ Basic terminal/command-line knowledge  

---

### **Quick Start**  

#### **1. Clone the Repository**  
```bash
git clone https://github.com/your-repo/your-app.git
cd your-app
```

#### **2. Start the Services**  
```bash
docker-compose up -d
```

#### **3. Access the Application**  
Open your browser and go to:  
🌐 [http://localhost:8080](http://localhost:8080)  

---

![ApiSettings](https://github.com/user-attachments/assets/9869e801-59b5-463a-90f4-70c7f9e3a40b)
---
![PriceAnalysisUpdated](https://github.com/user-attachments/assets/b592f126-1483-4d25-bab4-d94a900894aa)

---
## Getting Started for Devs

### Prerequisites

-   **.NET 8.0 SDK**
    
-   **Visual Studio 2022** or later


### Running the Console Application

1.  Clone the repository.
    
2.  Open the solution in Visual Studio.
    
3.  Restore NuGet packages.
    
4.  Build the solution.
    
5.  Set `CardTraderManager.Console` as startup project.
    
6.  Run the application.
    

### Deploying to Azure Functions

1.  Clone the repository.
    
2.  Open the solution in Visual Studio.
    
3.  Build the solution.
    
4.  Publish the `CardTraderManager.Functions` project to Azure.

---

## Configuration

### Setting Up Strategies and Custom Rules
The application uses strategies and custom rules defined in the `appsettings.json` file. Below is an example configuration:

```json
{
	"ApplicationSettings": {
		"ApiSettings": {
			"CardTrader": {
				"JWTToken": "eyXXXXXXXXXXXXX"
			}
		},
		"PriceProtectionSettings": {
			"UsePriceProtection": true,
			"MaxPriceDropPercentage": 30,
			"MinimumMarketListings": 3,
			"MarketAverage": "Mean",
			"TrimPercentage": 20,
			"PriceDifferenceThreshold": 1
		},
		"UpdateStrategies": {
			"DescriptionToSkip": "*",
			"AlwaysBelowCardTraderZero": false,
			"UseCustomRules": true,
			"PriceAdjustmentStrategy": "Moderate",
			"PriceAdjustmentType": "LowestPriceIndex",
			"CustomRules": [
				{
					"ItemName": "Black Lotus",
					"Condition": "Near Mint",
					"PriceAdjustmentType": "FixedPrice",
					"PriceFixed": 1000000.1
				},
				{
					"ItemName": "Black Lotus",
					"Condition": "Near Mint",
					"PriceAdjustmentType": "FixedAdjustment",
					"MarketAverage": "Mean",
					"FixedAdjustment": 10
				},
				{
					"MinPriceRange": 50,
					"MaxPriceRange": 5000,
					"PriceAdjustmentType": "Percentage",
					"PercentageAdjustment": -0.1,
					"MinAllowedPrice": 50,
					"MarketAverage": "TrimmedMean",
					"TrimFraction": 10
				},
				{
					"MinPriceRange": 50,
					"MaxPriceRange": 5000,
					"PriceAdjustmentType": "Percentage",
					"PercentageAdjustment": -0.1,
					"LowestPriceIndex": 2,
					"MinAllowedPrice": 50,
					"MarketAverage": "Median"
				},
				{
					"MinPriceRange": 0,
					"MaxPriceRange": 10,
					"PriceAdjustmentType": "LowestPriceIndex",
					"LowestPriceIndex": 0,
					"MinAllowedPrice": 0.1
				},
				{
					"MinPriceRange": 10,
					"MaxPriceRange": 50,
					"PriceAdjustmentType": "LowestPriceIndex",
					"LowestPriceIndex": 1,
					"MinAllowedPrice": 10
				}
			],
			"Strategies": {
				"Aggressive": {
					"TrimFraction": 0.05,
					"LowestPriceIndex": 1,
					"MarketAverage": "Median",
					"PercentageAdjustment": -0.1,
					"FixedAdjustment": 0
				},
				"Moderate": {
					"TrimFraction": 0.1,
					"LowestPriceIndex": 5,
					"MarketAverage": "Median",
					"PercentageAdjustment": 0,
					"FixedAdjustment": 0
				},
				"Conservative": {
					"TrimFraction": 0.2,
					"MarketAverage": "Median",
					"PercentageAdjustment": 0,
					"FixedAdjustment": -0.5
				}
			}
		}
	}
}
```

---

# Price Protection Settings

Configures safeguards against suspicious price fluctuations.

## Settings Overview

| Setting                      | Description |
|------------------------------|-------------|
| `UsePriceProtection`         | Enables/disables price protection logic |
| `MaxPriceDropPercentage`     | Maximum allowed price drop (%) relative to market mean/median |
| `MinimumMarketListings`      | Minimum required active listings to calculate reliable market price |
| `MarketAverage`             | Market price calculation method: `Median`, `TrimmedMean`, or `Percentile` (default: `Median`). |
| `TrimPercentage`             | When using median, specifies percentage of outliers to exclude |
| `PriceDifferenceThreshold`   | Safety buffer to prevent overly aggressive price updates |

## Example Configuration

```json
{
  "UsePriceProtection": true,
  "MaxPriceDropPercentage": 30,
  "MinimumMarketListings": 3,
  "MarketAverage": "Median",
  "TrimPercentage": 20,
  "PriceDifferenceThreshold": 1
}
```

## Workflow Example

- **Proposed Price (My Item):** $10
- **Market Listings:** 10
- **Average of 3 Cheapest Listings:** $15

### Step 1: Calculate Minimum Allowed Price

$$
\text{MinAllowedPrice} = \text{MarketAverage} \times \left(1 - \frac{\text{MaxPriceDropPercentage}}{100}\right) = 15 \times 0.70 = \$10.50
$$

Or in plain text:
```
MinAllowedPrice = MarketAverage × (1 - MaxPriceDropPercentage/100)
               = 15 × (1 - 0.30) 
               = $10.50
```

### Step 2: Evaluate Price Protection

```
ProposedPrice + Threshold = $10 + $1 = $11
Comparison: $11 > $10.50 → Protection NOT triggered
```

**Outcome:** Price update is allowed (within safe thresholds).

## Key Notes

- When `MarketAverage=TrimmedMean`, extreme values are trimmed based on `TrimPercentage`
- Protection is disabled if active listings < `MinimumMarketListings`
- All monetary values should use consistent currency units (USD, EUR, etc.)


# Update Strategies Configuration

## UpdateStrategies Settings

| Setting                     | Description |
|-----------------------------|-------------|
| `DescriptionToSkip`         | Character or string to match in item descriptions to skip processing (best used with special characters to mark items that should remain unchanged). |
| `UseCardTraderZero`         | When enabled, disables filtering for products sold with CardTraderZero. When disabled, item price cannot exceed the minimum CardTraderZero price. |
| `UseCustomRules`            | Enables/disables custom pricing rules. |
| `PriceAdjustmentStrategy`   | The strategy to use for price adjustments (default: "Moderate"). |
| `PriceAdjustmentType`       | Adjustment method: `LowestPriceIndex`, `FixedPrice`, `Percentage`, or `FixedAdjustment` (default: `Percentage`). |
| `MarketAverage`             | Market price calculation method: `Median`, `TrimmedMean`, or `Percentile` (default: `Median`). |

## Price Adjustment Strategies

| Setting                  | Description |
|--------------------------|-------------|
| `MarketAverage`          | Market price calculation method (same options as above). |
| `TrimFraction`           | Fraction to trim (only used with `Percentile` and `TrimmedMean` methods). |
| `LowestPriceIndex`       | Index of price to use (0 = cheapest). |
| `PercentageAdjustment`   | Percentage adjustment compared to market average/index. |
| `FixedAdjustment`        | Fixed price adjustment amount. |

## Custom Rules Configuration

| Setting                  | Description |
|--------------------------|-------------|
| `Condition`              | Item condition (Near Mint, Played, etc.). |
| `ItemName`               | Name of the specific item. |
| `MinPriceRange`          | Minimum price filter threshold. |
| `MaxPriceRange`          | Maximum price filter threshold. |
| `PercentageAdjustment`   | Percentage adjustment compared to market average/index. |
| `MinAllowedPrice`        | Absolute minimum price allowed. |
| `PriceAdjustmentType`    | Price adjustment method (same options as above). |
| `MarketAverage`          | Market price calculation method (same options as above). |
| `FixedAdjustment`        | Fixed price adjustment amount. |
| `TrimFraction`           | Fraction to trim (same as above). |
| `LowestPriceIndex`       | Index of price to use (same as above). |

---

## Common Custom Rules

### 1. Fix Listing Position for Low-Value Items
**Purpose**: Position items priced $0-$10 at the second cheapest market price with a 10% discount, while ensuring a minimum price floor.

**Configuration**:
```json
{
  "MinPriceRange": 0,
  "MaxPriceRange": 10,
  "PriceAdjustmentType": "LowestPriceIndex",
  "LowestPriceIndex": 1,
  "MinAllowedPrice": 0.1,
  "MarketAverage": "Median"
}
```

**Behavior**:
- Targets items priced between $0 and $10
- Uses the 2nd cheapest market price (index 1)
- Ensures price never falls below $0.10
- Uses median market price as reference

---

### 2. Discount High-Value Items
**Purpose**: Apply a conservative 10% discount to premium items ($50-$200) based on median market price.

**Configuration**:
```json
{
  "MinPriceRange": 50,
  "MaxPriceRange": 200,
  "PriceAdjustmentType": "Percentage",
  "AdjustmentPercentage": -0.10,
  "MinAllowedPrice": 50,
  "MarketAverage": "Median"
}
```

**Behavior**:
- Affects items in $50-$200 range
- Applies flat 10% reduction from median price
- Maintains $50 minimum price floor
- Uses median (not average) to ignore outliers

---

### 3. Competitive Pricing for Mid-Range Items (Bonus Example)
**Purpose**: Price items $10-$50 at 5% below the trimmed mean (excluding top/bottom 10%).

**Configuration**:
```json
{
  "MinPriceRange": 10,
  "MaxPriceRange": 50,
  "PriceAdjustmentType": "Percentage",
  "AdjustmentPercentage": -0.05,
  "MarketAverage": "TrimmedMean",
  "TrimFraction": 0.10,
  "MinAllowedPrice": 5
}
```

---
## Market Average

| **Type**       | **Robustness to Outliers** | **Uses All Data?** | **Typical Use Case** |
|---------------|---------------------------|--------------------|----------------------|
| Mean          | ❌ No (highly sensitive)   | ✅ Yes              | Symmetric, outlier-free data |
| Median        | ✅ Yes (robust)            | ❌ No (only middle value) | Skewed data or datasets with outliers |
| Trimmed Mean  | ⚠️ Partial (depends on %)  | ❌ No (trims extremes) | Compromise between mean and median |
| Percentile    | ✅ Varies (e.g., median is robust) | ❌ No (position measure) | Analyzing data spread/distribution |

### When to Use Which?  
- **Mean**: Best for symmetric, clean data without extreme values.  
- **Median**: Preferred for skewed distributions or when outliers are present.  
- **Trimmed Mean**: Useful when you want robustness but don’t want to discard too much data.  
- **Percentile**: Used to understand spread (e.g., IQR = 75th - 25th percentile) or tail behavior.  

---

## Key to Adjustment Types
| Type                 | Behavior                          | Best For                  |
|----------------------|-----------------------------------|---------------------------|
| `LowestPriceIndex`   | Uses nth cheapest listing        | Becoming competitive      |
| `Percentage`         | % change from reference price    | Market-adjusted pricing   |
| `FixedAdjustment`    | Absolute value change            | Precise corrections       |
| `FixedPrice`         | Set exact price                  | Rare/unique items         |

**Pro Tip**: Combine multiple rules with different price ranges for granular control:
1. $0-$10 → Aggressive positioning
2. $10-$50 → Balanced competitiveness 
3. $50+ → Conservative adjustments


These custom rules can be configured in the `appsettings.json` file, allowing for flexible and tailored price updates based on specific conditions.

---

## License
This project is licensed under the MIT License.
