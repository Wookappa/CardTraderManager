
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiSettingsForm from "../forms/ApiSettingsForm";
import PriceProtectionForm from "../forms/PriceProtectionForm";
import UpdateStrategiesForm from "../forms/UpdateStrategiesForm";

interface EditorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  jsonData: any;
  handleDataChange: (section: string, data: any) => void;
}

export const EditorTabs = ({
  activeTab,
  setActiveTab,
  jsonData,
  handleDataChange,
}: EditorTabsProps) => {
  return (
    <Tabs defaultValue="api" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="api">API Settings</TabsTrigger>
        <TabsTrigger value="protection">Price Protection</TabsTrigger>
        <TabsTrigger value="strategies">Update Strategies</TabsTrigger>
      </TabsList>
      
      <TabsContent value="api" className="space-y-4">
        <ApiSettingsForm 
          data={jsonData.ApiSettings} 
          onChange={(data) => handleDataChange("ApiSettings", data)}
        />
      </TabsContent>
      
      <TabsContent value="protection" className="space-y-4">
        <PriceProtectionForm 
          data={jsonData.PriceProtectionSettings} 
          onChange={(data) => handleDataChange("PriceProtectionSettings", data)}
        />
      </TabsContent>
      
      <TabsContent value="strategies" className="space-y-4">
        <UpdateStrategiesForm 
          data={jsonData.UpdateStrategiesConfig} 
          onChange={(data) => handleDataChange("UpdateStrategiesConfig", data)}
        />
      </TabsContent>
    </Tabs>
  );
};
