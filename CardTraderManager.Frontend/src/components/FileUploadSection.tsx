
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileJson, Upload, Plus } from "lucide-react";
import { toast } from "sonner";

interface FileUploadSectionProps {
  onJsonLoaded: (jsonData: any) => void;
  onCreateNew: () => void;
}

const FileUploadSection = ({ onJsonLoaded, onCreateNew }: FileUploadSectionProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      parseJsonFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      parseJsonFile(file);
    }
  };

  const parseJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onJsonLoaded(json);
        toast.success("JSON file loaded successfully");
      } catch (error) {
        toast.error("Error parsing JSON file");
        console.error("Error parsing JSON:", error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Card className="card-hover-effect">
          <CardHeader>
            <CardTitle className="text-2xl">CardTrader Settings Wizard</CardTitle>
            <CardDescription>
              Configure your CardTrader settings with this interactive tool
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className={`border-2 border-dashed rounded-lg p-12 text-center ${
                isDragging ? "border-primary bg-primary/10" : "border-gray-300"
              } transition-all duration-200`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <FileJson className="h-16 w-16 text-primary/70" />
                <div className="space-y-2">
                  <h3 className="font-medium">Upload your JSON settings file</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your file here or click to browse
                  </p>
                </div>
                <Button variant="outline" className="relative">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".json"
                    onChange={handleFileChange}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={onCreateNew} variant="secondary" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create New Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default FileUploadSection;
