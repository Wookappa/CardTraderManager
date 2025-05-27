
import { JsonPreview } from "../preview/JsonPreview";
import { EditorTabs } from "./EditorTabs";

interface EditorLayoutProps {
  jsonData: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleDataChange: (section: string, data: any) => void;
}

export const EditorLayout = ({
  jsonData,
  activeTab,
  setActiveTab,
  handleDataChange,
}: EditorLayoutProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <JsonPreview jsonData={jsonData} />
      
      <div className="md:col-span-2 space-y-6">
        <EditorTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          jsonData={jsonData}
          handleDataChange={handleDataChange}
        />
      </div>
    </div>
  );
};
