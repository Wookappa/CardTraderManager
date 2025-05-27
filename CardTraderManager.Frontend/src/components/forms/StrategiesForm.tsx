
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StrategiesFormProps {
  strategies: any;
  onChange: (strategies: any) => void;
}

const StrategiesForm = ({ strategies, onChange }: StrategiesFormProps) => {
  const updateStrategy = (strategyName: string, field: string, value: any) => {
    const updatedStrategy = {
      ...strategies[strategyName],
      [field]: value
    };
    
    onChange({
      ...strategies,
      [strategyName]: updatedStrategy
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configure predefined strategies for price adjustments
      </p>
      
      <Tabs defaultValue="aggressive">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="aggressive">Aggressive</TabsTrigger>
          <TabsTrigger value="moderate">Moderate</TabsTrigger>
          <TabsTrigger value="conservative">Conservative</TabsTrigger>
        </TabsList>
        
        <TabsContent value="aggressive" className="pt-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Market Average</Label>
                  <Select
                    value={strategies?.Aggressive?.MarketAverage || "Mean"}
                    onValueChange={(value) => updateStrategy("Aggressive", "MarketAverage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Trim Fraction</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Aggressive?.TrimFraction || 0} 
                    onChange={(e) => updateStrategy("Aggressive", "TrimFraction", parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Lowest Price Index</Label>
                  <Input 
                    type="number"
                    value={strategies?.Aggressive?.LowestPriceIndex || 0}
                    onChange={(e) => updateStrategy("Aggressive", "LowestPriceIndex", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Percentage Adjustment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Aggressive?.PercentageAdjustment || 0} 
                    onChange={(e) => updateStrategy("Aggressive", "PercentageAdjustment", parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Fixed Adjustment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Aggressive?.FixedAdjustment || 0} 
                    onChange={(e) => updateStrategy("Aggressive", "FixedAdjustment", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="moderate" className="pt-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Market Average</Label>
                  <Select
                    value={strategies?.Moderate?.MarketAverage || "Mean"}
                    onValueChange={(value) => updateStrategy("Moderate", "MarketAverage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Trim Fraction</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Moderate?.TrimFraction || 0} 
                    onChange={(e) => updateStrategy("Moderate", "TrimFraction", parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Lowest Price Index</Label>
                  <Input 
                    type="number"
                    value={strategies?.Moderate?.LowestPriceIndex || 0}
                    onChange={(e) => updateStrategy("Moderate", "LowestPriceIndex", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Percentage Adjustment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Moderate?.PercentageAdjustment || 0} 
                    onChange={(e) => updateStrategy("Moderate", "PercentageAdjustment", parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Fixed Adjustment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Moderate?.FixedAdjustment || 0} 
                    onChange={(e) => updateStrategy("Moderate", "FixedAdjustment", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conservative" className="pt-4">
          <Card>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Market Average</Label>
                  <Select
                    value={strategies?.Conservative?.MarketAverage || "Mean"}
                    onValueChange={(value) => updateStrategy("Conservative", "MarketAverage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Trim Fraction</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Conservative?.TrimFraction || 0} 
                    onChange={(e) => updateStrategy("Conservative", "TrimFraction", parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Lowest Price Index</Label>
                  <Input 
                    type="number"
                    value={strategies?.Conservative?.LowestPriceIndex || 0}
                    onChange={(e) => updateStrategy("Conservative", "LowestPriceIndex", parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Percentage Adjustment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Conservative?.PercentageAdjustment || 0} 
                    onChange={(e) => updateStrategy("Conservative", "PercentageAdjustment", parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Fixed Adjustment</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={strategies?.Conservative?.FixedAdjustment || 0} 
                    onChange={(e) => updateStrategy("Conservative", "FixedAdjustment", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategiesForm;
