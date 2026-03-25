
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Terminal, X, Power, PowerOff } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type ConnectionStatus = 'disconnected' | 'connected' | 'reconnecting';

interface LogsViewerProps {
  logs: string[];
  showLogs: boolean;
  setShowLogs: (show: boolean) => void;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  connectToLogStream: () => void;
  disconnectLogStream: () => void;
  setLogs: (logs: string[]) => void;
}

const statusConfig: Record<ConnectionStatus, { label: string; className: string }> = {
  connected: { label: 'Connected', className: 'text-green-600' },
  reconnecting: { label: 'Reconnecting...', className: 'text-yellow-500 animate-pulse' },
  disconnected: { label: 'Disconnected', className: 'text-orange-600' },
};

export const LogsViewer = ({
  logs,
  showLogs,
  setShowLogs,
  connectionStatus,
  connectToLogStream,
  disconnectLogStream,
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
  
  const handleClearLogs = () => {
    setLogs([]);
  };

  const status = statusConfig[connectionStatus];
  
  return (
    <Drawer open={showLogs} onOpenChange={setShowLogs} modal={false}>
      <DrawerContent className="max-h-[80vh]">
        <div className="mx-auto w-full max-w-7xl">
          <DrawerHeader className="flex flex-row items-center justify-between border-b pb-2">
            <DrawerTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Live Logs
              <span className={`text-xs font-normal ${status.className}`}>({status.label})</span>
            </DrawerTitle>
            <DrawerDescription className="sr-only">Real-time application logs</DrawerDescription>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' && (
                <Button size="sm" variant="outline" onClick={disconnectLogStream}>
                  <PowerOff className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              )}
              {connectionStatus !== 'connected' && (
                <Button size="sm" variant="outline" onClick={connectToLogStream}>
                  <Power className="h-4 w-4 mr-1" />
                  {connectionStatus === 'reconnecting' ? 'Reconnect Now' : 'Connect'}
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
