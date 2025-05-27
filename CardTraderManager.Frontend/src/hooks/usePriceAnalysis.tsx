import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { PriceAnalysisResult, StartPriceUpdateRequest } from '@/types/analysis';
import { getApiUrl, API_CONFIG } from '@/config/api';

interface UsePriceAnalysisProps {
  jsonData: any;
  addLog: (message: string) => void;
  connectToLogStream: () => void;
}

export const usePriceAnalysis = ({ jsonData, addLog, connectToLogStream }: UsePriceAnalysisProps) => {
  const [analysisResult, setAnalysisResult] = useState<PriceAnalysisResult | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  
  // AbortController refs for cancelling requests
  const analysisAbortControllerRef = useRef<AbortController | null>(null);
  const confirmAbortControllerRef = useRef<AbortController | null>(null);

  const extractPriceUpdates = async () => {
    setIsLoading(true);
    
    // Create new AbortController for this request
    analysisAbortControllerRef.current = new AbortController();
    
    // Connect to log stream when starting price update
    connectToLogStream();
    
    try {
      addLog("Starting price analysis operation...");
      
      // Get API URL based on environment
      const apiUrl = getApiUrl(API_CONFIG.endpoints.extractPriceUpdates);
      
      addLog(`Using API base URL: ${API_CONFIG.baseUrl}`);
      addLog(`Calling endpoint: ${apiUrl}`);
      addLog(`Sending application settings to the API`);
      
      // Create the request object matching the API expected format
      const requestData: StartPriceUpdateRequest = {
        ApplicationSettings: jsonData
      };
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal: analysisAbortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      addLog("Response received from server");
      
      // Analyze server response
      const resultData = await response.json();
      console.log("API response:", resultData);
      
      // If the server returns a success message directly
      if (typeof resultData === 'string') {
        addLog(`Server response: ${resultData}`);
        toast.success("Price analysis completed successfully");
        return;
      } 
      
      // Process the response data - ensuring proper case mapping
      if (resultData) {
        // Handle API response with C# naming conventions (PascalCase)
        const normalizedResult: PriceAnalysisResult = {
          priceChanges: resultData.PriceChanges || resultData.priceChanges || [],
          isSuccess: resultData.IsSuccess !== undefined ? resultData.IsSuccess : resultData.isSuccess,
          errorMessage: resultData.ErrorMessage || resultData.errorMessage || null,
          elapsedTime: resultData.ElapsedTime || resultData.elapsedTime || "00:00:00",
          analysisDate: resultData.AnalysisDate || resultData.analysisDate || new Date().toISOString()
        };
        
        addLog("Analyzing received results");
        
        // Calculate price change for display
        if (Array.isArray(normalizedResult.priceChanges)) {
          normalizedResult.priceChanges.forEach(item => {
            // Use the priceChange from the API if it exists, otherwise calculate it
            if (item.priceChange === undefined) {
              item.priceChange = item.newPrice - item.oldPrice;
            }
            addLog(`Card ${item.cardName}: from €${item.oldPrice} to €${item.newPrice} (${item.priceChange > 0 ? '+' : ''}${item.priceChange.toFixed(2)})`);
          });
        }
        
        setAnalysisResult(normalizedResult);
        setIsAnalysisOpen(true);
        
        // IMPORTANT: Always show results if we have price changes, regardless of isSuccess flag
        if (normalizedResult.priceChanges && normalizedResult.priceChanges.length > 0) {
          const changeCount = normalizedResult.priceChanges.length;
          
          if (normalizedResult.isSuccess) {
            toast.success(`Price analysis completed with ${changeCount} updates found`);
          } else {
            // Even if isSuccess is false, we still show the data if we have price changes
            toast.info(`Retrieved ${changeCount} price updates for review`);
            addLog(`Found ${changeCount} price updates to review. Status: Pending`);
          }
        } else if (normalizedResult.isSuccess) {
          toast.success("Price analysis completed successfully");
        } else if (normalizedResult.errorMessage) {
          // Only show error toast if there's an actual error message
          toast.error(`Error analyzing prices: ${normalizedResult.errorMessage}`);
        } else {
          // If isSuccess is false but we have no error message and no changes, show an info message
          toast.info("No price changes detected");
          addLog("Analysis complete, no price changes detected");
        }
      } else {
        // To handle other unexpected responses
        addLog("Operation completed, but no detailed results received.");
        toast.success("Operation completed successfully");
      }
    } catch (error) {
      // Handle cancellation specifically
      if (error instanceof Error && error.name === 'AbortError') {
        addLog("Price analysis operation was cancelled by user");
        toast.info("Price analysis cancelled");
        return;
      }
      
      addLog(`ERROR: Unable to complete price analysis operation: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Error in price analysis operation");
      console.error("Price analysis error:", error);
      
      // Show error dialog even when there's an exception
      setAnalysisResult({
        priceChanges: [],
        isSuccess: false,
        errorMessage: error instanceof Error ? error.message : String(error),
        elapsedTime: "00:00:00",
        analysisDate: new Date().toISOString()
      });
      setIsAnalysisOpen(true);
    } finally {
      setIsLoading(false);
      analysisAbortControllerRef.current = null;
    }
  };

  const cancelAnalysis = () => {
    if (analysisAbortControllerRef.current) {
      analysisAbortControllerRef.current.abort();
      addLog("Cancelling price analysis operation...");
      toast.info("Cancelling analysis...");
    }
  };

  const confirmPriceUpdates = async () => {
    if (!analysisResult) {
      toast.error("No price analysis results to confirm");
      return;
    }
    
    setIsConfirming(true);
    
    // Create new AbortController for this request
    confirmAbortControllerRef.current = new AbortController();
    
    addLog("Confirming price updates...");
    
    try {
      const apiUrl = getApiUrl(API_CONFIG.endpoints.postPriceUpdates);
      
      addLog(`Calling endpoint: ${apiUrl}`);
      
      if (analysisResult.priceChanges && analysisResult.priceChanges.length > 0) {
        addLog(`Sending ${analysisResult.priceChanges.length} price updates to apply`);
      } else {
        addLog("No price changes to apply");
      }
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(analysisResult),
        signal: confirmAbortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const resultData = await response.json();
      console.log("API response:", resultData);
      
      // If the server returns a success message directly
      if (typeof resultData === 'string') {
        addLog(`Server response: ${resultData}`);
        toast.success("Price update completed successfully");
        return;
      } 
      
      // Process the response data - ensuring proper case mapping
      if (resultData) {
        // Handle API response with C# naming conventions (PascalCase)
        const normalizedResult: PriceAnalysisResult = {
          priceChanges: resultData.PriceChanges || resultData.priceChanges || [],
          isSuccess: resultData.IsSuccess !== undefined ? resultData.IsSuccess : resultData.isSuccess,
          errorMessage: resultData.ErrorMessage || resultData.errorMessage || null,
          elapsedTime: resultData.ElapsedTime || resultData.elapsedTime || "00:00:00",
          analysisDate: resultData.AnalysisDate || resultData.analysisDate || new Date().toISOString()
        };
        
        addLog("update received results");
        
        // Calculate price change for display
        if (Array.isArray(normalizedResult.priceChanges)) {
          normalizedResult.priceChanges.forEach(item => {
            if (item.oldPrice > 0) {
              const priceChange = item.newPrice - item.oldPrice;
              item.priceChange = priceChange;
              addLog(`Card ${item.cardName}: from €${item.oldPrice} to €${item.newPrice} (${priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)})`);
            }
          });
        }
        
        setAnalysisResult(normalizedResult);
        setIsAnalysisOpen(true);
        
        // Even if isSuccess is false, we still show the data if we have price changes
        if (normalizedResult.isSuccess) {
          toast.success("Price update completed successfully");
        } else if (normalizedResult.errorMessage) {
          // Only show error toast if there's an actual error message
          toast.error(`Error update prices: ${normalizedResult.errorMessage}`);
        } else if (normalizedResult.priceChanges && normalizedResult.priceChanges.length > 0) {
          // If we have price changes but isSuccess is false (without error), consider it a partial success
          toast.success(`Retrieved ${normalizedResult.priceChanges.length} price updates`);
          addLog(`Found ${normalizedResult.priceChanges.length} price updates to review`);
        } else {
          // Generic message if we have no clear success or error indicators
          toast.info("Price update completed with no changes detected");
        }
      } else {
        // To handle other unexpected responses
        addLog("Price updates successfully applied");
        toast.success("Price updates have been successfully applied");
      }
    } catch (error) {
      // Handle cancellation specifically
      if (error instanceof Error && error.name === 'AbortError') {
        addLog("Price update operation was cancelled by user");
        toast.info("Price update cancelled");
        return;
      }
      
      addLog(`ERROR: Failed to apply price updates: ${error instanceof Error ? error.message : String(error)}`);
      toast.error("Error applying price updates");
      console.error("Price update confirmation error:", error);
    } finally {
      setIsConfirming(false);
      confirmAbortControllerRef.current = null;
    }
  };

  const cancelConfirmation = () => {
    if (confirmAbortControllerRef.current) {
      confirmAbortControllerRef.current.abort();
      addLog("Cancelling price update operation...");
      toast.info("Cancelling update...");
    }
  };

  return {
    analysisResult,
    setAnalysisResult,
    isAnalysisOpen,
    setIsAnalysisOpen,
    isLoading,
    isConfirming,
    extractPriceUpdates,
    confirmPriceUpdates,
    cancelAnalysis,
    cancelConfirmation,
  };
};
