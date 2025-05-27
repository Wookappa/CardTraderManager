
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralSettingsTab from "./strategies/GeneralSettingsTab";
import CustomRulesForm from "./CustomRulesForm";
import StrategiesForm from "./StrategiesForm";

interface UpdateStrategiesFormProps {
  data: any;
  onChange: (data: any) => void;
}

const UpdateStrategiesForm = ({ data, onChange }: UpdateStrategiesFormProps) => {
  const [activeTab, setActiveTab] = useState("general");

  const handleChange = (field: string, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Strategies Configuration</CardTitle>
          <CardDescription>Manage how card prices are updated</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="customRules">Custom Rules</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <GeneralSettingsTab 
                data={data} 
                onChange={handleChange} 
              />
            </TabsContent>
            
            <TabsContent value="customRules" className="space-y-4">
              <CustomRulesForm 
                rules={data?.CustomRules || []} 
                onChange={(rules) => handleChange("CustomRules", rules)} 
              />
            </TabsContent>
            
            <TabsContent value="strategies" className="space-y-4">
              <StrategiesForm 
                strategies={data?.Strategies || {}} 
                onChange={(strategies) => handleChange("Strategies", strategies)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateStrategiesForm;
