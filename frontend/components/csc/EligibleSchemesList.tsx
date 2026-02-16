import React from 'react';
import { EligibilityResult } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Extract the type of array element from EligibilityResult.eligible_schemes
type EligibleScheme = EligibilityResult['eligible_schemes'][0];

interface EligibleSchemesListProps {
    schemes: EligibleScheme[];
}

export const EligibleSchemesList: React.FC<EligibleSchemesListProps> = ({ schemes }) => {
    return (
        <Card className="border-border/60 shadow-sm">
            <CardHeader className="border-b border-border/40 bg-gray-50/30">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-teal" />
                    Matched Schemes ({schemes.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[300px]">Scheme Name</TableHead>
                            <TableHead>Eligibility Score</TableHead>
                            <TableHead>Reasoning</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schemes.map((scheme) => (
                            <TableRow key={scheme.scheme_id} className="cursor-pointer hover:bg-muted/30">
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-foreground">{scheme.scheme_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${scheme.score}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-green-700">{scheme.score}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={scheme.reasoning}>
                                    {scheme.reasoning}
                                </TableCell>
                                <TableCell>
                                    {scheme.missing_documents.length === 0 ? (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Ready
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 gap-1">
                                            <AlertCircle className="h-3 w-3" /> {scheme.missing_documents.length} Missing Docs
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" className="border-brand-saffron/30 text-brand-saffron hover:bg-brand-saffron hover:text-white transition-colors" asChild>
                                        <a href={`/schemes/${scheme.scheme_id}`} target="_blank" rel="noopener noreferrer">
                                            Start Application <ArrowRight className="ml-1 h-3 w-3" />
                                        </a>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
