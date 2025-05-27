
import { Card } from "@/components/ui/card";

interface JsonPreviewProps {
  jsonData: any;
}

export const JsonPreview = ({ jsonData }: JsonPreviewProps) => {
  return (
    <Card className="md:col-span-1 p-4 json-editor-gradient">
      <div className="space-y-4">
        <h2 className="text-xl font-bold">JSON Preview</h2>
        <pre className="bg-background/80 p-4 rounded-md text-xs overflow-auto max-h-[70vh] border">
          {JSON.stringify({ ApplicationSettings: jsonData }, null, 2)}
        </pre>
      </div>
    </Card>
  );
};
