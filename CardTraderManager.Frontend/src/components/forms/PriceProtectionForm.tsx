
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface PriceProtectionFormProps {
  data: any;
  onChange: (data: any) => void;
}

const PriceProtectionForm = ({ data, onChange }: PriceProtectionFormProps) => {
  const handleChange = (field: string, value: any) => {
    const updated = {
      ...data,
      [field]: value
    };
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Protection Settings</CardTitle>
        <CardDescription>Safeguards against suspicious price fluctuations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="usePriceProtection">Use Price Protection</Label>
            <p className="text-sm text-muted-foreground">
              Enable safeguards against suspicious price fluctuations
            </p>
          </div>
          <Switch
            id="usePriceProtection"
            checked={data?.UsePriceProtection || false}
            onCheckedChange={(checked) => handleChange("UsePriceProtection", checked)}
          />
        </div>

        {data?.UsePriceProtection && (
          <>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxPriceDropPercentage">Maximum Price Drop Percentage: {data?.MaxPriceDropPercentage || 0}%</Label>
                  <span className="text-sm text-muted-foreground">{data?.MaxPriceDropPercentage || 0}%</span>
                </div>
                <Slider
                  id="maxPriceDropPercentage"
                  min={0}
                  max={100}
                  step={1}
                  value={[data?.MaxPriceDropPercentage || 0]}
                  onValueChange={(value) => handleChange("MaxPriceDropPercentage", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumMarketListings">Minimum Market Listings</Label>
                <Input
                  id="minimumMarketListings"
                  type="number"
                  value={data?.MinimumMarketListings || 0}
                  onChange={(e) => handleChange("MinimumMarketListings", parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marketAverage">Market Average Method</Label>
                <Select
                  value={data?.MarketAverage || "Median"}
                  onValueChange={(value) => handleChange("MarketAverage", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select calculation method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mean">Mean</SelectItem>
                    <SelectItem value="Median">Median</SelectItem>
                    <SelectItem value="TrimmedMean">Trimmed Mean</SelectItem>
                    <SelectItem value="Percentile">Percentile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="trimPercentage">Trim Percentage: {data?.TrimPercentage || 0}%</Label>
                  <span className="text-sm text-muted-foreground">{data?.TrimPercentage || 0}%</span>
                </div>
                <Slider
                  id="trimPercentage"
                  min={0}
                  max={50}
                  step={1}
                  value={[data?.TrimPercentage || 0]}
                  onValueChange={(value) => handleChange("TrimPercentage", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceDifferenceThreshold">Price Difference Threshold</Label>
                <Input
                  id="priceDifferenceThreshold"
                  type="number"
                  value={data?.PriceDifferenceThreshold || 0}
                  onChange={(e) => handleChange("PriceDifferenceThreshold", parseFloat(e.target.value) || 0)}
                  step={0.1}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceProtectionForm;
