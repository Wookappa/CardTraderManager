
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Terminal, X, Power } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAutoScroll(isAtBottom);
  };
  
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
    <Drawer open={showLogs} onOpenChange={setShowLogs} modal={false}>
      <DrawerContent className="max-h-[80vh]">
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DrawerTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Live Logs {isConnected ? 
                <span className="text-xs font-normal text-green-600">(Connected)</span> : 
                <span className="text-xs font-normal text-orange-600">(Disconnected)</span>}
            </DrawerTitle>
            <DrawerDescription className="sr-only">Real-time application logs</DrawerDescription>
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
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="h-full w-full border rounded-md bg-black text-white font-mono p-2 text-sm overflow-y-auto"
            >
              {logs.map((log, index) => (
                <div key={index} className="py-1 border-b border-gray-800">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
