import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface MissingDocumentsAlertProps {
    missingDocuments: string[];
}

export function MissingDocumentsAlert({ missingDocuments }: MissingDocumentsAlertProps) {
    if (!missingDocuments || missingDocuments.length === 0) return null;

    return (
        <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Documents Detected</AlertTitle>
            <AlertDescription>
                The following documents are missing for eligible schemes:
                <ul className="list-disc list-inside mt-2">
                    {missingDocuments.map((doc, index) => (
                        <li key={index} className="capitalize">{doc}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}
