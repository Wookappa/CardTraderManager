
import { toast } from 'sonner';

export const useJsonUtilities = (jsonData: any) => {
  const downloadJson = () => {
    // Create the new structure with ApplicationSettings as root
    const formattedData = {
      ApplicationSettings: jsonData
    };
    
    const dataStr = JSON.stringify(formattedData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = "card-market-settings.json";
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    
    toast.success("Settings saved successfully");
  };

  const copyToClipboard = () => {
    // Create the new structure with ApplicationSettings as root
    const formattedData = {
      ApplicationSettings: jsonData
    };
    
    const dataStr = JSON.stringify(formattedData, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      toast.success("Settings copied to clipboard");
    }).catch(err => {
      toast.error("Failed to copy settings");
      console.error("Failed to copy:", err);
    });
  };

  return {
    downloadJson,
    copyToClipboard,
  };
};
