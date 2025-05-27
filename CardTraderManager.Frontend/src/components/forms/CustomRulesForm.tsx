
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";

interface CustomRulesFormProps {
  rules: any[];
  onChange: (rules: any[]) => void;
}

const CustomRulesForm = ({ rules, onChange }: CustomRulesFormProps) => {
  const handleAddRule = () => {
    const newRule = {
      PriceAdjustmentType: "LowestPriceIndex",
      MinPriceRange: 0,
      MaxPriceRange: 10,
      LowestPriceIndex: 0,
      MinAllowedPrice: 0.1
    };
    
    onChange([...rules, newRule]);
    toast.success("New custom rule added");
  };

  const handleDeleteRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    onChange(newRules);
    toast.success("Custom rule deleted");
  };

  const updateRule = (index: number, field: string, value: any) => {
    const newRules = [...rules];
    newRules[index] = {
      ...newRules[index],
      [field]: value
    };
    onChange(newRules);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Custom Rules</h3>
        <Button onClick={handleAddRule} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          No custom rules defined. Click "Add Rule" to create one.
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {rules.map((rule, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border rounded-md">
              <AccordionTrigger className="px-4">
                <div className="flex justify-between items-center w-full">
                  <span>
                    Rule {index + 1}: {rule.ItemName ? `"${rule.ItemName}"` : `Price range ${rule.MinPriceRange} - ${rule.MaxPriceRange}`}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRule(index);
                    }}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CardContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rule Type</Label>
                      <Select
                        value={rule.ItemName ? "specific" : "priceRange"}
                        onValueChange={(value) => {
                          const newRule = value === "specific" 
                            ? { 
                                ItemName: "", 
                                Condition: "Near Mint", 
                                PriceAdjustmentType: "FixedPrice",
                                FixedAdjustment: 0
                              } 
                            : {
                                MinPriceRange: 0,
                                MaxPriceRange: 100,
                                PriceAdjustmentType: "LowestPriceIndex",
                                LowestPriceIndex: 0,
                                MinAllowedPrice: 0.1
                              };
                          
                          onChange([
                            ...rules.slice(0, index),
                            newRule,
                            ...rules.slice(index + 1)
                          ]);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="specific">Specific Item</SelectItem>
                          <SelectItem value="priceRange">Price Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Fields for Specific Item */}
                    {rule.ItemName !== undefined && (
                      <>
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          <Input 
                            value={rule.ItemName || ""} 
                            onChange={(e) => updateRule(index, "ItemName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Condition</Label>
                          <Input 
                            value={rule.Condition || ""} 
                            onChange={(e) => updateRule(index, "Condition", e.target.value)}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Fields for Price Range */}
                    {rule.MinPriceRange !== undefined && (
                      <>
                        <div className="space-y-2">
                          <Label>Min Price Range</Label>
                          <Input 
                            type="number"
                            value={rule.MinPriceRange || 0} 
                            onChange={(e) => updateRule(index, "MinPriceRange", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Price Range</Label>
                          <Input 
                            type="number"
                            value={rule.MaxPriceRange || 0} 
                            onChange={(e) => updateRule(index, "MaxPriceRange", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Common Fields */}
                    <div className="space-y-2">
                      <Label>Price Adjustment Type</Label>
                      <Select
                        value={rule.PriceAdjustmentType || "LowestPriceIndex"}
                        onValueChange={(value) => updateRule(index, "PriceAdjustmentType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LowestPriceIndex">Lowest Price Index</SelectItem>
                          <SelectItem value="FixedPrice">Fixed Price</SelectItem>
                          <SelectItem value="Percentage">Percentage</SelectItem>
                          <SelectItem value="FixedAdjustment">Fixed Adjustment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Conditional Fields Based on PriceAdjustmentType */}
                    {rule.PriceAdjustmentType === "LowestPriceIndex" && (
                      <div className="space-y-2">
                        <Label>Lowest Price Index</Label>
                        <Input 
                          type="number"
                          value={rule.LowestPriceIndex || 0} 
                          onChange={(e) => updateRule(index, "LowestPriceIndex", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    )}
                    
                    {rule.PriceAdjustmentType === "FixedPrice" && (
                      <div className="space-y-2">
                        <Label>Fixed Price</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={rule.FixedAdjustment || 0} 
                          onChange={(e) => updateRule(index, "FixedAdjustment", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    )}
                    
                    {rule.PriceAdjustmentType === "Percentage" && (
                      <div className="space-y-2">
                        <Label>Percentage Adjustment</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={rule.PercentageAdjustment || 0} 
                          onChange={(e) => updateRule(index, "PercentageAdjustment", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    )}
                    
                    {rule.PriceAdjustmentType === "FixedAdjustment" && (
                      <div className="space-y-2">
                        <Label>Fixed Adjustment</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={rule.FixedAdjustment || 0} 
                          onChange={(e) => updateRule(index, "FixedAdjustment", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    )}
                    
                    {(rule.PriceAdjustmentType === "Percentage" || 
                      rule.PriceAdjustmentType === "FixedAdjustment") && (
                      <div className="space-y-2">
                        <Label>Market Average</Label>
                        <Select
                          value={rule.MarketAverage || "Mean"}
                          onValueChange={(value) => updateRule(index, "MarketAverage", value)}
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
                    )}
                    
                    {rule.MarketAverage === "TrimmedMean" && (
                      <div className="space-y-2">
                        <Label>Trim Fraction</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={rule.TrimFraction || 0} 
                          onChange={(e) => updateRule(index, "TrimFraction", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    )}
                    
                    {rule.MinPriceRange !== undefined && (
                      <div className="space-y-2">
                        <Label>Minimum Allowed Price</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={rule.MinAllowedPrice || 0} 
                          onChange={(e) => updateRule(index, "MinAllowedPrice", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default CustomRulesForm;
