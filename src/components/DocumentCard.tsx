import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Document } from "../services/documentService";

interface DocumentProps {
  document: Document;
  onView?: (document: Document) => void;
  onDelete?: (documentId: number) => void;
}

export default function DocumentCard({
  document,
  onView,
  onDelete,
}: DocumentProps) {
  return (
    <Card className="flex flex-col w-80 h-80 mr-4 p-4">
      <CardHeader>
        <CardTitle className="text-md font-bold text-center">
          {document.filename}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-gray-600">
          Uploaded: {new Date(document.created_at).toLocaleDateString()}
        </p>
        {document.description && (
          <p className="text-sm text-gray-600 mt-2">{document.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {onView && (
          <Button
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onView(document)}
          >
            View
          </Button>
        )}
        {onDelete && (
          <Button
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
            onClick={() => onDelete(document.id)}
          >
            Delete
          </Button>
        )}
        {!onView && !onDelete && (
          <Button className="w-full bg-gray-200 mb-5">View</Button>
        )}
      </CardFooter>
    </Card>
  );
}
