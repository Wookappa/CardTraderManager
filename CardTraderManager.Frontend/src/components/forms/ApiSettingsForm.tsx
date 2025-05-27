
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Clipboard, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ApiSettingsFormProps {
  data: any;
  onChange: (data: any) => void;
}

const ApiSettingsForm = ({ data, onChange }: ApiSettingsFormProps) => {
  const [showToken, setShowToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const handleChange = (field: string, value: any) => {
    const updated = {
      ...data,
      CardTrader: {
        ...data?.CardTrader,
        [field]: value
      }
    };
    onChange(updated);
  };

  const copyToken = () => {
    const token = data?.CardTrader?.JWTToken || "";
    if (token) {
      navigator.clipboard.writeText(token).then(() => {
        toast.success("JWT Token copied to clipboard");
      }).catch(err => {
        toast.error("Failed to copy token");
      });
    }
  };

  const testConnection = async () => {
    const token = data?.CardTrader?.JWTToken;
    if (!token) {
      toast.error("JWT Token is required for connection test");
      return;
    }

    setTestingConnection(true);
    try {
      const response = await fetch("https://api.cardtrader.com/api/v2/info", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("API connection successful!", {
          description: `Connected to CardTrader API v${data.version || '2'}`
        });
      } else {
        throw new Error(`API returned status: ${response.status}`);
      }
    } catch (error) {
      toast.error("Connection test failed", {
        description: error instanceof Error ? error.message : "Unable to connect to CardTrader API"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
        <CardDescription>Configure CardTrader API authentication credentials</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="jwtToken">JWT Token</Label>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setShowToken(!showToken)} 
                title={showToken ? "Hide token" : "Show token"}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={copyToken}
                title="Copy token"
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Input
              id="jwtToken"
              type={showToken ? "text" : "password"}
              value={data?.CardTrader?.JWTToken || ""}
              onChange={(e) => handleChange("JWTToken", e.target.value)}
              placeholder="Enter your JWT token"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your CardTrader API JWT token is used to authenticate your requests.
          </p>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">API Connection Test</h4>
              <p className="text-xs text-muted-foreground">Verify your API credentials are working correctly</p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={testConnection}
              disabled={testingConnection || !data?.CardTrader?.JWTToken}
              className="gap-2"
            >
              {testingConnection ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Testing...
                </>
              ) : (
                <>Test Connection</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiSettingsForm;
