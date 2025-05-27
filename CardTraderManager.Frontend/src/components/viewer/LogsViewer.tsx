
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogScrollArea } from "@/components/ui/scroll-area";
import { Terminal, X, Power } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface LogsViewerProps {
  logs: string[];
  showLogs: boolean;
  setShowLogs: (show: boolean) => void;
  isConnected: boolean;
  connectToLogStream: () => void;
  setLogs: (logs: string[]) => void;
}

export const LogsViewer = ({
  logs,
  showLogs,
  setShowLogs,
  isConnected,
  connectToLogStream,
  setLogs,
}: LogsViewerProps) => {
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Helper function to handle connection button click
  const handleConnect = () => {
    if (!isConnected) {
      connectToLogStream();
    }
  };
  
  // Helper function to clear logs
  const handleClearLogs = () => {
    setLogs([]);
  };
  
  return (
    <Drawer open={showLogs} onOpenChange={setShowLogs}>
      <DrawerContent className="max-h-[80vh]">
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DrawerTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Live Logs {isConnected ? 
                <span className="text-xs font-normal text-green-600">(Connected)</span> : 
                <span className="text-xs font-normal text-orange-600">(Disconnected)</span>}
            </DrawerTitle>
            <div className="flex items-center gap-2">
              {!isConnected && (
                <Button size="sm" variant="outline" onClick={handleConnect}>
                  <Power className="h-4 w-4 mr-1" />
                  Connect
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={handleClearLogs}>
                Clear
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowLogs(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>
          
          <div className="p-4 h-[50vh]">
            <LogScrollArea className="h-full">
              {logs.map((log, index) => (
                <div key={index} className="py-1 border-b border-gray-200 dark:border-gray-800">
                  {log}
                </div>
              ))}
            </LogScrollArea>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
