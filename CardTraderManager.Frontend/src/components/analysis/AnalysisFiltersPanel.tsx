
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AnalysisFilters } from "@/types/analysis";

const CONDITIONS = [
  "Near Mint",
  "Slightly Played",
  "Moderately Played",
  "Heavily Played",
  "Damaged",
];

interface AnalysisFiltersPanelProps {
  filters: AnalysisFilters;
  onChange: (filters: AnalysisFilters) => void;
}

export const AnalysisFiltersPanel = ({ filters, onChange }: AnalysisFiltersPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilterCount = [
    filters.minPrice != null,
    filters.maxPrice != null,
    filters.cardName,
    filters.conditions && filters.conditions.length > 0,
    filters.isFoil != null,
  ].filter(Boolean).length;

  const handleClear = () => {
    onChange({});
  };

  const toggleCondition = (condition: string) => {
    const current = filters.conditions || [];
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition];
    onChange({ ...filters, conditions: updated.length > 0 ? updated : null });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="h-8 px-2 text-muted-foreground">
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <CollapsibleContent>
        <div className="mt-3 p-4 border rounded-lg bg-muted/30 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card Name */}
            <div className="space-y-2">
              <Label htmlFor="filterCardName" className="text-sm font-medium">Card Name</Label>
              <Input
                id="filterCardName"
                placeholder="Search by name..."
                value={filters.cardName || ""}
                onChange={(e) => onChange({ ...filters, cardName: e.target.value || null })}
              />
            </div>

            {/* Min Price */}
            <div className="space-y-2">
              <Label htmlFor="filterMinPrice" className="text-sm font-medium">Min Price (€)</Label>
              <Input
                id="filterMinPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={filters.minPrice ?? ""}
                onChange={(e) => onChange({
                  ...filters,
                  minPrice: e.target.value ? parseFloat(e.target.value) : null
                })}
              />
            </div>

            {/* Max Price */}
            <div className="space-y-2">
              <Label htmlFor="filterMaxPrice" className="text-sm font-medium">Max Price (€)</Label>
              <Input
                id="filterMaxPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="No limit"
                value={filters.maxPrice ?? ""}
                onChange={(e) => onChange({
                  ...filters,
                  maxPrice: e.target.value ? parseFloat(e.target.value) : null
                })}
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Conditions</Label>
            <div className="flex flex-wrap gap-3">
              {CONDITIONS.map(condition => (
                <label key={condition} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.conditions?.includes(condition) ?? false}
                    onCheckedChange={() => toggleCondition(condition)}
                  />
                  <span className="text-sm">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Foil Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Foil</Label>
            <Select
              value={filters.isFoil === true ? "foil" : filters.isFoil === false ? "nonfoil" : "all"}
              onValueChange={(value) => onChange({
                ...filters,
                isFoil: value === "foil" ? true : value === "nonfoil" ? false : null
              })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="foil">Foil Only</SelectItem>
                <SelectItem value="nonfoil">Non-Foil Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
