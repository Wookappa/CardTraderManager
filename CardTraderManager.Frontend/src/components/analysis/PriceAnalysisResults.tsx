
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceAnalysisResult } from "@/types/analysis";
import { useState } from "react";
import { X } from "lucide-react";

interface PriceChangeDetail {
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

interface PriceAnalysisResultsProps {
  isAnalysisOpen: boolean;
  setIsAnalysisOpen: (open: boolean) => void;
  analysisResult: PriceAnalysisResult | null;
  confirmPriceUpdates: () => void;
  isConfirming: boolean;
  cancelConfirmation?: () => void;
}

export const PriceAnalysisResults = ({
  isAnalysisOpen,
  setIsAnalysisOpen,
  analysisResult,
  confirmPriceUpdates,
  isConfirming,
  cancelConfirmation
}: PriceAnalysisResultsProps) => {
  const [editablePrices, setEditablePrices] = useState<{[key: number]: number}>({});

  const handlePriceEdit = (itemId: number, newPrice: number) => {
    setEditablePrices(prev => ({
      ...prev,
      [itemId]: newPrice
    }));
  };

  const getDisplayPrice = (item: PriceChangeDetail) => {
    return editablePrices[item.itemId] !== undefined ? editablePrices[item.itemId] : item.newPrice;
  };

  const handleConfirmWithEdits = () => {
    // Update the analysis result with edited prices before confirming
    if (analysisResult && Object.keys(editablePrices).length > 0) {
      const updatedPriceChanges = analysisResult.priceChanges.map(item => {
        if (editablePrices[item.itemId] !== undefined) {
          const newPrice = editablePrices[item.itemId];
          return {
            ...item,
            newPrice: newPrice,
            priceChange: newPrice - item.oldPrice
          };
        }
        return item;
      });
      
      // Update the analysis result object
      analysisResult.priceChanges = updatedPriceChanges;
    }
    
    confirmPriceUpdates();
  };

  return (
    <Sheet open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
      <SheetContent className="w-full sm:max-w-[95vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Price Update Results</SheetTitle>
            <SheetDescription>
              Analysis performed on {analysisResult?.analysisDate ? new Date(analysisResult.analysisDate).toLocaleString() : ''}
              {analysisResult?.elapsedTime && ` (completed in ${analysisResult.elapsedTime.split('.')[0]})`}
              <br />
              <span className="text-sm text-blue-600">You can edit the new prices before applying the updates</span>
            </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          {analysisResult ? (
            <div className="space-y-4">
              {/* Success message or info based on response */}
              {analysisResult.isSuccess ? (
                <div className="bg-green-50 p-3 rounded-md border border-green-200 text-green-800">
                  Price analysis completed successfully with {analysisResult.priceChanges.filter(p => p.updated).length} 
                  {' '}changes out of {analysisResult.priceChanges.length} items analyzed.
                </div>
              ) : analysisResult.errorMessage ? (
                <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
                  {analysisResult.errorMessage}
                </div>
              ) : analysisResult.priceChanges && analysisResult.priceChanges.length > 0 ? (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-yellow-800">
                  Retrieved {analysisResult.priceChanges.length} price changes for review. Edit prices if needed, then click "Apply Price Updates" to confirm.
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-gray-800">
                  No price changes were detected or available for review.
                </div>
              )}
              
              {/* Price changes table - always show if we have data, regardless of isSuccess */}
              {analysisResult.priceChanges && analysisResult.priceChanges.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Name</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Min Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Max Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Median</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Old Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">New Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analysisResult.priceChanges.map((item) => {
                        const displayPrice = getDisplayPrice(item);
                        const priceChange = displayPrice - item.oldPrice;
                        const percentChange = item.oldPrice > 0 ? (priceChange / item.oldPrice) * 100 : 0;
                        
                        return (
                          <tr key={item.itemId}>
                            <td className="px-4 py-2 whitespace-nowrap">{item.cardName}</td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">€{item.minPrice.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">€{item.maxPrice.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">€{item.median.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">€{item.oldPrice.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">
                              <div className="flex justify-end">
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={displayPrice.toFixed(2)}
                                  onChange={(e) => handlePriceEdit(item.itemId, parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8 text-right text-sm"
                                />
                              </div>
                            </td>
                            <td className={`px-4 py-2 text-right whitespace-nowrap ${priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : ''}`}>
                              {priceChange !== 0 ? (
                                <>
                                  {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)} 
                                  <span className="text-xs ml-1">({percentChange.toFixed(1)}%)</span>
                                </>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="px-4 py-2 text-center whitespace-nowrap">
                              {item.updated ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Updated</span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800" title={item.warning || ''}>
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-800">
              No data available for analysis.
            </div>
          )}
          
          <SheetFooter className="mt-6 gap-2">
            <Button variant="outline" onClick={() => setIsAnalysisOpen(false)}>Cancel</Button>
            {analysisResult && (analysisResult.isSuccess || (analysisResult.priceChanges && analysisResult.priceChanges.length > 0)) && (
              <>
                {isConfirming ? (
                  <Button 
                    variant="destructive" 
                    onClick={cancelConfirmation}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Update
                  </Button>
                ) : (
                  <Button 
                    onClick={handleConfirmWithEdits} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Apply Price Updates
                  </Button>
                )}
              </>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};
