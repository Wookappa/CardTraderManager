
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GeneralSettingsTabProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

const GeneralSettingsTab = ({ data, onChange }: GeneralSettingsTabProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="descriptionToSkip">Description Text to Skip</Label>
        <Input
          id="descriptionToSkip"
          value={data?.DescriptionToSkip || ""}
          onChange={(e) => onChange("DescriptionToSkip", e.target.value)}
          placeholder="Enter text pattern to skip"
        />
        <p className="text-xs text-muted-foreground">
          Items with descriptions containing this text will be skipped during updates
        </p>
      </div>
      
      <div className="flex items-center justify-between py-2">
        <div>
          <Label htmlFor="alwaysBelowCardTraderZero">Always Below CardTrader Zero</Label>
          <p className="text-xs text-muted-foreground">
            Always price below CardTraderZero products
          </p>
        </div>
        <Switch
          id="alwaysBelowCardTraderZero"
          checked={data?.AlwaysBelowCardTraderZero || false}
          onCheckedChange={(checked) => onChange("AlwaysBelowCardTraderZero", checked)}
        />
      </div>
      
      <div className="flex items-center justify-between py-2">
        <div>
          <Label htmlFor="useCustomRules">Use Custom Rules</Label>
          <p className="text-xs text-muted-foreground">
            Enable custom pricing rules
          </p>
        </div>
        <Switch
          id="useCustomRules"
          checked={data?.UseCustomRules || false}
          onCheckedChange={(checked) => onChange("UseCustomRules", checked)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="priceAdjustmentStrategy">Price Adjustment Strategy</Label>
        <Select
          value={data?.PriceAdjustmentStrategy || "Moderate"}
          onValueChange={(value) => onChange("PriceAdjustmentStrategy", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Aggressive">Aggressive</SelectItem>
            <SelectItem value="Moderate">Moderate</SelectItem>
            <SelectItem value="Conservative">Conservative</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="priceAdjustmentType">Price Adjustment Type</Label>
        <Select
          value={data?.PriceAdjustmentType || "LowestPriceIndex"}
          onValueChange={(value) => onChange("PriceAdjustmentType", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select adjustment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LowestPriceIndex">Lowest Price Index</SelectItem>
            <SelectItem value="FixedPrice">Fixed Price</SelectItem>
            <SelectItem value="Percentage">Percentage</SelectItem>
            <SelectItem value="FixedAdjustment">Fixed Adjustment</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {data?.PriceAdjustmentType !== "LowestPriceIndex" && 
       data?.PriceAdjustmentType !== "FixedPrice" && (
        <div className="space-y-2">
          <Label htmlFor="marketAverage">Market Average</Label>
          <Select
            value={data?.MarketAverage || "Median"}
            onValueChange={(value) => onChange("MarketAverage", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select average method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mean">Mean</SelectItem>
              <SelectItem value="Median">Median</SelectItem>
              <SelectItem value="TrimmedMean">Trimmed Mean</SelectItem>
              <SelectItem value="Percentile">Percentile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};

export default GeneralSettingsTab;
