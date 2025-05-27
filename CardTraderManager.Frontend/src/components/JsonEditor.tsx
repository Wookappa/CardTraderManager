
import { useState } from "react";
import { EditorHeader } from "./header/EditorHeader";
import { EditorLayout } from "./editor/EditorLayout";
import { LogsViewer } from "./viewer/LogsViewer";
import { PriceAnalysisResults } from "./analysis/PriceAnalysisResults";
import { useWebSocketLogs } from "@/hooks/useWebSocketLogs";
import { usePriceAnalysis } from "@/hooks/usePriceAnalysis";
import { useJsonUtilities } from "@/hooks/useJsonUtilities";

interface JsonEditorProps {
  initialData: any;
  onBack: () => void;
}

const JsonEditor = ({ initialData, onBack }: JsonEditorProps) => {
  const [jsonData, setJsonData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("api");

  // Custom hooks for different functionalities
  const { 
    logs, 
    setLogs, 
    isConnected, 
    showLogs, 
    setShowLogs, 
    addLog, 
    connectToLogStream 
  } = useWebSocketLogs();
  
  const {
    analysisResult,
    isAnalysisOpen,
    setIsAnalysisOpen,
    isLoading,
    isConfirming,
    extractPriceUpdates,
    confirmPriceUpdates,
    cancelAnalysis,
    cancelConfirmation
  } = usePriceAnalysis({ jsonData, addLog, connectToLogStream });
  
  const { downloadJson, copyToClipboard } = useJsonUtilities(jsonData);

  const handleDataChange = (section: string, data: any) => {
    setJsonData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleStartAnalysis = () => {
    setLogs([]);
    setShowLogs(true);
    extractPriceUpdates();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <EditorHeader
        onBack={onBack}
        copyToClipboard={copyToClipboard}
        downloadJson={downloadJson}
        extractPriceUpdates={handleStartAnalysis}
        isLoading={isLoading}
        showLogs={showLogs}
        setShowLogs={setShowLogs}
        cancelAnalysis={cancelAnalysis}
      />
      
      <LogsViewer
        logs={logs}
        showLogs={showLogs}
        setShowLogs={setShowLogs}
        isConnected={isConnected}
        connectToLogStream={connectToLogStream}
        setLogs={setLogs}
      />
      
      <EditorLayout 
        jsonData={jsonData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleDataChange={handleDataChange}
      />

      <PriceAnalysisResults
        isAnalysisOpen={isAnalysisOpen}
        setIsAnalysisOpen={setIsAnalysisOpen}
        analysisResult={analysisResult}
        confirmPriceUpdates={confirmPriceUpdates}
        isConfirming={isConfirming}
        cancelConfirmation={cancelConfirmation}
      />
    </div>
  );
};

export default JsonEditor;
