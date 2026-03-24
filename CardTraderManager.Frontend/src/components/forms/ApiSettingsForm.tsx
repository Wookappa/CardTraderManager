
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Clipboard, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";

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
      const response = await fetch(getApiUrl("/api/PriceUpdate/TestConnection"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ jwtToken: token })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("API connection successful!", {
          description: `Connected to CardTrader API (${result.gamesCount} games available)`
        });
      } else {
        let errorMessage = `API returned status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
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
            <Label htmlFor="jwtToken" className="flex items-center gap-1">
              JWT Token
              <span className="text-red-500">*</span>
            </Label>
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
              className={!data?.CardTrader?.JWTToken ? "border-red-300 focus:border-red-500" : ""}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="text-red-500">*</span> Required: Your CardTrader API JWT token is used to authenticate your requests.
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
