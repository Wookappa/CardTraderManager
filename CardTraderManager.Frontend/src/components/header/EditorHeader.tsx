
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileJson, Save, Play, Terminal, X } from "lucide-react";

interface EditorHeaderProps {
  onBack: () => void;
  copyToClipboard: () => void;
  downloadJson: () => void;
  extractPriceUpdates: () => void;
  isLoading: boolean;
  showLogs: boolean;
  setShowLogs: (show: boolean) => void;
  cancelAnalysis?: () => void;
}

export const EditorHeader = ({
  onBack,
  copyToClipboard,
  downloadJson,
  extractPriceUpdates,
  isLoading,
  showLogs,
  setShowLogs,
  cancelAnalysis
}: EditorHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShowLogs(!showLogs)}>
          <Terminal className="h-4 w-4 mr-2" />
          {showLogs ? 'Hide Logs' : 'Show Logs'}
        </Button>
        <Button variant="outline" onClick={copyToClipboard}>
          <FileJson className="h-4 w-4 mr-2" />
          Copy JSON
        </Button>
        <Button onClick={downloadJson}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
        {isLoading ? (
          <Button 
            variant="destructive" 
            onClick={cancelAnalysis}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel Analysis
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="bg-green-600 hover:bg-green-700 text-white" 
            onClick={extractPriceUpdates}
          >
            <Play className="h-4 w-4 mr-2" />
            Analyze Prices
          </Button>
        )}
      </div>
    </div>
  );
};
